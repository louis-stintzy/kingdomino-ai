import { describe, expect, it } from "vitest";

import type { DominoDefinition } from "./domino.js";
import {
  applyGameAction,
  createGame,
  getCurrentPawn,
  getLegalGameActions,
  isGameFinished,
  type GameAction,
  type GameState,
} from "./game.js";
import type { Kingdom } from "./kingdom.js";

const catalog: readonly DominoDefinition[] = Array.from(
  { length: 60 },
  (_, index) => ({
    id: `D${index + 1}`,
    draftOrder: index + 1,
    expansion: index < 48 ? "base" : "age-of-giants",
    tiles: [
      { terrain: "wheat", crowns: 0 },
      { terrain: "wheat", crowns: 0 },
    ],
  }),
);

function newGame(seed: string | number = "test-seed"): GameState {
  return createGame({
    catalog,
    playerIds: ["alice", "bob"],
    seed,
  });
}

function completeInitialDraft(
  initialState: GameState,
  chooseLast = false,
): GameState {
  let state = initialState;
  for (let index = 0; index < 4; index += 1) {
    const actions = getLegalGameActions(state);
    state = applyGameAction(
      state,
      actions[chooseLast ? actions.length - 1 : 0],
    );
  }
  return state;
}

function fullKingdom(): Kingdom {
  return {
    castle: { x: 0, y: 0 },
    cells: Array.from({ length: 49 }, (_, index) => {
      const x = (index % 7) - 3;
      const y = Math.floor(index / 7) - 3;
      return { x, y };
    })
      .filter(({ x, y }) => x !== 0 || y !== 0)
      .map((position, index) => ({
        position,
        cell: {
          terrain: "wheat" as const,
          crowns: 0,
          dominoId: `placed-${index}`,
        },
      })),
  };
}

function withCurrentPlayerKingdom(state: GameState, kingdom: Kingdom): GameState {
  const pawn = getCurrentPawn(state);
  if (!pawn) throw new Error("Expected an active pawn.");
  return {
    ...state,
    players: state.players.map((player) =>
      player.id === pawn.playerId ? { ...player, kingdom } : player,
    ) as unknown as GameState["players"],
  };
}

function simulateGame(initialState: GameState): {
  readonly state: GameState;
  readonly actionCount: number;
  readonly finalRoundActionCount: number;
} {
  let state = initialState;
  let actionCount = 0;
  let finalRoundActionCount = 0;

  while (!isGameFinished(state)) {
    const actions = getLegalGameActions(state);
    expect(actions.length).toBeGreaterThan(0);
    if (state.phase.kind === "turn" && state.phase.round === 12) {
      expect(actions.every(({ type }) => type !== "select-domino")).toBe(true);
      finalRoundActionCount += 1;
    }
    state = applyGameAction(state, actions[0]);
    actionCount += 1;
    if (actionCount > 120) throw new Error("Simulation did not terminate.");
  }

  return { state, actionCount, finalRoundActionCount };
}

function categorizedDominoIds(state: GameState): readonly string[] {
  const remaining = state.drawOrder.slice(state.drawCursor);
  const discarded = state.discardedDominos.map(({ dominoId }) => dominoId);
  const placed = state.players.flatMap(({ kingdom }) =>
    [...new Set(kingdom.cells.map(({ cell }) => cell.dominoId))],
  );

  if (state.phase.kind === "initial-draft") {
    return [...remaining, ...discarded, ...placed, ...state.phase.row.map(({ dominoId }) => dominoId)];
  }
  if (state.phase.kind === "turn") {
    const unresolved = state.phase.currentRow
      .filter(({ resolved }) => !resolved)
      .map(({ dominoId }) => dominoId);
    const next = state.phase.nextRow?.map(({ dominoId }) => dominoId) ?? [];
    return [...remaining, ...discarded, ...placed, ...unresolved, ...next];
  }
  return [...remaining, ...discarded, ...placed];
}

