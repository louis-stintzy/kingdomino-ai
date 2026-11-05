import type { DominoDefinition } from "./domino.js";
import {
  getCellAt,
  getKingdomBounds,
  isOccupied,
  type Kingdom,
  type PlacedCell,
} from "./kingdom.js";
import type { Position } from "./position.js";

export const DIRECTIONS = ["north", "east", "south", "west"] as const;

export type Direction = (typeof DIRECTIONS)[number];

export interface DominoPlacement {
  readonly anchor: Position;
  readonly direction: Direction;
}

export type PlacementErrorCode =
  | "INVALID_KINGDOM_SIZE"
  | "INVALID_POSITION"
  | "INVALID_DIRECTION"
  | "OCCUPIED"
  | "OUT_OF_BOUNDS"
  | "NO_CONNECTION";

export type PlacementValidation =
  | { readonly valid: true }
  | { readonly valid: false; readonly reason: PlacementErrorCode };

// Ces décalages orientent le domino : ils indiquent où placer sa seconde case par rapport à l'ancre choisie.
const DIRECTION_OFFSETS: Readonly<Record<Direction, Position>> = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
};

// Les mêmes quatre décalages servent ici à inspecter tous les voisins orthogonaux d'une case, indépendamment de l'orientation du domino.
const ORTHOGONAL_OFFSETS: readonly Position[] =
  Object.values(DIRECTION_OFFSETS);

const PLACEMENT_ERROR_MESSAGES: Readonly<Record<PlacementErrorCode, string>> = {
  INVALID_KINGDOM_SIZE: "Kingdom size must be a positive integer.",
  INVALID_POSITION: "Domino anchor coordinates must be integers.",
  INVALID_DIRECTION: "Domino direction must be north, east, south, or west.",
  OCCUPIED: "Both domino positions must be unoccupied, including the castle.",
  OUT_OF_BOUNDS: "Placement exceeds the maximum kingdom bounds.",
  NO_CONNECTION:
    "The domino must touch the castle or an orthogonally adjacent matching terrain.",
};

function isDirection(value: string): value is Direction {
  return DIRECTIONS.some((direction) => direction === value);
}

function invalid(reason: PlacementErrorCode): PlacementValidation {
  return { valid: false, reason };
}

function isValidKingdomSize(kingdomSize: number): boolean {
  return Number.isInteger(kingdomSize) && kingdomSize > 0;
}

/**
 * Calcule les deux coordonnées occupées par un domino à partir de son ancrage et de sa direction.
 * La première case reste sur l'ancre et la seconde suit l'orientation.
 */
export function getDominoPositions(
  placement: DominoPlacement,
): readonly [Position, Position] {
  if (
    !Number.isInteger(placement.anchor.x) ||
    !Number.isInteger(placement.anchor.y)
  ) {
    throw new Error("Domino anchor coordinates must be integers.");
  }

  if (!isDirection(placement.direction)) {
    throw new Error(
      `Invalid domino direction: ${String(placement.direction)}.`,
    );
  }

  const offset = DIRECTION_OFFSETS[placement.direction];

  return [
    { x: placement.anchor.x, y: placement.anchor.y },
    {
      x: placement.anchor.x + offset.x,
      y: placement.anchor.y + offset.y,
    },
  ];
}

/**
 * Calcule le rectangle englobant actuel,
 * y ajoute les deux nouvelles cases et vérifie les dimensions maximales.
 */
function fitsKingdomBounds(
  kingdom: Kingdom,
  positions: readonly [Position, Position],
  kingdomSize: number,
): boolean {
  const bounds = getKingdomBounds(kingdom);
  const xs = [bounds.minX, bounds.maxX, positions[0].x, positions[1].x];
  const ys = [bounds.minY, bounds.maxY, positions[0].y, positions[1].y];

  return (
    Math.max(...xs) - Math.min(...xs) + 1 <= kingdomSize &&
    Math.max(...ys) - Math.min(...ys) + 1 <= kingdomSize
  );
}

/**
 * Vérifie la règle de connexion de Kingdomino.
 *
 * Au moins une moitié du domino doit toucher orthogonalement :
 * - le château (tous les terrains sont acceptés) ;
 * - ou une case existante possédant le même terrain.
 *
 * Une seule connexion valide suffit, même si d'autres voisins
 * ont des terrains différents. Les diagonales ne comptent pas.
 */
