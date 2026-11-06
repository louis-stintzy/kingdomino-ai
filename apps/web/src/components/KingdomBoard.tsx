import {
  getCellAt,
  type DominoDefinition,
  type Kingdom,
  type Position,
} from '@kingdomino/game-core'
import {
  createViewportPositions,
  positionKey,
  VIEWPORT_RADIUS,
} from '../board-utils'
import { KingdomCell } from './KingdomCell'

const VIEWPORT_POSITIONS = createViewportPositions(VIEWPORT_RADIUS)

interface KingdomBoardProps {
  readonly kingdom: Kingdom
  readonly domino?: DominoDefinition
  readonly previewPositions?: readonly [Position, Position] | null
  readonly previewValid?: boolean | null
  readonly legalPlacementKeys?: ReadonlySet<string>
  readonly interactive?: boolean
  readonly onCellEnter?: (position: Position) => void
  readonly onCellLeave?: () => void
  readonly onCellClick?: (position: Position) => void
}

export function KingdomBoard({
  kingdom,
  domino,
  previewPositions,
  previewValid,
  legalPlacementKeys = new Set(),
  interactive = true,
  onCellEnter,
  onCellLeave,
  onCellClick,
}: KingdomBoardProps) {
  return (
    <div
      className="board-scroll"
      tabIndex={interactive ? 0 : undefined}
      aria-label={`Plateau du royaume${interactive ? '' : ' en lecture seule'}`}
    >
      <div className="kingdom-board">
        {VIEWPORT_POSITIONS.map((position) => {
          const placedCell = getCellAt(kingdom, position)?.cell
          const isCastle =
            position.x === kingdom.castle.x && position.y === kingdom.castle.y
          const previewIndex = interactive && previewPositions?.findIndex(
            (candidate) =>
              candidate.x === position.x && candidate.y === position.y,
          )
          const previewTile =
            domino && (previewIndex === 0 || previewIndex === 1)
              ? domino.tiles[previewIndex]
              : undefined

          return (
            <KingdomCell
              key={positionKey(position)}
              position={position}
              cell={placedCell}
              isCastle={isCastle}
              previewTile={previewTile}
              previewValid={previewValid ?? null}
              isLegalAnchor={
                interactive && legalPlacementKeys.has(positionKey(position))
              }
              interactive={interactive}
              onEnter={() => onCellEnter?.(position)}
              onLeave={() => onCellLeave?.()}
              onClick={() => onCellClick?.(position)}
            />
          )
        })}
      </div>
    </div>
  )
}
