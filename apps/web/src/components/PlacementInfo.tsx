import type { Direction, PlacementValidation } from '@kingdomino/game-core'

const DIRECTION_LABELS: Readonly<Record<Direction, string>> = {
  north: 'nord',
  east: 'est',
  south: 'sud',
  west: 'ouest',
}

interface PlacementInfoProps {
  readonly message: string
  readonly validation: PlacementValidation | null
  readonly legalCount: number
  readonly visibleLegalCount: number
  readonly direction: Direction
  readonly showLegalPlacements: boolean
  readonly onToggleLegalPlacements: () => void
}

export function PlacementInfo({
  message,
  validation,
  legalCount,
  visibleLegalCount,
  direction,
  showLegalPlacements,
  onToggleLegalPlacements,
}: PlacementInfoProps) {
  const status = validation ? (validation.valid ? 'valid' : 'invalid') : 'idle'

  return (
    <section className={`placement-info placement-info--${status}`} aria-live="polite">
      <div>
        <p className="section-kicker">Information de placement</p>
        <p className="placement-message">
          {validation && <strong>{validation.valid ? 'Valide. ' : 'Interdit. '}</strong>}
          {message}
        </p>
      </div>
      <div className="legal-actions">
        <span>
          {legalCount} placements légaux · {visibleLegalCount} vers {DIRECTION_LABELS[direction]}
        </span>
        <button
          className="secondary-button"
          type="button"
          aria-pressed={showLegalPlacements}
          onClick={onToggleLegalPlacements}
        >
          {showLegalPlacements ? 'Masquer les repères' : 'Voir les placements légaux'}
        </button>
      </div>
    </section>
  )
}
