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

export type PlacementValidation =
  | { readonly valid: true }
  | { readonly valid: false; readonly reason: string };

const DIRECTION_OFFSETS: Readonly<Record<Direction, Position>> = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
};

const ORTHOGONAL_OFFSETS: readonly Position[] = Object.values(
  DIRECTION_OFFSETS,
);

function isDirection(value: string): value is Direction {
  return DIRECTIONS.some((direction) => direction === value);
}

function invalid(reason: string): PlacementValidation {
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
    return invalid("Kingdom size must be a positive integer.");
  }

  let positions: readonly [Position, Position];
  try {
    positions = getDominoPositions(placement);
  } catch (error) {
    return invalid(error instanceof Error ? error.message : "Invalid placement.");
  }

  if (positions.some((position) => isOccupied(kingdom, position))) {
    return invalid("Both domino positions must be unoccupied, including the castle.");
  }

  if (!fitsKingdomBounds(kingdom, positions, kingdomSize)) {
    return invalid(
      `Placement exceeds the maximum kingdom bounds of ${kingdomSize} by ${kingdomSize}.`,
    );
  }

  if (!hasValidConnection(kingdom, domino, positions)) {
    return invalid(
      "The domino must touch the castle or an orthogonally adjacent matching terrain.",
    );
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
    throw new Error(`Illegal domino placement: ${validation.reason}`);
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
    throw new Error("Kingdom size must be a positive integer.");
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
