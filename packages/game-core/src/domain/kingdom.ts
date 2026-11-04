import type { TileDefinition } from "./terrain.js";
import type { Position } from "./position.js";
import { CASTLE_POSITION } from "./position.js";

export interface KingdomCell extends TileDefinition {
  readonly dominoId: string;
}

export interface PlacedCell {
  readonly position: Position;
  readonly cell: KingdomCell;
}

export interface Kingdom {
  readonly castle: Position;
  readonly cells: readonly PlacedCell[];
}

export interface KingdomBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
}

export function createKingdom(): Kingdom {
  return {
    castle: { ...CASTLE_POSITION },
    cells: [],
  };
}

export function getCellAt(
  kingdom: Kingdom,
  position: Position,
): PlacedCell | undefined {
  return kingdom.cells.find(
    ({ position: current }) =>
      current.x === position.x && current.y === position.y,
  );
}

export function isOccupied(kingdom: Kingdom, position: Position): boolean {
  const castleOccupied =
    kingdom.castle.x === position.x && kingdom.castle.y === position.y;

  return castleOccupied || getCellAt(kingdom, position) !== undefined;
}

export function getKingdomBounds(kingdom: Kingdom): KingdomBounds {
  const positions = [
    kingdom.castle,
    ...kingdom.cells.map(({ position }) => position),
  ];

  const xs = positions.map(({ x }) => x);
  const ys = positions.map(({ y }) => y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}
