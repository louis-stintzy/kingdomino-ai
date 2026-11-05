import {
  getCellAt,
  type DominoDefinition,
  type Kingdom,
  type Position,
} from '@kingdomino/game-core'
import { createViewportPositions, positionKey } from '../board-utils'
import { KingdomCell } from './KingdomCell'

const VIEWPORT_POSITIONS = createViewportPositions(5)

interface KingdomBoardProps {
  readonly kingdom: Kingdom
  readonly domino: DominoDefinition
  readonly previewPositions: readonly [Position, Position] | null
  readonly previewValid: boolean | null
  readonly legalPlacementKeys: ReadonlySet<string>
  readonly onCellEnter: (position: Position) => void
  readonly onCellLeave: () => void
  readonly onCellClick: (position: Position) => void
}

export function KingdomBoard({
  kingdom,
  domino,
  previewPositions,
  previewValid,
  legalPlacementKeys,
  onCellEnter,
  onCellLeave,
  onCellClick,
}: KingdomBoardProps) {
  return (
    <div className="board-scroll" tabIndex={0} aria-label="Plateau du royaume">
      <div className="kingdom-board">
        {VIEWPORT_POSITIONS.map((position) => {
          const placedCell = getCellAt(kingdom, position)?.cell
          const isCastle =
            position.x === kingdom.castle.x && position.y === kingdom.castle.y
          const previewIndex = previewPositions?.findIndex(
            (candidate) =>
              candidate.x === position.x && candidate.y === position.y,
          )
          const previewTile =
            previewIndex === 0 || previewIndex === 1
              ? domino.tiles[previewIndex]
              : undefined

          return (
            <KingdomCell
              key={positionKey(position)}
              position={position}
              cell={placedCell}
              isCastle={isCastle}
              previewTile={previewTile}
              previewValid={previewValid}
              isLegalAnchor={legalPlacementKeys.has(positionKey(position))}
              onEnter={() => onCellEnter(position)}
              onLeave={onCellLeave}
              onClick={() => onCellClick(position)}
            />
          )
        })}
      </div>
    </div>
  )
}