describe("createGame", () => {
  it("creates two distinct players, four pawns, and independent kingdoms", () => {
    const state = newGame();

    expect(state.players.map(({ id }) => id)).toEqual(["alice", "bob"]);
    expect(state.pawns).toHaveLength(4);
    expect(new Set(state.pawns.map(({ id }) => id)).size).toBe(4);
    expect(state.players[0].pawnIds).toHaveLength(2);
    expect(state.players[1].pawnIds).toHaveLength(2);
    expect(state.players[0].kingdom).not.toBe(state.players[1].kingdom);
    expect(state.players[0].kingdom).toEqual(state.players[1].kingdom);
    expect(state.phase.kind).toBe("initial-draft");
    expect(getCurrentPawn(state)?.id).toBe(
      state.phase.kind === "initial-draft" ? state.phase.turnOrder[0] : undefined,
    );
  });

  it("reproduces the draw and initial pawn order for the same seed", () => {
    const first = newGame("repeatable");
    const second = newGame("repeatable");
    const different = newGame("different");

    expect(second.drawOrder).toEqual(first.drawOrder);
    expect(second.phase).toEqual(first.phase);
    expect(different.drawOrder).not.toEqual(first.drawOrder);
  });

  it("sorts five drawn dominos and removes the third", () => {
    const state = newGame();
    if (state.phase.kind !== "initial-draft") throw new Error("Wrong phase.");
    const sortedDraw = state.drawOrder
      .slice(0, 5)
      .map((id) => catalog.find((domino) => domino.id === id)!)
      .sort((left, right) => left.draftOrder - right.draftOrder);

    expect(state.phase.row.map(({ dominoId }) => dominoId)).toEqual(
      sortedDraw.filter((_, index) => index !== 2).map(({ id }) => id),
    );
    expect(state.discardedDominos[0]).toEqual({
      dominoId: sortedDraw[2].id,
      reason: "draw",
      drawNumber: 1,
    });
  });
});

describe("draft transitions", () => {
  it("accepts initial selections and assigns each domino to the right pawn", () => {
    const initial = newGame();
    const state = completeInitialDraft(initial, true);

    expect(state.phase.kind).toBe("turn");
    if (state.phase.kind !== "turn") return;
    expect(state.phase.currentRow.every(({ resolved }) => !resolved)).toBe(true);
    expect(
      new Set(state.phase.currentRow.map(({ selectedByPawnId }) => selectedByPawnId)),
    ).toEqual(new Set(initial.pawns.map(({ id }) => id)));
    expect(state.phase.turnOrder).toEqual(
      state.phase.currentRow.map(({ selectedByPawnId }) => selectedByPawnId),
    );
    expect(state.phase.nextRow).toHaveLength(4);
    expect(state.drawCursor).toBe(10);
  });

  it("rejects a wrong pawn and an already selected domino", () => {
    const state = newGame();
    const actions = getLegalGameActions(state);
    const currentPawnId = actions[0].pawnId;
    const wrongPawnId = state.pawns.find(({ id }) => id !== currentPawnId)!.id;

    expect(() =>
      applyGameAction(state, { ...actions[0], pawnId: wrongPawnId }),
    ).toThrow(/current pawn/);

    const afterSelection = applyGameAction(state, actions[0]);
    expect(() =>
      applyGameAction(afterSelection, {
        type: "select-domino",
        pawnId: getCurrentPawn(afterSelection)!.id,
        dominoId:
          actions[0].type === "select-domino" ? actions[0].dominoId : "",
      }),
    ).toThrow(/already selected/);
  });

  it("prevents selecting a next-row domino twice", () => {
    let state = completeInitialDraft(newGame());
    state = applyGameAction(state, getLegalGameActions(state)[0]);
    const selected = getLegalGameActions(state)[0];
    state = applyGameAction(state, selected);
    state = applyGameAction(state, getLegalGameActions(state)[0]);

    expect(() =>
      applyGameAction(state, {
        type: "select-domino",
        pawnId: getCurrentPawn(state)!.id,
        dominoId:
          selected.type === "select-domino" ? selected.dominoId : "",
      }),
    ).toThrow(/already selected/);
  });
});

