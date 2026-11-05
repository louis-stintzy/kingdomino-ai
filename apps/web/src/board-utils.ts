import type {
  DominoPlacement,
  PlacementErrorCode,
  Position,
  Terrain,
} from '@kingdomino/game-core'

export const TERRAIN_LABELS: Readonly<Record<Terrain, string>> = {
  wheat: 'Blé',
  forest: 'Forêt',
  lake: 'Lac',
  grass: 'Prairie',
  swamp: 'Marais',
  mine: 'Mine',
}

const ERROR_MESSAGES: Readonly<Record<PlacementErrorCode, string>> = {
  INVALID_KINGDOM_SIZE: 'La taille du royaume doit être un entier positif.',
  INVALID_POSITION: 'Les coordonnées de la case doivent être entières.',
  INVALID_DIRECTION: 'Cette orientation du domino est inconnue.',
  OCCUPIED: 'Une des deux cases est déjà occupée, peut-être par le château.',
  OUT_OF_BOUNDS: 'Ce placement dépasserait la limite du royaume 7 × 7.',
  NO_CONNECTION:
    'Le domino doit toucher le château ou un terrain identique par un côté.',
}

export function formatPlacementError(code: PlacementErrorCode): string {
  return ERROR_MESSAGES[code]
}

export function placementKey({ anchor, direction }: DominoPlacement): string {
  return `${anchor.x}:${anchor.y}:${direction}`
}

export function positionKey({ x, y }: Position): string {
  return `${x}:${y}`
}

export function createViewportPositions(radius: number): readonly Position[] {
  const positions: Position[] = []

  for (let y = -radius; y <= radius; y += 1) {
    for (let x = -radius; x <= radius; x += 1) {
      positions.push({ x, y })
    }
  }

  return positions
}
