import type { TileDefinition } from "./terrain.js";

export type DominoExpansion = "base" | "age-of-giants";

export interface DominoDefinition {
  readonly id: string;
  readonly draftOrder: number;
  readonly expansion: DominoExpansion;
  readonly tiles: readonly [TileDefinition, TileDefinition];
}
