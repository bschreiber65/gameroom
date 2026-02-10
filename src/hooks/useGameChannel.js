import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { PRESENCE_STATUS } from '../lib/constants'

export function useGameChannel(gameId, dispatch) {
  const { user, profile } = useAuth()
  const channelRef = useRef(null)

  useEffect(() => {
    if (!gameId || !user) return

    const channel = supabase.channel(`game:${gameId}`, {
      config: { presence: { key: user.id } },
    })

    // Broadcast event handlers
    channel.on('broadcast', { event: 'card_click' }, ({ payload }) => {
      if (payload.userId !== user.id) {
        dispatch({ type: 'CARD_CLICKED', payload: payload })
      }
    })

    channel.on('broadcast', { event: 'clue_submitted' }, ({ payload }) => {
      if (payload.userId !== user.id) {
        dispatch({ type: 'CLUE_SUBMITTED', payload: payload })
      }
    })

    channel.on('broadcast', { event: 'turn_swapped' }, ({ payload }) => {
      if (payload.userId !== user.id) {
        dispatch({ type: 'TURN_SWAPPED' })
      }
    })

    channel.on('broadcast', { event: 'cards_unlocked' }, () => {
      dispatch({ type: 'CARDS_UNLOCKED' })
    })

    channel.on('broadcast', { event: 'player_joined' }, ({ payload }) => {
      dispatch({ type: 'PLAYER_JOINED', payload })
    })

    channel.on('broadcast', { event: 'game_ended' }, ({ payload }) => {
      dispatch({ type: 'GAME_ENDED', payload })
    })

    // Presence handlers
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const presenceMap = {}
      for (const [key, values] of Object.entries(state)) {
        if (values[0]) {
          presenceMap[key] = values[0]
        }
      }
      dispatch({ type: 'PRESENCE_UPDATED', payload: presenceMap })
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
  }, [gameId, user?.id])

  function broadcast(event, payload) {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event,
        payload: { ...payload, userId: user?.id },
      })
    }
  }

  async function updatePresence(status) {
    if (channelRef.current) {
      await channelRef.current.track({
        user_id: user?.id,
        name: profile?.name || 'Player',
        status,
      })
    }
  }

  return { broadcast, updatePresence }
}
