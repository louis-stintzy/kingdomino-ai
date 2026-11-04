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

const DIRECTION_OFFSETS: Readonly<Record<Direction, Position>> = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
};

const ORTHOGONAL_OFFSETS: readonly Position[] = Object.values(
  DIRECTION_OFFSETS,
);

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
    throw new Error(`Invalid domino direction: ${String(placement.direction)}.`);
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

      if (
        neighbor.x === kingdom.castle.x &&
        neighbor.y === kingdom.castle.y
      ) {
        return true;
      }

      return getCellAt(kingdom, neighbor)?.cell.terrain ===
        domino.tiles[tileIndex].terrain;
    }),
  );
}

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
