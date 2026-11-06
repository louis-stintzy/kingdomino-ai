import type {
  Direction,
  DominoDefinition,
  TileDefinition,
} from '@kingdomino/game-core'
import { TERRAIN_LABELS } from '../board-utils'

const DIRECTION_LABELS: Readonly<Record<Direction, string>> = {
  north: 'Nord',
  east: 'Est',
  south: 'Sud',
  west: 'Ouest',
}

interface DominoPanelProps {
  readonly dominos: readonly DominoDefinition[]
  readonly selectedDomino: DominoDefinition
  readonly direction: Direction
  readonly onSelect: (id: string) => void
  readonly onRotateLeft: () => void
  readonly onRotateRight: () => void
}

function DominoTile({ tile }: { readonly tile: TileDefinition }) {
  return (
    <div className={`domino-tile terrain terrain--${tile.terrain}`}>
      <strong>{TERRAIN_LABELS[tile.terrain]}</strong>
      <span
        className={`domino-crowns${tile.crowns === 0 ? ' domino-crowns--empty' : ''}`}
        aria-label={`${tile.crowns} couronne${tile.crowns > 1 ? 's' : ''}`}
      >
        {tile.crowns > 0 ? '♛'.repeat(tile.crowns) : 'Aucune couronne'}
      </span>
    </div>
  )
}

export function DominoPanel({
  dominos,
  selectedDomino,
  direction,
  onSelect,
  onRotateLeft,
  onRotateRight,
}: DominoPanelProps) {
  return (
    <aside className="domino-panel" aria-labelledby="domino-panel-title">
      <p className="section-kicker">Catalogue réel · 60 dominos</p>
      <h2 id="domino-panel-title">Domino à placer</h2>

      <label className="field-label" htmlFor="domino-select">Sélection</label>
      <select
        id="domino-select"
        value={selectedDomino.id}
        onChange={(event) => onSelect(event.target.value)}
      >
        {dominos.map((domino) => (
          <option key={domino.id} value={domino.id}>
            Domino {domino.id} · ordre {domino.draftOrder}
          </option>
        ))}
      </select>

      <div className="selected-domino-heading">
        <span>Domino</span>
        <strong>{selectedDomino.id}</strong>
      </div>
      <div className={`domino-preview domino-preview--${direction}`}>
        {selectedDomino.tiles.map((tile, index) => (
          <DominoTile key={`${selectedDomino.id}-${index}`} tile={tile} />
        ))}
      </div>

      <div className="rotation-status" aria-live="polite">
        Orientation <strong>{DIRECTION_LABELS[direction]}</strong>
      </div>
      <div className="rotation-controls">
        <button type="button" onClick={onRotateLeft} aria-label="Tourner à gauche">
          ↶ <span>Gauche</span>
        </button>
        <button type="button" onClick={onRotateRight} aria-label="Tourner à droite">
          <span>Droite</span> ↷
        </button>
      </div>

      <p className="sandbox-note">
        Mode démonstration : les dominos restent disponibles après leur pose.
        La pioche et les tours seront ajoutés ultérieurement.
      </p>
    </aside>
  )
}
