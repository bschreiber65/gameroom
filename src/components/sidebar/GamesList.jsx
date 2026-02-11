import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { GAME_STATUS } from '../../lib/constants'
import { Circle, CheckCircle, XCircle } from 'lucide-react'

const statusIcons = {
  [GAME_STATUS.WAITING]: <Circle size={14} className="text-muted" />,
  [GAME_STATUS.IN_PROGRESS]: <Circle size={14} className="text-primary" />,
  [GAME_STATUS.WIN]: <CheckCircle size={14} className="text-operative-solid" />,
  [GAME_STATUS.LOSS]: <XCircle size={14} className="text-red-400" />,
}

export default function GamesList() {
  const { user } = useAuth()
  const [games, setGames] = useState([])

  useEffect(() => {
    if (!user) return
    loadGames()
  }, [user])

  async function loadGames() {
    try {
      const { data } = await supabase
        .from('games')
        .select('id, status, created_at, player1:profiles!games_player1_id_fkey(name), player2:profiles!games_player2_id_fkey(name)')
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10)

      if (data) setGames(data)
    } catch {
      // silent — sidebar shows "No games yet."
    }
  }

  return (
    <div className="px-2 py-1">
      <h3 className="text-xs text-muted uppercase tracking-wider px-3 py-1">Recent Games</h3>
      {games.length === 0 ? (
        <p className="text-xs text-muted px-3 py-1">No games yet.</p>
      ) : (
        <ul className="space-y-0.5">
          {games.map(game => (
            <li key={game.id}>
              <Link
                to={`/game/${game.id}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-sm text-text hover:bg-white/5 transition-colors"
              >
                {statusIcons[game.status]}
                <span className="truncate capitalize">
                  {game.player1?.name || '?'} vs {game.player2?.name || '...'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