describe("turn actions", () => {
  it("places a domino only in the active pawn owner's kingdom", () => {
    const state = completeInitialDraft(newGame());
    const pawn = getCurrentPawn(state)!;
    const beforeOwner = state.players.find(({ id }) => id === pawn.playerId)!;
    const other = state.players.find(({ id }) => id !== pawn.playerId)!;
    const action = getLegalGameActions(state)[0];
    const next = applyGameAction(state, action);

    expect(
      next.players.find(({ id }) => id === pawn.playerId)!.kingdom.cells,
    ).toHaveLength(2);
    expect(next.players.find(({ id }) => id === other.id)!.kingdom.cells).toEqual(
      other.kingdom.cells,
    );
    expect(beforeOwner.kingdom.cells).toHaveLength(0);
    expect(next.phase.kind === "turn" && next.phase.step).toBe("select");
  });

  it("rejects an action from a non-active pawn", () => {
    const state = completeInitialDraft(newGame());
    const action = getLegalGameActions(state)[0];
    const wrongPawn = state.pawns.find(({ id }) => id !== action.pawnId)!;

    expect(() =>
      applyGameAction(state, { ...action, pawnId: wrongPawn.id } as GameAction),
    ).toThrow(/current pawn/);
  });

  it("forbids discarding while a legal placement exists", () => {
    const state = completeInitialDraft(newGame());
    expect(() =>
      applyGameAction(state, {
        type: "discard-domino",
        pawnId: getCurrentPawn(state)!.id,
      }),
    ).toThrow(/legal placement exists/);
  });

  it("allows the mandatory discard when no placement exists", () => {
    const state = withCurrentPlayerKingdom(
      completeInitialDraft(newGame()),
      fullKingdom(),
    );
    const actions = getLegalGameActions(state);

    expect(actions).toEqual([
      { type: "discard-domino", pawnId: getCurrentPawn(state)!.id },
    ]);
    const next = applyGameAction(state, actions[0]);
    expect(next.discardedDominos.at(-1)?.reason).toBe("unplaceable");
  });

  it("does not mutate previous states", () => {
    const state = completeInitialDraft(newGame());
    const snapshot = structuredClone(state);

    const next = applyGameAction(state, getLegalGameActions(state)[0]);

    expect(state).toEqual(snapshot);
    expect(next).not.toBe(state);
    expect(next.players).not.toBe(state.players);
  });

  it("reorders pawns from the dominos selected for the next round", () => {
    let state = completeInitialDraft(newGame("ordinary-order"));

    for (let pawnIndex = 0; pawnIndex < 4; pawnIndex += 1) {
      state = applyGameAction(state, getLegalGameActions(state)[0]);
      const selections = getLegalGameActions(state);
      state = applyGameAction(state, selections[selections.length - 1]);
    }

    expect(state.phase.kind).toBe("turn");
    if (state.phase.kind !== "turn") return;
    expect(state.phase.round).toBe(2);
    expect(state.phase.turnOrder).toEqual(
      state.phase.currentRow.map(({ selectedByPawnId }) => selectedByPawnId),
    );
  });
});

describe("complete game", () => {
  it("preserves every domino in exactly one live category", () => {
    let state = newGame("inventory");
    for (let index = 0; index < 20; index += 1) {
      const ids = categorizedDominoIds(state);
      expect(ids).toHaveLength(60);
      expect(new Set(ids).size).toBe(60);
      state = applyGameAction(state, getLegalGameActions(state)[0]);
    }
  });

  it("handles the final round without another draw or selection", () => {
    let state = newGame("last-round");
    while (
      state.phase.kind !== "turn" ||
      state.phase.round !== 12
    ) {
      state = applyGameAction(state, getLegalGameActions(state)[0]);
    }

    expect(state.drawCursor).toBe(60);
    expect(state.phase.nextRow).toBeUndefined();
    expect(
      state.discardedDominos.filter(({ reason }) => reason === "draw"),
    ).toHaveLength(12);

    let actions = 0;
    while (!isGameFinished(state)) {
      const legal = getLegalGameActions(state);
      expect(legal.every(({ type }) => type !== "select-domino")).toBe(true);
      state = applyGameAction(state, legal[0]);
      actions += 1;
    }
    expect(actions).toBe(4);
  });

  it("simulates a full game and resolves all 48 offered dominos", () => {
    const result = simulateGame(newGame("full-game"));
    const state = result.state;
    const placedIds = new Set(
      state.players.flatMap(({ kingdom }) =>
        kingdom.cells.map(({ cell }) => cell.dominoId),
      ),
    );
    const unplaceableIds = state.discardedDominos
      .filter(({ reason }) => reason === "unplaceable")
      .map(({ dominoId }) => dominoId);
    const drawDiscardIds = state.discardedDominos
      .filter(({ reason }) => reason === "draw")
      .map(({ dominoId }) => dominoId);
    const allIds = [...placedIds, ...unplaceableIds, ...drawDiscardIds];

    expect(isGameFinished(state)).toBe(true);
    expect(getCurrentPawn(state)).toBeUndefined();
    expect(getLegalGameActions(state)).toEqual([]);
    expect(result.actionCount).toBe(96);
    expect(result.finalRoundActionCount).toBe(4);
    expect(placedIds.size + unplaceableIds.length).toBe(48);
    expect(drawDiscardIds).toHaveLength(12);
    expect(allIds).toHaveLength(60);
    expect(new Set(allIds).size).toBe(60);
  });
});
