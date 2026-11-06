import { describe, expect, it } from 'vitest'
import {
  createViewportPositions,
  formatPlacementError,
  placementKey,
  VIEWPORT_RADIUS,
} from './board-utils'

describe('board utilities', () => {
  it('creates a square viewport centered on the castle origin', () => {
    const positions = createViewportPositions(1)

    expect(positions).toHaveLength(9)
    expect(positions[0]).toEqual({ x: -1, y: -1 })
    expect(positions[4]).toEqual({ x: 0, y: 0 })
    expect(positions[8]).toEqual({ x: 1, y: 1 })
  })

  it('covers the complete 13 by 13 viewport from -6 to +6', () => {
    const positions = createViewportPositions(VIEWPORT_RADIUS)
    const xs = positions.map(({ x }) => x)
    const ys = positions.map(({ y }) => y)

    expect(positions).toHaveLength(169)
    expect(Math.min(...xs)).toBe(-6)
    expect(Math.max(...xs)).toBe(6)
    expect(Math.min(...ys)).toBe(-6)
    expect(Math.max(...ys)).toBe(6)
    expect(new Set(positions.map(({ x, y }) => `${x}:${y}`)).size).toBe(169)
  })

  it('creates a stable key for an oriented anchor', () => {
    expect(
      placementKey({ anchor: { x: -2, y: 3 }, direction: 'west' }),
    ).toBe('-2:3:west')
  })

  it('presents engine errors in understandable French', () => {
    expect(formatPlacementError('OUT_OF_BOUNDS')).toContain('7 × 7')
    expect(formatPlacementError('NO_CONNECTION')).toContain('terrain identique')
  })
})
