import { describe, expect, it } from "vitest";

import {
  createKingdom,
  getCellAt,
  getKingdomBounds,
  isOccupied,
  type Kingdom,
} from "./kingdom.js";

const exampleKingdom: Kingdom = {
  castle: { x: 0, y: 0 },
  cells: [
    {
      position: { x: -1, y: 0 },
      cell: {
        terrain: "forest",
        crowns: 1,
        dominoId: "24",
      },
    },
    {
      position: { x: -2, y: 0 },
      cell: {
        terrain: "wheat",
        crowns: 0,
        dominoId: "24",
      },
    },
    {
      position: { x: 1, y: 0 },
      cell: {
        terrain: "lake",
        crowns: 0,
        dominoId: "31",
      },
    },
  ],
};

describe("Kingdom domain", () => {
  it("creates an empty kingdom", () => {
    expect(createKingdom()).toEqual({
      castle: { x: 0, y: 0 },
      cells: [],
    });
  });

  it("finds a placed cell", () => {
    expect(getCellAt(exampleKingdom, { x: -1, y: 0 })?.cell.terrain).toBe(
      "forest",
    );
  });

  it("returns undefined for an empty cell", () => {
    expect(getCellAt(exampleKingdom, { x: 2, y: 2 })).toBeUndefined();
  });

  it("considers the castle occupied", () => {
    expect(isOccupied(exampleKingdom, { x: 0, y: 0 })).toBe(true);
  });

  it("detects occupied and empty positions", () => {
    expect(isOccupied(exampleKingdom, { x: -2, y: 0 })).toBe(true);

    expect(isOccupied(exampleKingdom, { x: 2, y: 0 })).toBe(false);
  });

  it("computes bounds using negative coordinates", () => {
    expect(getKingdomBounds(exampleKingdom)).toEqual({
      minX: -2,
      maxX: 1,
      minY: 0,
      maxY: 0,
      width: 4,
      height: 1,
    });
  });

  it("includes the castle in empty kingdom bounds", () => {
    expect(getKingdomBounds(createKingdom())).toEqual({
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      width: 1,
      height: 1,
    });
  });

  it("does not modify the kingdom when reading it", () => {
    const before = JSON.stringify(exampleKingdom);

    getCellAt(exampleKingdom, { x: -1, y: 0 });
    isOccupied(exampleKingdom, { x: 0, y: 0 });
    getKingdomBounds(exampleKingdom);

    expect(JSON.stringify(exampleKingdom)).toBe(before);
  });
});
