import { useAuth } from '../../hooks/useAuth'
import { CARD_TYPES } from '../../lib/constants'

const bgColors = {
  [CARD_TYPES.OPERATIVE]: 'bg-operative',
  [CARD_TYPES.INNOCENT]: 'bg-innocent',
  [CARD_TYPES.ASSASSIN]: 'bg-assassin',
}

const confirmedBorders = {
  [CARD_TYPES.OPERATIVE]: 'border-operative-confirmed animate-operative-blink',
  [CARD_TYPES.INNOCENT]: 'border-innocent-confirmed animate-innocent-blink',
  [CARD_TYPES.ASSASSIN]: 'border-assassin-confirmed animate-assassin-blink',
}

export default function CardCell({ card, playerRole, onClick, disabled }) {
  const { user } = useAuth()
  const isPlayer1 = playerRole === 'player1'

  // Determine what the current player sees
  const myIdentifier = isPlayer1 ? card.p1_identifier : card.p2_identifier
  const opponentIdentifier = isPlayer1 ? card.p2_identifier : card.p1_identifier

  // Has the opponent guessed this card? (their identified flag)
  const opponentIdentified = isPlayer1 ? card.p2_identified : card.p1_identified
  // Have I guessed this card?
  const myIdentified = isPlayer1 ? card.p1_identified : card.p2_identified

  // Inner border = my identifier color (always visible to me)
  const innerBg = bgColors[myIdentifier] || ''
  // Outer border = opponent's identifier color (transparent to me unless confirmed)
  const outerBg = bgColors[opponentIdentifier] || ''

  // Show confirmed styling when the card has been guessed
  const innerConfirmed = myIdentified && confirmedBorders[myIdentifier]
  const outerConfirmed = opponentIdentified && confirmedBorders[opponentIdentifier]

  return (
    <div className="relative">
      {/* Outer layer (opponent's identifier) - opaque unless confirmed */}
      <div
        className={`rounded w-full aspect-square border-[4px] transition-all duration-300 ${
          opponentIdentified ? `${outerBg} ${outerConfirmed || ''}` : 'border-transparent'
        } ${!opponentIdentified ? 'bg-transparent' : ''}`}
      >
        {/* Inner layer (my identifier) - visible to me */}
        <div
          className={`absolute inset-0 rounded border-[4px] transition-all duration-300 ${innerBg} ${
            myIdentified ? (innerConfirmed || '') : ''
          }`}
        >
          {/* Clickable card surface */}
          <button
            onClick={() => onClick(card.position)}
            disabled={disabled}
            className="absolute inset-0 flex flex-col items-center justify-center rounded cursor-pointer hover:bg-white/20 active:bg-black/40 transition-none disabled:cursor-default disabled:hover:bg-transparent"
          >
            <span className="text-[10px] sm:text-xs md:text-sm font-medium uppercase tracking-wider text-text drop-shadow-sm">
              {card.word}
            </span>
            {/* Identified badges */}
            <div className="flex gap-1 mt-0.5">
              {card.p1_identified && (
                <span className="text-[8px] sm:text-[10px] font-bold text-orange-300">P1</span>
              )}
              {card.p2_identified && (
                <span className="text-[8px] sm:text-[10px] font-bold text-sky-300">P2</span>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
