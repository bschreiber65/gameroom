import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useNotificationChannel } from '../hooks/useNotificationChannel'
import { GAME_STATUS } from '../lib/constants'
import { createCards } from '../logic/gameEngine'
import Button from '../components/ui/Button'
import InvitationModal from '../components/modals/InvitationModal'
import { Plus, Circle, CheckCircle, XCircle } from 'lucide-react'

const statusConfig = {
  [GAME_STATUS.WAITING]: { icon: Circle, class: 'text-muted', label: 'Waiting' },
  [GAME_STATUS.IN_PROGRESS]: { icon: Circle, class: 'text-primary', label: 'In Progress' },
  [GAME_STATUS.WIN]: { icon: CheckCircle, class: 'text-operative-solid', label: 'Won' },
  [GAME_STATUS.LOSS]: { icon: XCircle, class: 'text-red-400', label: 'Lost' },
}

export default function LobbyPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const { pendingInvitation, clearInvitation } = useNotificationChannel()
  const [invitationLoading, setInvitationLoading] = useState(false)

  useEffect(() => {
    loadGames()
  }, [user])

  async function loadGames() {
    const { data } = await supabase
      .from('games')
      .select('id, status, created_at, player1:profiles!games_player1_id_fkey(name), player2:profiles!games_player2_id_fkey(name)')
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setGames(data)
    setLoading(false)
  }

  async function handleAcceptInvitation() {
    if (!pendingInvitation) return
    setInvitationLoading(true)

    const { game_id, from_user_id } = pendingInvitation

    // Update invitation status
    await supabase
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('game_id', game_id)
      .eq('to_user_id', user.id)

    // Join the game as player2
    const cards = createCards()
    await supabase
      .from('games')
      .update({
        player2_id: user.id,
        status: GAME_STATUS.IN_PROGRESS,
        cards,
      })
      .eq('id', game_id)

    // Notify the inviter
    const channel = supabase.channel(`user:${from_user_id}`)
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'game_created',
          payload: { game_id, redirect: true },
        })
        supabase.removeChannel(channel)
      }
    })

    clearInvitation()
    navigate(`/game/${game_id}`)
  }

  async function handleDeclineInvitation() {
    if (!pendingInvitation) return

    await supabase
      .from('invitations')
      .update({ status: 'declined' })
      .eq('game_id', pendingInvitation.game_id)
      .eq('to_user_id', user.id)

    // Notify inviter
    const channel = supabase.channel(`user:${pendingInvitation.from_user_id}`)
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'invitation_response',
          payload: { from_user_id: user.id, declined: true, name: profile?.name },
        })
        supabase.removeChannel(channel)
      }
    })

    clearInvitation()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text">Game Lobby</h2>
        <Link to="/new-game">
          <Button>
            <Plus size={18} className="mr-1 inline" />
            New Game
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-muted">Loading games...</p>
      ) : games.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted mb-4">No games yet. Create one to get started!</p>
          <Link to="/new-game">
            <Button>Create Your First Game</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {games.map(game => {
            const config = statusConfig[game.status] || statusConfig[GAME_STATUS.WAITING]
            const Icon = config.icon
            return (
              <Link
                key={game.id}
                to={`/game/${game.id}`}
                className="flex items-center gap-3 bg-dark rounded-lg p-4 hover:bg-surface transition-colors"
              >
                <Icon size={18} className={config.class} />
                <div className="flex-1">
                  <span className="text-text capitalize">
                    {game.player1?.name || '?'} vs {game.player2?.name || 'Waiting...'}
                  </span>
                  <span className={`ml-2 text-xs ${config.class}`}>{config.label}</span>
                </div>
                <span className="text-xs text-muted">
                  {new Date(game.created_at).toLocaleDateString()}
                </span>
              </Link>
            )
          })}
        </div>
      )}

      <InvitationModal
        open={!!pendingInvitation}
        onClose={clearInvitation}
        fromName={pendingInvitation?.from_name || 'Someone'}
        onAccept={handleAcceptInvitation}
        onDecline={handleDeclineInvitation}
        loading={invitationLoading}
      />
    </div>
  )
}
