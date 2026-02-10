import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { PRESENCE_STATUS } from '../lib/constants'

export function useLobbyPresence() {
  const { user, profile } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState({})
  const channelRef = useRef(null)

  useEffect(() => {
    if (!user) return

    const channel = supabase.channel('lobby', {
      config: { presence: { key: user.id } },
    })

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const map = {}
      for (const [key, values] of Object.entries(state)) {
        if (values[0]) {
          map[key] = values[0]
        }
      }
      setOnlineUsers(map)
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: user.id,
          name: profile?.name || 'Player',
          status: PRESENCE_STATUS.ONLINE,
        })
      }
    })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  async function updateStatus(status) {
    if (channelRef.current) {
      await channelRef.current.track({
        user_id: user?.id,
        name: profile?.name || 'Player',
        status,
      })
    }
  }

  return onlineUsers
}
