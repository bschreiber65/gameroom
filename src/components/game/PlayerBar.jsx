import { PRESENCE_STATUS } from '../../lib/constants'

const statusColors = {
  [PRESENCE_STATUS.ONLINE]: 'bg-green-400',
  [PRESENCE_STATUS.IDLE]: 'bg-orange-400',
  [PRESENCE_STATUS.OFFLINE]: 'bg-gray-500',
}

export default function PlayerBar({
  player1Name,
  player2Name,
  currentTurn,
  player1Status = PRESENCE_STATUS.OFFLINE,
  player2Status = PRESENCE_STATUS.OFFLINE,
}) {
  return (
    <div className="flex gap-3 sm:gap-4">
      <PlayerIndicator
        name={player1Name || 'Player 1'}
        label="P1"
        isActive={currentTurn === 'player1'}
        status={player1Status}
      />
      <PlayerIndicator
        name={player2Name || 'Waiting...'}
        label="P2"
        isActive={currentTurn === 'player2'}
        status={player2Status}
      />
    </div>
  )
}

function PlayerIndicator({ name, label, isActive, status }) {
  return (
    <div
      className={`flex-1 text-center py-2 px-4 rounded-full capitalize text-sm sm:text-lg font-light tracking-wide transition-all duration-500 ${
        isActive ? 'bg-primary' : 'bg-surface'
      }`}
    >
      <span>{name}</span>
      <span
        className={`inline-block w-3 h-3 rounded-full ml-2 relative top-[1px] ${statusColors[status]}`}
      />
    </div>
  )
}
