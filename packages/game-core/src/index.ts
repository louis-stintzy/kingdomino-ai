export { TERRAINS } from "./domain/terrain.js";

export type { Terrain, TileDefinition } from "./domain/terrain.js";

export type { DominoDefinition, DominoExpansion } from "./domain/domino.js";

export { CASTLE_POSITION } from "./domain/position.js";

export type { Position } from "./domain/position.js";

export {
  createKingdom,
  getCellAt,
  isOccupied,
  getKingdomBounds,
} from "./domain/kingdom.js";

export type {
  Kingdom,
  KingdomCell,
  PlacedCell,
  KingdomBounds,
} from "./domain/kingdom.js";
