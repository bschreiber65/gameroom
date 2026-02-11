import GameStats from './GameStats'
import EventLog from './EventLog'
import ClueForm from './ClueForm'
import Button from '../ui/Button'

export default function CluePanel({
  gameState,
  isMyTurn,
  canSubmitClue,
  canEndGuessing,
  onClueSubmit,
  onEndGuessing,
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
      {canEndGuessing && (
        <Button variant="secondary" size="md" onClick={onEndGuessing} className="w-full">
          Done Guessing
        </Button>
      )}
      <ClueForm
        cards={gameState.cards}
        onSubmit={onClueSubmit}
        disabled={!isMyTurn || !canSubmitClue}
      />
    </div>
  )
}
