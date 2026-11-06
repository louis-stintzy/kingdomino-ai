import type { DominoDefinition } from "./domino.js";
import { createKingdom, type Kingdom } from "./kingdom.js";
import {
  getLegalPlacements,
  placeDomino,
  validateDominoPlacement,
  type DominoPlacement,
} from "./placement.js";

export const GAME_KINGDOM_SIZE = 7;
export const GAME_DRAW_COUNT = 12;
export const DOMINOS_PER_DRAW = 5;

export type PlayerId = string;
export type PawnId = string;

export interface GamePlayer {
  readonly id: PlayerId;
  readonly kingdom: Kingdom;
  readonly pawnIds: readonly [PawnId, PawnId];
}

export interface GamePawn {
  readonly id: PawnId;
  readonly playerId: PlayerId;
}

export interface DraftSlot {
  readonly dominoId: string;
  readonly selectedByPawnId?: PawnId;
}

export interface SelectedDomino {
  readonly dominoId: string;
  readonly selectedByPawnId: PawnId;
  readonly resolved: boolean;
}

export type DiscardedDomino =
  | {
      readonly dominoId: string;
      readonly reason: "draw";
      readonly drawNumber: number;
    }
  | {
      readonly dominoId: string;
      readonly reason: "unplaceable";
      readonly pawnId: PawnId;
      readonly round: number;
    };

export interface InitialDraftPhase {
  readonly kind: "initial-draft";
  readonly round: 0;
  readonly turnOrder: readonly PawnId[];
  readonly activePawnIndex: number;
  readonly row: readonly DraftSlot[];
}

export interface TurnPhase {
  readonly kind: "turn";
  readonly round: number;
  readonly step: "place" | "select";
  readonly turnOrder: readonly PawnId[];
  readonly activePawnIndex: number;
  readonly currentRow: readonly SelectedDomino[];
  readonly nextRow?: readonly DraftSlot[];
}

export interface FinishedPhase {
  readonly kind: "finished";
  readonly round: 12;
}

export type GamePhase = InitialDraftPhase | TurnPhase | FinishedPhase;

export interface GameState {
  readonly seed: string;
  readonly catalog: readonly DominoDefinition[];
  readonly drawOrder: readonly string[];
  readonly drawCursor: number;
  readonly players: readonly [GamePlayer, GamePlayer];
  readonly pawns: readonly [GamePawn, GamePawn, GamePawn, GamePawn];
  readonly discardedDominos: readonly DiscardedDomino[];
  readonly phase: GamePhase;
}

export interface CreateGameOptions {
  readonly catalog: readonly DominoDefinition[];
  readonly playerIds: readonly [PlayerId, PlayerId];
  readonly seed: string | number;
}

export type GameAction =
  | {
      readonly type: "select-domino";
      readonly pawnId: PawnId;
      readonly dominoId: string;
    }
  | {
      readonly type: "place-domino";
      readonly pawnId: PawnId;
      readonly placement: DominoPlacement;
    }
  | {
      readonly type: "discard-domino";
      readonly pawnId: PawnId;
    };

