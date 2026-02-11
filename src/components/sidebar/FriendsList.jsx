import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useLobbyPresence } from '../../hooks/useLobbyPresence'
import { PRESENCE_STATUS } from '../../lib/constants'
import { UserPlus } from 'lucide-react'
import FriendInviteModal from '../modals/FriendInviteModal'

const statusColors = {
  [PRESENCE_STATUS.ONLINE]: 'bg-green-400',
  [PRESENCE_STATUS.IDLE]: 'bg-orange-400',
  [PRESENCE_STATUS.OFFLINE]: 'bg-gray-500',
}

export default function FriendsList() {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [inviteTarget, setInviteTarget] = useState(null)
  const onlineUsers = useLobbyPresence()

  useEffect(() => {
    if (!user) return
    loadFriends()
  }, [user])

  async function loadFriends() {
    try {
      const { data } = await supabase
        .from('friendships')
        .select('friend_id, friend:profiles!friendships_friend_id_fkey(id, name)')
        .eq('user_id', user.id)

      if (data) {
        setFriends(data.map(f => f.friend))
      }
    } catch {
      // silent — sidebar shows empty friends message
    }
  }

  function getFriendStatus(friendId) {
    const presence = onlineUsers[friendId]
    if (!presence) return PRESENCE_STATUS.OFFLINE
    return presence.status || PRESENCE_STATUS.ONLINE
  }

  async function handleInvite({ turnLimit, mistakeLimit }) {
    if (!inviteTarget) return

    const { data: game, error } = await supabase
      .from('games')
      .insert({
        player1_id: user.id,
        status: 'waiting',
        turn_limit: turnLimit,
        mistake_limit: mistakeLimit,
      })
      .select()
      .single()

    if (error || !game) return

    await supabase.from('invitations').insert({
      from_user_id: user.id,
      to_user_id: inviteTarget.id,
      game_id: game.id,
      turn_limit: turnLimit,
      mistake_limit: mistakeLimit,
    })

    // Broadcast invitation via user channel
    const channel = supabase.channel(`user:${inviteTarget.id}`)
    channel.httpSend('invitation_received', {
      from_user_id: user.id,
      from_name: user.user_metadata?.name || 'Someone',
      game_id: game.id,
    }).catch(() => {})

    setInviteTarget(null)
  }

  return (
    <div className="px-2 py-1">
      <h3 className="text-xs text-muted uppercase tracking-wider px-3 py-1">Friends</h3>
      {friends.length === 0 ? (
        <p className="text-xs text-muted px-3 py-1">
          Friends are added automatically when you play a game with someone.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {friends.map(friend => (
            <li key={friend.id} className="flex items-center justify-between px-3 py-1.5 rounded hover:bg-white/5 group">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${statusColors[getFriendStatus(friend.id)]}`} />
                <span className="text-sm text-text capitalize">{friend.name}</span>
              </div>
              <button
                onClick={() => setInviteTarget(friend)}
                className="text-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                title="Invite to game"
              >
                <UserPlus size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <FriendInviteModal
        open={!!inviteTarget}
        onClose={() => setInviteTarget(null)}
        friendName={inviteTarget?.name || ''}
        onInvite={handleInvite}
      />
    </div>
  )
}
