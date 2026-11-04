import { describe, expect, it } from "vitest";

import type { DominoDefinition } from "./domino.js";
import { createKingdom, type Kingdom } from "./kingdom.js";
import {
  DIRECTIONS,
  getDominoPositions,
  getLegalPlacements,
  placeDomino,
  validateDominoPlacement,
  type DominoPlacement,
} from "./placement.js";

const mixedDomino: DominoDefinition = {
  id: "mixed",
  draftOrder: 1,
  expansion: "base",
  tiles: [
    { terrain: "forest", crowns: 1 },
    { terrain: "lake", crowns: 0 },
  ],
};

const forestDomino: DominoDefinition = {
  ...mixedDomino,
  id: "forest",
  tiles: [
    { terrain: "forest", crowns: 0 },
    { terrain: "forest", crowns: 0 },
  ],
};

function kingdomWithCell(
  x: number,
  y: number,
  terrain: "wheat" | "forest" | "lake" | "grass" | "swamp" | "mine",
): Kingdom {
  return {
    castle: { x: 0, y: 0 },
    cells: [
      {
        position: { x, y },
        cell: { terrain, crowns: 0, dominoId: "existing" },
      },
    ],
  };
}

function placementKey({ anchor, direction }: DominoPlacement): string {
  return `${anchor.x},${anchor.y},${direction}`;
}

