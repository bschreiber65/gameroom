import GameStats from './GameStats'
import EventLog from './EventLog'
import ClueForm from './ClueForm'

export default function CluePanel({
  gameState,
  isMyTurn,
  canSubmitClue,
  onClueSubmit,
}) {
  return (
    <div className="flex flex-col gap-3">
      <GameStats
        turnCount={gameState.turn_count}
        clueCount={gameState.clue_count}
        mistakeCount={gameState.mistake_count}
        correctCount={gameState.correct_count}
        turnLimit={gameState.turn_limit}
        mistakeLimit={gameState.mistake_limit}
      />
      <EventLog events={gameState.event_log} />
      <ClueForm
        cards={gameState.cards}
        onSubmit={onClueSubmit}
        disabled={!isMyTurn || !canSubmitClue}
      />
    </div>
  )
}
