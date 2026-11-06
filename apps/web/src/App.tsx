import { useState } from 'react'
import {
  DIRECTIONS,
  createKingdom,
  getDominoPositions,
  getKingdomBounds,
  getLegalPlacements,
  placeDomino,
  validateDominoPlacement,
  type Direction,
  type DominoPlacement,
  type Kingdom,
  type PlacementValidation,
  type Position,
} from '@kingdomino/game-core'
import { DOMINOS } from '@kingdomino/game-data'
import { formatPlacementError, positionKey } from './board-utils'
import { DominoPanel } from './components/DominoPanel'
import { KingdomBoard } from './components/KingdomBoard'
import { PlacementInfo } from './components/PlacementInfo'
import './App.css'

const KINGDOM_SIZE = 7

function App() {
  const [kingdom, setKingdom] = useState<Kingdom>(() => createKingdom())
  const [selectedDominoId, setSelectedDominoId] = useState<string>(DOMINOS[0].id)
  const [direction, setDirection] = useState<Direction>('east')
  const [hoveredPosition, setHoveredPosition] = useState<Position | null>(null)
  const [showLegalPlacements, setShowLegalPlacements] = useState(false)
  const [message, setMessage] = useState(
    'Survolez une case pour prévisualiser le domino, puis cliquez pour le poser.',
  )

  const selectedDomino =
    DOMINOS.find(({ id }) => id === selectedDominoId) ?? DOMINOS[0]
  const placement: DominoPlacement | null = hoveredPosition
    ? { anchor: hoveredPosition, direction }
    : null
  const validation: PlacementValidation | null = placement
    ? validateDominoPlacement(kingdom, selectedDomino, placement, KINGDOM_SIZE)
    : null
  const previewPositions = placement ? getDominoPositions(placement) : null
  const legalPlacements = getLegalPlacements(
    kingdom,
    selectedDomino,
    KINGDOM_SIZE,
  )
  const visibleLegalKeys = new Set(
    legalPlacements
      .filter((candidate) => candidate.direction === direction)
      .map(({ anchor }) => positionKey(anchor)),
  )
  const bounds = getKingdomBounds(kingdom)

  function rotate(step: -1 | 1) {
    const currentIndex = DIRECTIONS.indexOf(direction)
    const nextIndex =
      (currentIndex + step + DIRECTIONS.length) % DIRECTIONS.length
    setDirection(DIRECTIONS[nextIndex])
  }

  function handlePlacement(anchor: Position) {
    const candidate = { anchor, direction }
    const result = validateDominoPlacement(
      kingdom,
      selectedDomino,
      candidate,
      KINGDOM_SIZE,
    )

    if (!result.valid) {
      setMessage(formatPlacementError(result.reason))
      return
    }

    setKingdom(placeDomino(kingdom, selectedDomino, candidate, KINGDOM_SIZE))
    setHoveredPosition(null)
    setMessage(`Domino ${selectedDomino.id} placé avec succès.`)
  }

  function resetKingdom() {
    setKingdom(createKingdom())
    setHoveredPosition(null)
    setMessage('Royaume réinitialisé. Le château vous attend à l’origine.')
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Kingdomino AI · laboratoire</p>
          <h1>Atelier du royaume</h1>
          <p className="intro">
            Explorez les règles de placement sur un royaume 7 × 7, sans tours,
            pioche ni unicité des dominos pour le moment.
          </p>
        </div>
        <div className="header-stats" aria-label="État du royaume">
          <div>
            <strong>{kingdom.cells.length + 1}</strong>
            <span>cases occupées</span>
          </div>
          <div>
            <strong>{bounds.width} × {bounds.height}</strong>
            <span>dimensions</span>
          </div>
        </div>
      </header>

      <section className="workspace">
        <div className="board-column">
          <div className="board-heading">
            <div>
              <p className="section-kicker">Viewport −6 à +6</p>
              <h2>Votre royaume</h2>
            </div>
            <button
              className="secondary-button"
              type="button"
              onClick={resetKingdom}
            >
              Réinitialiser
            </button>
          </div>

          <KingdomBoard
            kingdom={kingdom}
            domino={selectedDomino}
            previewPositions={previewPositions}
            previewValid={validation?.valid ?? null}
            legalPlacementKeys={
              showLegalPlacements ? visibleLegalKeys : new Set()
            }
            onCellEnter={setHoveredPosition}
            onCellLeave={() => setHoveredPosition(null)}
            onCellClick={handlePlacement}
          />

          <PlacementInfo
            message={
              validation && !validation.valid
                ? formatPlacementError(validation.reason)
                : message
            }
            validation={validation}
            legalCount={legalPlacements.length}
            visibleLegalCount={visibleLegalKeys.size}
            direction={direction}
            showLegalPlacements={showLegalPlacements}
            onToggleLegalPlacements={() =>
              setShowLegalPlacements((shown) => !shown)
            }
          />
        </div>

        <DominoPanel
          dominos={DOMINOS}
          selectedDomino={selectedDomino}
          direction={direction}
          onSelect={setSelectedDominoId}
          onRotateLeft={() => rotate(-1)}
          onRotateRight={() => rotate(1)}
        />
      </section>
    </main>
  )
}

export default App
