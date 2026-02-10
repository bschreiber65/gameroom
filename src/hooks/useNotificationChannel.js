import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useNotificationChannel() {
  const { user } = useAuth()
  const [pendingInvitation, setPendingInvitation] = useState(null)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!user) return

    const channel = supabase.channel(`user:${user.id}`)

    channel.on('broadcast', { event: 'invitation_received' }, ({ payload }) => {
      setPendingInvitation(payload)
    })

    channel.on('broadcast', { event: 'invitation_response' }, ({ payload }) => {
      setPendingInvitation(prev => {
        if (prev?.from_user_id === payload.from_user_id) return null
        return prev
      })
    })

    channel.on('broadcast', { event: 'game_created' }, ({ payload }) => {
      if (payload.redirect) {
        window.location.href = `/game/${payload.game_id}`
      }
    })

    channel.subscribe()
    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  function clearInvitation() {
    setPendingInvitation(null)
  }

  return { pendingInvitation, clearInvitation }
}
