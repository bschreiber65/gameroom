import { ArrowLeftRight, Volume2, VolumeX, Plus, UserPlus, Flag } from 'lucide-react'
import { useSound } from '../../hooks/useSound'
import Button from '../ui/Button'

export default function GameHeader({
  onSwapTurn,
  onUnlockCards,
  onNewGame,
  onInvite,
  onEndGame,
  isMyTurn,
  gameOver,
}) {
  const { enabled: soundEnabled, toggle: toggleSound } = useSound()

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={onSwapTurn}
        disabled={gameOver}
        title="Switch Turn"
      >
        <ArrowLeftRight size={16} />
        <span className="hidden sm:inline ml-1">Switch Turn</span>
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onUnlockCards}
        disabled={gameOver}
        title="Unlock Cards"
      >
        Unlock
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={toggleSound}
        title="Toggle Sound"
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onNewGame}
        title="New Game"
      >
        <Plus size={16} />
        <span className="hidden sm:inline ml-1">New Game</span>
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onInvite}
        title="Invite Player"
      >
        <UserPlus size={16} />
        <span className="hidden sm:inline ml-1">Invite</span>
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={onEndGame}
        disabled={gameOver}
        title="End Game"
      >
        <Flag size={16} />
        <span className="hidden sm:inline ml-1">End</span>
      </Button>
    </div>
  )
}
