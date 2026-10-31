import { TERRAINS } from "@kingdomino/game-core";
import { describe, expect, it } from "vitest";

import { DOMINOS } from "./dominos.js";

describe("DOMINOS", () => {
  it("contains the complete 60-domino catalogue", () => {
    expect(DOMINOS).toHaveLength(60);
  });

  it("uses unique stable ids and draft orders", () => {
    expect(new Set(DOMINOS.map(({ id }) => id)).size).toBe(60);
    expect(new Set(DOMINOS.map(({ draftOrder }) => draftOrder)).size).toBe(60);
  });

  it("covers every draft order from 1 through 60", () => {
    expect(DOMINOS.map(({ draftOrder }) => draftOrder)).toEqual(
      Array.from({ length: 60 }, (_, index) => index + 1),
    );
  });

  it("assigns each domino to its historical expansion", () => {
    for (const domino of DOMINOS) {
      const numericId = Number(domino.id);
      const isAgeOfGiants = /^[A-F]$/.test(domino.id) || numericId >= 49;

      expect(domino.expansion).toBe(isAgeOfGiants ? "age-of-giants" : "base");
    }
  });

  it("only contains allowed terrains and non-negative integer crowns", () => {
    const allowedTerrains = new Set<string>(TERRAINS);

    for (const domino of DOMINOS) {
      expect(domino.tiles).toHaveLength(2);
      for (const tile of domino.tiles) {
        expect(allowedTerrains.has(tile.terrain)).toBe(true);
        expect(Number.isInteger(tile.crowns)).toBe(true);
        expect(tile.crowns).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("preserves representative historical definitions", () => {
    expect(DOMINOS.find(({ id }) => id === "A")).toEqual({
      id: "A",
      draftOrder: 1,
      expansion: "age-of-giants",
      tiles: [{ terrain: "forest", crowns: 0 }, { terrain: "wheat", crowns: 0 }],
    });
    expect(DOMINOS.find(({ id }) => id === "19")).toEqual({
      id: "19",
      draftOrder: 25,
      expansion: "base",
      tiles: [{ terrain: "wheat", crowns: 1 }, { terrain: "forest", crowns: 0 }],
    });
    expect(DOMINOS.find(({ id }) => id === "48")).toEqual({
      id: "48",
      draftOrder: 54,
      expansion: "base",
      tiles: [{ terrain: "wheat", crowns: 0 }, { terrain: "mine", crowns: 3 }],
    });
    expect(DOMINOS.find(({ id }) => id === "54")).toEqual({
      id: "54",
      draftOrder: 60,
      expansion: "age-of-giants",
      tiles: [{ terrain: "mine", crowns: 2 }, { terrain: "swamp", crowns: 1 }],
    });
  });
});
