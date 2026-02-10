import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function EndGameModal({
  open,
  onClose,
  status,
  reason,
  opponentName,
  onPlayAgain,
  onNewGame,
}) {
  const isWin = status === 'win'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isWin ? 'You Win!' : 'Game Over'}
      className={isWin ? '!bg-operative-solid' : '!bg-assassin-solid'}
    >
      <p className="text-text mb-4">{reason}</p>
      <div className="flex flex-col gap-2">
        {opponentName && (
          <Button onClick={onPlayAgain}>
            Play Again with {opponentName}
          </Button>
        )}
        <Button variant="secondary" onClick={onNewGame}>
          New Game
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  )
}