function exhaustivePlacements(
  kingdom: Kingdom,
  domino: DominoDefinition,
  kingdomSize: number,
  searchRadius: number,
): DominoPlacement[] {
  const placements: DominoPlacement[] = [];

  for (let y = -searchRadius; y <= searchRadius; y += 1) {
    for (let x = -searchRadius; x <= searchRadius; x += 1) {
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

describe("getDominoPositions", () => {
  it.each([
    ["north", { x: 2, y: 2 }, { x: 2, y: 1 }],
    ["east", { x: 2, y: 2 }, { x: 3, y: 2 }],
    ["south", { x: 2, y: 2 }, { x: 2, y: 3 }],
    ["west", { x: 2, y: 2 }, { x: 1, y: 2 }],
  ] as const)("supports the %s orientation", (direction, first, second) => {
    expect(getDominoPositions({ anchor: first, direction })).toEqual([
      first,
      second,
    ]);
  });

  it("rejects non-integer coordinates", () => {
    expect(() =>
      getDominoPositions({ anchor: { x: 0.5, y: 1 }, direction: "north" }),
    ).toThrow(/integers/);
  });
});

describe("validateDominoPlacement", () => {
  it("allows placement adjacent to the castle in an empty kingdom", () => {
    expect(
      validateDominoPlacement(
        createKingdom(),
        mixedDomino,
        { anchor: { x: 1, y: 0 }, direction: "east" },
        5,
      ),
    ).toEqual({ valid: true });
  });

  it("allows a matching terrain connection", () => {
    const kingdom = kingdomWithCell(1, 0, "forest");

    expect(
      validateDominoPlacement(
        kingdom,
        forestDomino,
        { anchor: { x: 2, y: 0 }, direction: "south" },
        5,
      ).valid,
    ).toBe(true);
  });

  it("rejects a placement without a valid connection", () => {
    const validation = validateDominoPlacement(
      kingdomWithCell(1, 0, "wheat"),
      forestDomino,
      { anchor: { x: 2, y: 0 }, direction: "south" },
      5,
    );

    expect(validation).toEqual({ valid: false, reason: "NO_CONNECTION" });
  });

  it("does not count a diagonal contact", () => {
    expect(
      validateDominoPlacement(
        kingdomWithCell(1, 1, "forest"),
        forestDomino,
        { anchor: { x: 2, y: 0 }, direction: "east" },
        5,
      ),
    ).toEqual({ valid: false, reason: "NO_CONNECTION" });
  });

  it("rejects overlap with an existing terrain", () => {
    const validation = validateDominoPlacement(
      kingdomWithCell(1, 0, "forest"),
      forestDomino,
      { anchor: { x: 1, y: 0 }, direction: "south" },
      5,
    );

    expect(validation).toEqual({ valid: false, reason: "OCCUPIED" });
  });

  it("rejects overlap with the castle", () => {
    const validation = validateDominoPlacement(
      createKingdom(),
      mixedDomino,
      { anchor: { x: 0, y: 0 }, direction: "east" },
      5,
    );

    expect(validation).toEqual({ valid: false, reason: "OCCUPIED" });
  });

  it("rejects horizontal and vertical kingdom overflow", () => {
    const horizontal: Kingdom = {
      castle: { x: 0, y: 0 },
      cells: [
        {
          position: { x: 2, y: 0 },
          cell: { terrain: "forest", crowns: 0, dominoId: "old" },
        },
      ],
    };
    const vertical: Kingdom = {
      castle: { x: 0, y: 0 },
      cells: [
        {
          position: { x: 0, y: 2 },
          cell: { terrain: "forest", crowns: 0, dominoId: "old" },
        },
      ],
    };

    expect(
      validateDominoPlacement(
        horizontal,
        forestDomino,
        { anchor: { x: -1, y: 0 }, direction: "west" },
        3,
      ),
    ).toEqual({ valid: false, reason: "OUT_OF_BOUNDS" });
    expect(
      validateDominoPlacement(
        vertical,
        forestDomino,
        { anchor: { x: 0, y: -1 }, direction: "north" },
        3,
      ),
    ).toEqual({ valid: false, reason: "OUT_OF_BOUNDS" });
  });

  it("handles a castle away from the center of the kingdom bounds", () => {
    const kingdom: Kingdom = {
      castle: { x: 0, y: 0 },
      cells: [
        {
          position: { x: 1, y: 0 },
          cell: { terrain: "forest", crowns: 0, dominoId: "old-1" },
        },
        {
          position: { x: 2, y: 0 },
          cell: { terrain: "forest", crowns: 0, dominoId: "old-2" },
        },
      ],
    };

    expect(
      validateDominoPlacement(
        kingdom,
        forestDomino,
        { anchor: { x: 3, y: 0 }, direction: "east" },
        5,
      ).valid,
    ).toBe(true);
  });

  it("matches either of two different domino terrains", () => {
    expect(
      validateDominoPlacement(
        kingdomWithCell(3, 1, "lake"),
        mixedDomino,
        { anchor: { x: 1, y: 1 }, direction: "east" },
        5,
      ).valid,
    ).toBe(true);
  });

  it("accepts one valid connection despite incompatible neighbors", () => {
    const kingdom: Kingdom = {
      castle: { x: 0, y: 0 },
      cells: [
        {
          position: { x: 3, y: 1 },
          cell: { terrain: "forest", crowns: 0, dominoId: "matching" },
        },
        {
          position: { x: 1, y: 2 },
          cell: { terrain: "mine", crowns: 0, dominoId: "incompatible" },
        },
      ],
    };

    expect(
      validateDominoPlacement(
        kingdom,
        mixedDomino,
        { anchor: { x: 2, y: 1 }, direction: "south" },
        5,
      ).valid,
    ).toBe(true);
  });

  it("rejects non-integer coordinates and invalid kingdom sizes", () => {
    expect(
      validateDominoPlacement(
        createKingdom(),
        mixedDomino,
        { anchor: { x: 1.2, y: 0 }, direction: "east" },
        5,
      ),
    ).toEqual({ valid: false, reason: "INVALID_POSITION" });

    for (const size of [0, -1, 2.5, Number.NaN]) {
      expect(
        validateDominoPlacement(
          createKingdom(),
          mixedDomino,
          { anchor: { x: 1, y: 0 }, direction: "east" },
          size,
        ),
      ).toEqual({
        valid: false,
        reason: "INVALID_KINGDOM_SIZE",
      });
    }
  });

  it("rejects an invalid direction with a typed code", () => {
    const placement = {
      anchor: { x: 1, y: 0 },
      direction: "up",
    } as unknown as DominoPlacement;

    expect(
      validateDominoPlacement(
        createKingdom(),
        mixedDomino,
        placement,
        5,
      ),
    ).toEqual({ valid: false, reason: "INVALID_DIRECTION" });
  });
});

describe("placeDomino", () => {
  it("places both tiles without mutating the original kingdom", () => {
    const kingdom = createKingdom();
    const before = structuredClone(kingdom);
    const placed = placeDomino(
      kingdom,
      mixedDomino,
      { anchor: { x: 1, y: 0 }, direction: "south" },
      5,
    );

    expect(kingdom).toEqual(before);
    expect(placed).not.toBe(kingdom);
    expect(placed.cells).toEqual([
      {
        position: { x: 1, y: 0 },
        cell: { terrain: "forest", crowns: 1, dominoId: "mixed" },
      },
      {
        position: { x: 1, y: 1 },
        cell: { terrain: "lake", crowns: 0, dominoId: "mixed" },
      },
    ]);
  });

  it("fails explicitly for an illegal placement", () => {
    expect(() =>
      placeDomino(
        createKingdom(),
        mixedDomino,
        { anchor: { x: 2, y: 2 }, direction: "east" },
        5,
      ),
    ).toThrow(
      /Illegal domino placement \(NO_CONNECTION\).*touch the castle/,
    );
  });
});

describe("getLegalPlacements", () => {
  it("is deterministic, exhaustive, legal, and duplicate-free", () => {
    const kingdom = createKingdom();
    const placements = getLegalPlacements(kingdom, mixedDomino, 5);
    const secondCall = getLegalPlacements(kingdom, mixedDomino, 5);
    const keys = placements.map(placementKey);

    expect(secondCall).toEqual(placements);
    expect(new Set(keys).size).toBe(placements.length);
    expect(
      placements.every(
        (placement) =>
          validateDominoPlacement(kingdom, mixedDomino, placement, 5).valid,
      ),
    ).toBe(true);

    const exhaustive = exhaustivePlacements(kingdom, mixedDomino, 5, 5);
    expect(placements).toEqual(exhaustive);
  });

  it("is exhaustive on a partial multi-terrain kingdom with an off-center castle", () => {
    const kingdom: Kingdom = {
      castle: { x: 0, y: 0 },
      cells: [
        {
          position: { x: 1, y: 0 },
          cell: { terrain: "wheat", crowns: 0, dominoId: "1" },
        },
        {
          position: { x: 2, y: 0 },
          cell: { terrain: "forest", crowns: 1, dominoId: "1" },
        },
        {
          position: { x: 2, y: 1 },
          cell: { terrain: "lake", crowns: 0, dominoId: "2" },
        },
        {
          position: { x: 1, y: 1 },
          cell: { terrain: "grass", crowns: 0, dominoId: "2" },
        },
      ],
    };
    const placements = getLegalPlacements(kingdom, mixedDomino, 5);
    const exhaustive = exhaustivePlacements(kingdom, mixedDomino, 5, 10);
    const keys = placements.map(placementKey);

    expect(placements.length).toBeGreaterThan(0);
    expect(placements).toEqual(exhaustive);
    expect(getLegalPlacements(kingdom, mixedDomino, 5)).toEqual(placements);
    expect(new Set(keys).size).toBe(placements.length);
  });

  it("returns no placement when the kingdom size cannot contain a domino", () => {
    expect(getLegalPlacements(createKingdom(), mixedDomino, 1)).toEqual([]);
  });

  it("rejects an invalid kingdom size explicitly", () => {
    expect(() => getLegalPlacements(createKingdom(), mixedDomino, 0)).toThrow(
      /positive integer/,
    );
  });
});
