export default function GameStats({ turnCount, clueCount, mistakeCount, correctCount, turnLimit, mistakeLimit }) {
  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <StatBadge label="Turns" value={turnCount} max={turnLimit} />
      <StatBadge label="Clues" value={clueCount} />
      <StatBadge label="Mistakes" value={mistakeCount} max={mistakeLimit} warn />
      <StatBadge label="Correct" value={correctCount} max={15} success />
    </div>
  )
}

function StatBadge({ label, value, max, warn, success }) {
  const isAtLimit = max && value >= max
  const color = isAtLimit && warn
    ? 'bg-red-500/30 text-red-300'
    : success
    ? 'bg-operative/30 text-operative-solid'
    : 'bg-surface text-text'

  return (
    <div className={`px-3 py-1 rounded ${color}`}>
      <span className="text-muted text-xs">{label}: </span>
      <span className="font-semibold">
        {value}{max ? `/${max}` : ''}
      </span>
    </div>
  )
}
