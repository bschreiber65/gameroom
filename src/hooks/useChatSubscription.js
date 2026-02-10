import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useChatSubscription(gameId, onNewMessage) {
  useEffect(() => {
    const filter = gameId
      ? `game_id=eq.${gameId}`
      : 'game_id=is.null'

    const channel = supabase
      .channel(`chat:${gameId || 'global'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter,
        },
        async (payload) => {
          // Fetch the full message with sender name
          const { data } = await supabase
            .from('messages')
            .select('*, sender:profiles!messages_user_id_fkey(name)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            onNewMessage(data)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId])
}