function hasValidConnection(
  kingdom: Kingdom,
  domino: DominoDefinition,
  positions: readonly [Position, Position],
): boolean {
  return positions.some((position, tileIndex) =>
    ORTHOGONAL_OFFSETS.some((offset) => {
      const neighbor = {
        x: position.x + offset.x,
        y: position.y + offset.y,
      };

      if (neighbor.x === kingdom.castle.x && neighbor.y === kingdom.castle.y) {
        return true;
      }

      return (
        getCellAt(kingdom, neighbor)?.cell.terrain ===
        domino.tiles[tileIndex].terrain
      );
    }),
  );
}

/**
 * Coordonne les validations et renvoie un succès ou un code d'erreur.
 */
export function validateDominoPlacement(
  kingdom: Kingdom,
  domino: DominoDefinition,
  placement: DominoPlacement,
  kingdomSize: number,
): PlacementValidation {
  if (!isValidKingdomSize(kingdomSize)) {
    return invalid("INVALID_KINGDOM_SIZE");
  }

  if (
    !Number.isInteger(placement.anchor.x) ||
    !Number.isInteger(placement.anchor.y)
  ) {
    return invalid("INVALID_POSITION");
  }

  if (!isDirection(placement.direction)) {
    return invalid("INVALID_DIRECTION");
  }

  const positions = getDominoPositions(placement);

  if (positions.some((position) => isOccupied(kingdom, position))) {
    return invalid("OCCUPIED");
  }

  if (!fitsKingdomBounds(kingdom, positions, kingdomSize)) {
    return invalid("OUT_OF_BOUNDS");
  }

  if (!hasValidConnection(kingdom, domino, positions)) {
    return invalid("NO_CONNECTION");
  }

  return { valid: true };
}

/**
 * Pose un domino après validation et renvoie le nouveau royaume.
 *
 * Le royaume initial et son tableau de cases ne sont jamais modifiés. Un
 * placement illégal produit une erreur JavaScript explicite contenant à la
 * fois le code métier et son message lisible.
 */
export function placeDomino(
  kingdom: Kingdom,
  domino: DominoDefinition,
  placement: DominoPlacement,
  kingdomSize: number,
): Kingdom {
  const validation = validateDominoPlacement(
    kingdom,
    domino,
    placement,
    kingdomSize,
  );

  if (!validation.valid) {
    throw new Error(
      `Illegal domino placement (${validation.reason}): ${PLACEMENT_ERROR_MESSAGES[validation.reason]}`,
    );
  }

  const positions = getDominoPositions(placement);
  const placedCells = positions.map(
    (position, tileIndex): PlacedCell => ({
      position,
      cell: {
        ...domino.tiles[tileIndex],
        dominoId: domino.id,
      },
    }),
  );

  return {
    ...kingdom,
    cells: [...kingdom.cells, ...placedCells],
  };
}

/**
 * Retourne tous les placements légaux d'un domino.
 *
 * Explore les ancrages autour du royaume et les quatre directions.
 * La marge de deux cases permet de couvrir les placements dont
 * la seconde moitié est adjacente à une case existante.
 *
 * Chaque candidat est vérifié avec validateDominoPlacement().
 *
 * Le résultat est déterministe, sans doublon (ancre, direction).
 * Les placements équivalents géométriquement restent possibles.
 */
export function getLegalPlacements(
  kingdom: Kingdom,
  domino: DominoDefinition,
  kingdomSize: number,
): readonly DominoPlacement[] {
  if (!isValidKingdomSize(kingdomSize)) {
    throw new Error(PLACEMENT_ERROR_MESSAGES.INVALID_KINGDOM_SIZE);
  }

  const bounds = getKingdomBounds(kingdom);
  const placements: DominoPlacement[] = [];

  for (let y = bounds.minY - 2; y <= bounds.maxY + 2; y += 1) {
    for (let x = bounds.minX - 2; x <= bounds.maxX + 2; x += 1) {
      for (const direction of DIRECTIONS) {
        const placement = { anchor: { x, y }, direction };
        if (
          validateDominoPlacement(kingdom, domino, placement, kingdomSize).valid
        ) {
          placements.push(placement);
        }
      }
    }
  }

  return placements;
}
