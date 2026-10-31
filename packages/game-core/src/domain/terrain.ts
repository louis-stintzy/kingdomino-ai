export const TERRAINS = [
  "wheat",
  "forest",
  "lake",
  "grass",
  "swamp",
  "mine",
] as const;

export type Terrain = (typeof TERRAINS)[number];

export interface TileDefinition {
  readonly terrain: Terrain;
  readonly crowns: number;
}
