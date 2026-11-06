import type {
  KingdomCell as KingdomCellData,
  Position,
  TileDefinition,
} from '@kingdomino/game-core'
import { TERRAIN_LABELS } from '../board-utils'

const TERRAIN_SYMBOLS = {
  wheat: '≋',
  forest: '▲',
  lake: '≈',
  grass: '✦',
  swamp: '●',
  mine: '◆',
} as const

interface KingdomCellProps {
  readonly position: Position
  readonly cell?: KingdomCellData
  readonly isCastle: boolean
  readonly previewTile?: TileDefinition
  readonly previewValid: boolean | null
  readonly isLegalAnchor: boolean
  readonly interactive: boolean
  readonly onEnter: () => void
  readonly onLeave: () => void
  readonly onClick: () => void
}

export function KingdomCell({
  position,
  cell,
  isCastle,
  previewTile,
  previewValid,
  isLegalAnchor,
  interactive,
  onEnter,
  onLeave,
  onClick,
}: KingdomCellProps) {
  const shownTile = previewTile ?? cell
  const classes = [
    'kingdom-cell',
    shownTile ? `terrain terrain--${shownTile.terrain}` : '',
    previewTile ? 'kingdom-cell--preview' : '',
    previewTile && previewValid ? 'kingdom-cell--valid' : '',
    previewTile && previewValid === false ? 'kingdom-cell--invalid' : '',
    isCastle ? 'kingdom-cell--castle' : '',
    isLegalAnchor ? 'kingdom-cell--legal' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const contentLabel = isCastle
    ? 'château'
    : shownTile
      ? `${TERRAIN_LABELS[shownTile.terrain]}, ${shownTile.crowns} couronne${shownTile.crowns > 1 ? 's' : ''}`
      : 'case libre'

  return (
    <button
      className={classes}
      type="button"
      disabled={!interactive}
      aria-label={`Case (${position.x}, ${position.y}) : ${contentLabel}`}
      title={`(${position.x}, ${position.y}) · ${contentLabel}`}
      onPointerEnter={interactive ? onEnter : undefined}
      onPointerLeave={interactive ? onLeave : undefined}
      onFocus={interactive ? onEnter : undefined}
      onBlur={interactive ? onLeave : undefined}
      onClick={interactive ? onClick : undefined}
    >
      {isCastle ? (
        <span className="castle-icon" aria-hidden="true">♜</span>
      ) : shownTile ? (
        <>
          <span className="terrain-symbol" aria-hidden="true">
            {TERRAIN_SYMBOLS[shownTile.terrain]}
          </span>
          {shownTile.crowns > 0 && (
            <span className="crowns" aria-label={`${shownTile.crowns} couronne${shownTile.crowns > 1 ? 's' : ''}`}>
              {'♛'.repeat(shownTile.crowns)}
            </span>
          )}
        </>
      ) : null}
      <span className="cell-coordinate" aria-hidden="true">
        {position.x},{position.y}
      </span>
      {isLegalAnchor && <span className="legal-marker" aria-hidden="true">+</span>}
    </button>
  )
}