interface RevealedRow {
  readonly row: readonly DraftSlot[];
  readonly drawCursor: number;
  readonly discarded: DiscardedDomino;
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Générateur pseudo-aléatoire Mulberry32. Son état reste local à
 * l'initialisation : toutes les transitions ultérieures sont entièrement
 * déterminées par le GameState et l'action reçue.
 */
function createSeededRandom(seed: string): () => number {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function getDomino(state: GameState, dominoId: string): DominoDefinition {
  const domino = state.catalog.find(({ id }) => id === dominoId);
  if (!domino) throw new Error(`Unknown domino: ${dominoId}.`);
  return domino;
}

function getPawn(state: GameState, pawnId: PawnId): GamePawn {
  const pawn = state.pawns.find(({ id }) => id === pawnId);
  if (!pawn) throw new Error(`Unknown pawn: ${pawnId}.`);
  return pawn;
}

function getPlayer(state: GameState, playerId: PlayerId): GamePlayer {
  const player = state.players.find(({ id }) => id === playerId);
  if (!player) throw new Error(`Unknown player: ${playerId}.`);
  return player;
}

function validateCatalog(catalog: readonly DominoDefinition[]): void {
  if (catalog.length !== GAME_DRAW_COUNT * DOMINOS_PER_DRAW) {
    throw new Error("The V1 catalog must contain exactly 60 dominos.");
  }
  if (new Set(catalog.map(({ id }) => id)).size !== catalog.length) {
    throw new Error("Every domino id must be unique.");
  }
  if (
    new Set(catalog.map(({ draftOrder }) => draftOrder)).size !== catalog.length
  ) {
    throw new Error("Every domino draft order must be unique.");
  }
}

function revealRow(
  catalog: readonly DominoDefinition[],
  drawOrder: readonly string[],
  drawCursor: number,
): RevealedRow {
  const drawNumber = drawCursor / DOMINOS_PER_DRAW + 1;
  const drawnIds = drawOrder.slice(drawCursor, drawCursor + DOMINOS_PER_DRAW);
  if (drawnIds.length !== DOMINOS_PER_DRAW || !Number.isInteger(drawNumber)) {
    throw new Error("No complete draw remains in the deck.");
  }

  const drawn = drawnIds
    .map((id) => {
      const domino = catalog.find((candidate) => candidate.id === id);
      if (!domino) throw new Error(`Unknown domino in draw order: ${id}.`);
      return domino;
    })
    .sort((left, right) => left.draftOrder - right.draftOrder);
  const discarded = drawn[2];

  return {
    row: drawn
      .filter((_, index) => index !== 2)
      .map(({ id }) => ({ dominoId: id })),
    drawCursor: drawCursor + DOMINOS_PER_DRAW,
    discarded: {
      dominoId: discarded.id,
      reason: "draw",
      drawNumber,
    },
  };
}

function selectedRow(row: readonly DraftSlot[]): readonly SelectedDomino[] {
  return row.map((slot) => {
    if (!slot.selectedByPawnId) {
      throw new Error("Cannot promote a row before all dominos are selected.");
    }
    return {
      dominoId: slot.dominoId,
      selectedByPawnId: slot.selectedByPawnId,
      resolved: false,
    };
  });
}

function orderPawnsByRow(
  state: GameState,
  row: readonly SelectedDomino[],
): readonly PawnId[] {
  return [...row]
    .sort(
      (left, right) =>
        getDomino(state, left.dominoId).draftOrder -
        getDomino(state, right.dominoId).draftOrder,
    )
    .map(({ selectedByPawnId }) => selectedByPawnId);
}

function replacePlayerKingdom(
  players: readonly [GamePlayer, GamePlayer],
  playerId: PlayerId,
  kingdom: Kingdom,
): readonly [GamePlayer, GamePlayer] {
  const replace = (player: GamePlayer): GamePlayer =>
    player.id === playerId ? { ...player, kingdom } : player;
  return [replace(players[0]), replace(players[1])];
}

/**
 * Crée une partie V1 à deux joueurs. La seed pilote un Fisher-Yates sur les
 * quatre pions puis sur les 60 dominos grâce à Mulberry32, sans Math.random().
 */
export function createGame(options: CreateGameOptions): GameState {
  validateCatalog(options.catalog);
  const [firstPlayerId, secondPlayerId] = options.playerIds;
  if (!firstPlayerId || !secondPlayerId || firstPlayerId === secondPlayerId) {
    throw new Error("The game requires two distinct non-empty player ids.");
  }

  const pawns: [GamePawn, GamePawn, GamePawn, GamePawn] = [
    { id: `${firstPlayerId}:pawn-1`, playerId: firstPlayerId },
    { id: `${firstPlayerId}:pawn-2`, playerId: firstPlayerId },
    { id: `${secondPlayerId}:pawn-1`, playerId: secondPlayerId },
    { id: `${secondPlayerId}:pawn-2`, playerId: secondPlayerId },
  ];
  const players: [GamePlayer, GamePlayer] = [
    {
      id: firstPlayerId,
      kingdom: createKingdom(),
      pawnIds: [pawns[0].id, pawns[1].id],
    },
    {
      id: secondPlayerId,
      kingdom: createKingdom(),
      pawnIds: [pawns[2].id, pawns[3].id],
    },
  ];
  const seed = String(options.seed);
  const random = createSeededRandom(seed);
  const initialPawnOrder = shuffle(
    pawns.map(({ id }) => id),
    random,
  );
  const drawOrder = shuffle(
    options.catalog.map(({ id }) => id),
    random,
  );
  const firstRow = revealRow(options.catalog, drawOrder, 0);

  return {
    seed,
    catalog: options.catalog,
    drawOrder,
    drawCursor: firstRow.drawCursor,
    players,
    pawns,
    discardedDominos: [firstRow.discarded],
    phase: {
      kind: "initial-draft",
      round: 0,
      turnOrder: initialPawnOrder,
      activePawnIndex: 0,
      row: firstRow.row,
    },
  };
}

/** Retourne le pion autorisé à agir, ou undefined lorsque la partie est finie. */
export function getCurrentPawn(state: GameState): GamePawn | undefined {
  if (state.phase.kind === "finished") return undefined;
  return getPawn(
    state,
    state.phase.turnOrder[state.phase.activePawnIndex],
  );
}

function currentDomino(state: GameState, pawnId: PawnId): DominoDefinition {
  if (state.phase.kind !== "turn") {
    throw new Error("No domino can be played during the initial draft.");
  }
  const selected = state.phase.currentRow.find(
    ({ selectedByPawnId, resolved }) =>
      selectedByPawnId === pawnId && !resolved,
  );
  if (!selected) throw new Error(`Pawn ${pawnId} has no current domino.`);
  return getDomino(state, selected.dominoId);
}

function resolveCurrentDomino(state: GameState, pawnId: PawnId): GameState {
  if (state.phase.kind !== "turn") {
    throw new Error("No current domino can be resolved outside a turn.");
  }
  return {
    ...state,
    phase: {
      ...state.phase,
      currentRow: state.phase.currentRow.map((selection) =>
        selection.selectedByPawnId === pawnId
          ? { ...selection, resolved: true }
          : selection,
      ),
    },
  };
}

/**
 * Énumère les actions autorisées pour le pion actif. Les placements proviennent
 * exclusivement de getLegalPlacements ; la défausse n'apparaît que si cette
 * liste est vide.
 */
export function getLegalGameActions(state: GameState): readonly GameAction[] {
  const pawn = getCurrentPawn(state);
  if (!pawn || state.phase.kind === "finished") return [];

  if (state.phase.kind === "initial-draft") {
    return state.phase.row
      .filter(({ selectedByPawnId }) => selectedByPawnId === undefined)
      .map(({ dominoId }) => ({
        type: "select-domino" as const,
        pawnId: pawn.id,
        dominoId,
      }));
  }

  if (state.phase.step === "select") {
    if (!state.phase.nextRow) return [];
    return state.phase.nextRow
      .filter(({ selectedByPawnId }) => selectedByPawnId === undefined)
      .map(({ dominoId }) => ({
        type: "select-domino" as const,
        pawnId: pawn.id,
        dominoId,
      }));
  }

  const domino = currentDomino(state, pawn.id);
  const player = getPlayer(state, pawn.playerId);
  const placements = getLegalPlacements(
    player.kingdom,
    domino,
    GAME_KINGDOM_SIZE,
  );
  if (placements.length === 0) {
    return [{ type: "discard-domino", pawnId: pawn.id }];
  }
  return placements.map((placement) => ({
    type: "place-domino" as const,
    pawnId: pawn.id,
    placement,
  }));
}

function applyInitialSelection(
  state: GameState,
  action: Extract<GameAction, { type: "select-domino" }>,
): GameState {
  if (state.phase.kind !== "initial-draft") {
    throw new Error("Initial selection is no longer active.");
  }
  const slot = state.phase.row.find(
    ({ dominoId }) => dominoId === action.dominoId,
  );
  if (!slot) throw new Error("The selected domino is not in the current row.");
  if (slot.selectedByPawnId) throw new Error("This domino is already selected.");

  const row = state.phase.row.map((candidate) =>
    candidate.dominoId === action.dominoId
      ? { ...candidate, selectedByPawnId: action.pawnId }
      : candidate,
  );
  const nextIndex = state.phase.activePawnIndex + 1;
  if (nextIndex < state.phase.turnOrder.length) {
    return {
      ...state,
      phase: { ...state.phase, row, activePawnIndex: nextIndex },
    };
  }

  const currentRow = selectedRow(row);
  const nextRow = revealRow(state.catalog, state.drawOrder, state.drawCursor);
  return {
    ...state,
    drawCursor: nextRow.drawCursor,
    discardedDominos: [...state.discardedDominos, nextRow.discarded],
    phase: {
      kind: "turn",
      round: 1,
      step: "place",
      turnOrder: orderPawnsByRow(state, currentRow),
      activePawnIndex: 0,
      currentRow,
      nextRow: nextRow.row,
    },
  };
}

/**
 * Après une pose ou une défausse, le même pion passe au choix du prochain
 * domino. En manche 12 il n'existe plus de choix : on avance directement au
 * pion suivant, puis vers l'état final après le quatrième.
 */
function advanceAfterDominoResolution(state: GameState): GameState {
  if (state.phase.kind !== "turn" || state.phase.step !== "place") {
    throw new Error("Cannot advance outside a placement step.");
  }
  const nextIndex = state.phase.activePawnIndex + 1;
  if (state.phase.round === GAME_DRAW_COUNT) {
    if (nextIndex === state.phase.turnOrder.length) {
      return { ...state, phase: { kind: "finished", round: 12 } };
    }
    return {
      ...state,
      phase: { ...state.phase, activePawnIndex: nextIndex },
    };
  }
  return { ...state, phase: { ...state.phase, step: "select" } };
}

function applyPlacement(
  state: GameState,
  action: Extract<GameAction, { type: "place-domino" }>,
): GameState {
  if (state.phase.kind !== "turn" || state.phase.step !== "place") {
    throw new Error("A domino can only be placed during a placement step.");
  }
  const pawn = getPawn(state, action.pawnId);
  const player = getPlayer(state, pawn.playerId);
  const domino = currentDomino(state, pawn.id);
  const validation = validateDominoPlacement(
    player.kingdom,
    domino,
    action.placement,
    GAME_KINGDOM_SIZE,
  );
  if (!validation.valid) {
    throw new Error(`Illegal game placement: ${validation.reason}.`);
  }
  const kingdom = placeDomino(
    player.kingdom,
    domino,
    action.placement,
    GAME_KINGDOM_SIZE,
  );
  return advanceAfterDominoResolution(
    resolveCurrentDomino(
      {
        ...state,
        players: replacePlayerKingdom(state.players, player.id, kingdom),
      },
      pawn.id,
    ),
  );
}

function applyDiscard(
  state: GameState,
  action: Extract<GameAction, { type: "discard-domino" }>,
): GameState {
  if (state.phase.kind !== "turn" || state.phase.step !== "place") {
    throw new Error("A domino can only be discarded during a placement step.");
  }
  const pawn = getPawn(state, action.pawnId);
  const player = getPlayer(state, pawn.playerId);
  const domino = currentDomino(state, pawn.id);
  if (
    getLegalPlacements(player.kingdom, domino, GAME_KINGDOM_SIZE).length > 0
  ) {
    throw new Error(
      "A domino cannot be discarded while a legal placement exists.",
    );
  }
  return advanceAfterDominoResolution(
    resolveCurrentDomino(
      {
        ...state,
        discardedDominos: [
          ...state.discardedDominos,
          {
            dominoId: domino.id,
            reason: "unplaceable",
            pawnId: pawn.id,
            round: state.phase.round,
          },
        ],
      },
      pawn.id,
    ),
  );
}

/**
 * Termine le choix du pion actif. Après le quatrième choix, la rangée suivante
 * devient courante, son draftOrder fixe le nouvel ordre, puis une rangée est
 * révélée sauf lorsque les dominos du douzième tirage viennent d'être choisis.
 */
function applyTurnSelection(
  state: GameState,
  action: Extract<GameAction, { type: "select-domino" }>,
): GameState {
  if (
    state.phase.kind !== "turn" ||
    state.phase.step !== "select" ||
    !state.phase.nextRow
  ) {
    throw new Error("No next-row selection is expected now.");
  }
  const slot = state.phase.nextRow.find(
    ({ dominoId }) => dominoId === action.dominoId,
  );
  if (!slot) throw new Error("The selected domino is not in the next row.");
  if (slot.selectedByPawnId) throw new Error("This domino is already selected.");

  const nextRow = state.phase.nextRow.map((candidate) =>
    candidate.dominoId === action.dominoId
      ? { ...candidate, selectedByPawnId: action.pawnId }
      : candidate,
  );
  const nextIndex = state.phase.activePawnIndex + 1;
  if (nextIndex < state.phase.turnOrder.length) {
    return {
      ...state,
      phase: {
        ...state.phase,
        step: "place",
        activePawnIndex: nextIndex,
        nextRow,
      },
    };
  }

  const currentRow = selectedRow(nextRow);
  const round = state.phase.round + 1;
  const basePhase: TurnPhase = {
    kind: "turn",
    round,
    step: "place",
    turnOrder: orderPawnsByRow(state, currentRow),
    activePawnIndex: 0,
    currentRow,
  };
  if (round === GAME_DRAW_COUNT) return { ...state, phase: basePhase };

  const revealed = revealRow(state.catalog, state.drawOrder, state.drawCursor);
  return {
    ...state,
    drawCursor: revealed.drawCursor,
    discardedDominos: [...state.discardedDominos, revealed.discarded],
    phase: { ...basePhase, nextRow: revealed.row },
  };
}

/**
 * Applique une action en vérifiant d'abord qu'elle appartient bien au pion
 * actif et à l'étape courante. La fonction ne modifie jamais l'état reçu.
 */
export function applyGameAction(
  state: GameState,
  action: GameAction,
): GameState {
  if (state.phase.kind === "finished") {
    throw new Error("The game is already finished.");
  }
  const currentPawn = getCurrentPawn(state);
  if (!currentPawn || action.pawnId !== currentPawn.id) {
    throw new Error("Only the current pawn may act.");
  }

  if (action.type === "select-domino") {
    return state.phase.kind === "initial-draft"
      ? applyInitialSelection(state, action)
      : applyTurnSelection(state, action);
  }
  if (action.type === "place-domino") return applyPlacement(state, action);
  return applyDiscard(state, action);
}

/** Indique si les quatre dominos du douzième tirage ont été résolus. */
export function isGameFinished(state: GameState): boolean {
  return state.phase.kind === "finished";
}
