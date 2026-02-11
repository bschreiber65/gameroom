import CardCell from './CardCell'

export default function CardGrid({ cards, playerRole, onCardClick, disabled }) {
  // Sort cards by position so they render in grid order
  const sortedCards = [...cards].sort((a, b) => a.position - b.position)

  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-1.5 md:gap-2 w-full max-w-[600px] mx-auto">
      {sortedCards.map(card => (
        <CardCell
          key={card.position}
          card={card}
          playerRole={playerRole}
          onClick={onCardClick}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
