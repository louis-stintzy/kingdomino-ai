import type { DominoDefinition } from "@kingdomino/game-core";

export const DOMINOS = [
  {
    id: "A",
    draftOrder: 1,
    expansion: "age-of-giants",
    tiles: [
      { terrain: "forest", crowns: 0 },
      { terrain: "wheat", crowns: 0 },
    ],
  },
  {
    id: "B",
    draftOrder: 2,
    expansion: "age-of-giants",
    tiles: [
      { terrain: "forest", crowns: 0 },
      { terrain: "wheat", crowns: 0 },
    ],
  },
  {
    id: "C",
    draftOrder: 3,
    expansion: "age-of-giants",
    tiles: [
      { terrain: "lake", crowns: 0 },
      { terrain: "wheat", crowns: 0 },
    ],
  },
  {
    id: "D",
    draftOrder: 4,
    expansion: "age-of-giants",
    tiles: [
      { terrain: "lake", crowns: 0 },
      { terrain: "grass", crowns: 0 },
    ],
  },
  {
    id: "E",
    draftOrder: 5,
    expansion: "age-of-giants",
    tiles: [
      { terrain: "swamp", crowns: 0 },
      { terrain: "grass", crowns: 0 },
    ],
  },
  {
    id: "F",
    draftOrder: 6,
    expansion: "age-of-giants",
    tiles: [
      { terrain: "mine", crowns: 0 },
      { terrain: "grass", crowns: 0 },
    ],
  },
  {
    id: "1",
    draftOrder: 7,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 0 },
      { terrain: "wheat", crowns: 0 },
    ],
  },
  {
    id: "2",
    draftOrder: 8,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 0 },
      { terrain: "wheat", crowns: 0 },
    ],
  },
  {
    id: "3",
    draftOrder: 9,
    expansion: "base",
    tiles: [
      { terrain: "forest", crowns: 0 },
      { terrain: "forest", crowns: 0 },
    ],
  },
  {
    id: "4",
    draftOrder: 10,
    expansion: "base",
    tiles: [
      { terrain: "forest", crowns: 0 },
      { terrain: "forest", crowns: 0 },
    ],
  },
  {
    id: "5",
    draftOrder: 11,
    expansion: "base",
    tiles: [
      { terrain: "forest", crowns: 0 },
      { terrain: "forest", crowns: 0 },
    ],
  },
  {
    id: "6",
    draftOrder: 12,
    expansion: "base",
    tiles: [
      { terrain: "forest", crowns: 0 },
      { terrain: "forest", crowns: 0 },
    ],
  },
  {
    id: "7",
    draftOrder: 13,
    expansion: "base",
    tiles: [
      { terrain: "lake", crowns: 0 },
      { terrain: "lake", crowns: 0 },
    ],
  },
  {
    id: "8",
    draftOrder: 14,
    expansion: "base",
    tiles: [
      { terrain: "lake", crowns: 0 },
      { terrain: "lake", crowns: 0 },
    ],
  },
  {
    id: "9",
    draftOrder: 15,
    expansion: "base",
    tiles: [
      { terrain: "lake", crowns: 0 },
      { terrain: "lake", crowns: 0 },
    ],
  },
  {
    id: "10",
    draftOrder: 16,
    expansion: "base",
    tiles: [
      { terrain: "grass", crowns: 0 },
      { terrain: "grass", crowns: 0 },
    ],
  },
  {
    id: "11",
    draftOrder: 17,
    expansion: "base",
    tiles: [
      { terrain: "grass", crowns: 0 },
      { terrain: "grass", crowns: 0 },
    ],
  },
  {
    id: "12",
    draftOrder: 18,
    expansion: "base",
    tiles: [
      { terrain: "swamp", crowns: 0 },
      { terrain: "swamp", crowns: 0 },
    ],
  },
  {
    id: "13",
    draftOrder: 19,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 0 },
      { terrain: "forest", crowns: 0 },
    ],
  },
  {
    id: "14",
    draftOrder: 20,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 0 },
      { terrain: "lake", crowns: 0 },
    ],
  },
  {
    id: "15",
    draftOrder: 21,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 0 },
      { terrain: "grass", crowns: 0 },
    ],
  },
  {
    id: "16",
    draftOrder: 22,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 0 },
      { terrain: "swamp", crowns: 0 },
    ],
  },
  {
    id: "17",
    draftOrder: 23,
    expansion: "base",
    tiles: [
      { terrain: "forest", crowns: 0 },
      { terrain: "lake", crowns: 0 },
    ],
  },
  {
    id: "18",
    draftOrder: 24,
    expansion: "base",
    tiles: [
      { terrain: "forest", crowns: 0 },
      { terrain: "grass", crowns: 0 },
    ],
  },
  {
    id: "19",
    draftOrder: 25,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 1 },
      { terrain: "forest", crowns: 0 },
    ],
  },
  {
    id: "20",
    draftOrder: 26,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 1 },
      { terrain: "lake", crowns: 0 },
    ],
  },
  {
    id: "21",
    draftOrder: 27,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 1 },
      { terrain: "grass", crowns: 0 },
    ],
  },
  {
    id: "22",
    draftOrder: 28,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 1 },
      { terrain: "swamp", crowns: 0 },
    ],
  },
  {
    id: "23",
    draftOrder: 29,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 1 },
      { terrain: "mine", crowns: 0 },
    ],
  },
  {
    id: "24",
    draftOrder: 30,
    expansion: "base",
    tiles: [
      { terrain: "forest", crowns: 1 },
      { terrain: "wheat", crowns: 0 },
    ],
  },
  {
    id: "25",
    draftOrder: 31,
    expansion: "base",
    tiles: [
      { terrain: "forest", crowns: 1 },
      { terrain: "wheat", crowns: 0 },
    ],
  },
  {
    id: "26",
    draftOrder: 32,
    expansion: "base",
    tiles: [
      { terrain: "forest", crowns: 1 },
      { terrain: "wheat", crowns: 0 },
    ],
  },
  {
    id: "27",
    draftOrder: 33,
    expansion: "base",
    tiles: [
      { terrain: "forest", crowns: 1 },
      { terrain: "wheat", crowns: 0 },
    ],
  },
  {
    id: "28",
    draftOrder: 34,
    expansion: "base",
    tiles: [
      { terrain: "forest", crowns: 1 },
      { terrain: "lake", crowns: 0 },
    ],
  },
  {
    id: "29",
    draftOrder: 35,
    expansion: "base",
    tiles: [
      { terrain: "forest", crowns: 1 },
      { terrain: "grass", crowns: 0 },
    ],
  },
  {
    id: "30",
    draftOrder: 36,
    expansion: "base",
    tiles: [
      { terrain: "lake", crowns: 1 },
      { terrain: "wheat", crowns: 0 },
    ],
  },
  {
    id: "31",
    draftOrder: 37,
    expansion: "base",
    tiles: [
      { terrain: "lake", crowns: 1 },
      { terrain: "wheat", crowns: 0 },
    ],
  },
  {
    id: "32",
    draftOrder: 38,
    expansion: "base",
    tiles: [
      { terrain: "lake", crowns: 1 },
      { terrain: "forest", crowns: 0 },
    ],
  },
  {
    id: "33",
    draftOrder: 39,
    expansion: "base",
    tiles: [
      { terrain: "lake", crowns: 1 },
      { terrain: "forest", crowns: 0 },
    ],
  },
  {
    id: "34",
    draftOrder: 40,
    expansion: "base",
    tiles: [
      { terrain: "lake", crowns: 1 },
      { terrain: "forest", crowns: 0 },
    ],
  },
  {
    id: "35",
    draftOrder: 41,
    expansion: "base",
    tiles: [
      { terrain: "lake", crowns: 1 },
      { terrain: "forest", crowns: 0 },
    ],
  },
  {
    id: "36",
    draftOrder: 42,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 0 },
      { terrain: "grass", crowns: 1 },
    ],
  },
  {
    id: "37",
    draftOrder: 43,
    expansion: "base",
    tiles: [
      { terrain: "lake", crowns: 0 },
      { terrain: "grass", crowns: 1 },
    ],
  },
  {
    id: "38",
    draftOrder: 44,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 0 },
      { terrain: "swamp", crowns: 1 },
    ],
  },
  {
    id: "39",
    draftOrder: 45,
    expansion: "base",
    tiles: [
      { terrain: "grass", crowns: 0 },
      { terrain: "swamp", crowns: 1 },
    ],
  },
  {
    id: "40",
    draftOrder: 46,
    expansion: "base",
    tiles: [
      { terrain: "mine", crowns: 1 },
      { terrain: "wheat", crowns: 0 },
    ],
  },
  {
    id: "41",
    draftOrder: 47,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 0 },
      { terrain: "grass", crowns: 2 },
    ],
  },
  {
    id: "42",
    draftOrder: 48,
    expansion: "base",
    tiles: [
      { terrain: "lake", crowns: 0 },
      { terrain: "grass", crowns: 2 },
    ],
  },
  {
    id: "43",
    draftOrder: 49,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 0 },
      { terrain: "swamp", crowns: 2 },
    ],
  },
  {
    id: "44",
    draftOrder: 50,
    expansion: "base",
    tiles: [
      { terrain: "grass", crowns: 0 },
      { terrain: "swamp", crowns: 2 },
    ],
  },
  {
    id: "45",
    draftOrder: 51,
    expansion: "base",
    tiles: [
      { terrain: "mine", crowns: 2 },
      { terrain: "wheat", crowns: 0 },
    ],
  },
  {
    id: "46",
    draftOrder: 52,
    expansion: "base",
    tiles: [
      { terrain: "swamp", crowns: 0 },
      { terrain: "mine", crowns: 2 },
    ],
  },
  {
    id: "47",
    draftOrder: 53,
    expansion: "base",
    tiles: [
      { terrain: "swamp", crowns: 0 },
      { terrain: "mine", crowns: 2 },
    ],
  },
  {
    id: "48",
    draftOrder: 54,
    expansion: "base",
    tiles: [
      { terrain: "wheat", crowns: 0 },
      { terrain: "mine", crowns: 3 },
    ],
  },
  {
    id: "49",
    draftOrder: 55,
    expansion: "age-of-giants",
    tiles: [
      { terrain: "wheat", crowns: 2 },
      { terrain: "forest", crowns: 1 },
    ],
  },
  {
    id: "50",
    draftOrder: 56,
    expansion: "age-of-giants",
    tiles: [
      { terrain: "forest", crowns: 2 },
      { terrain: "lake", crowns: 1 },
    ],
  },
  {
    id: "51",
    draftOrder: 57,
    expansion: "age-of-giants",
    tiles: [
      { terrain: "lake", crowns: 2 },
      { terrain: "grass", crowns: 1 },
    ],
  },
  {
    id: "52",
    draftOrder: 58,
    expansion: "age-of-giants",
    tiles: [
      { terrain: "grass", crowns: 2 },
      { terrain: "swamp", crowns: 1 },
    ],
  },
  {
    id: "53",
    draftOrder: 59,
    expansion: "age-of-giants",
    tiles: [
      { terrain: "swamp", crowns: 2 },
      { terrain: "mine", crowns: 1 },
    ],
  },
  {
    id: "54",
    draftOrder: 60,
    expansion: "age-of-giants",
    tiles: [
      { terrain: "mine", crowns: 2 },
      { terrain: "swamp", crowns: 1 },
    ],
  },
] as const satisfies readonly DominoDefinition[];
