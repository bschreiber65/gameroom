import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useChatSubscription } from '../../hooks/useChatSubscription'
import { Send, ChevronDown, ChevronUp } from 'lucide-react'

export default function ChatPanel({ onUnreadChange, gameId }) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [collapsed, setCollapsed] = useState(true)
  const scrollRef = useRef(null)

  // Load initial messages
  useEffect(() => {
    loadMessages()
  }, [gameId])

  async function loadMessages() {
    let query = supabase
      .from('messages')
      .select('*, sender:profiles!messages_user_id_fkey(name)')
      .order('created_at', { ascending: true })
      .limit(50)

    if (gameId) {
      query = query.eq('game_id', gameId)
    } else {
      query = query.is('game_id', null)
    }

    const { data } = await query
    if (data) setMessages(data)
  }

  // Subscribe to new messages
  useChatSubscription(gameId, (newMsg) => {
    setMessages(prev => [...prev, newMsg])
    if (collapsed && onUnreadChange) {
      onUnreadChange(prev => prev + 1)
    }
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length, collapsed])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return

    await supabase.from('messages').insert({
      user_id: user.id,
      game_id: gameId || null,
      content: input.trim(),
    })
    setInput('')
  }

  return (
    <div className="border-t border-white/10">
      <button
        onClick={() => {
          setCollapsed(!collapsed)
          if (collapsed && onUnreadChange) onUnreadChange(0)
        }}
        className="flex items-center justify-between w-full px-4 py-2 text-xs text-muted uppercase tracking-wider hover:text-text transition-colors"
      >
        <span>Chat {gameId ? '(In-Game)' : '(Global)'}</span>
        {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {!collapsed && (
        <div className="flex flex-col">
          <div
            ref={scrollRef}
            className="h-48 overflow-y-auto px-3 py-1 space-y-1"
          >
            {messages.map(msg => (
              <div key={msg.id} className="text-xs">
                <span className="text-muted">{msg.sender?.name || 'Unknown'}: </span>
                <span className="text-text">{msg.content}</span>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-xs text-muted text-center py-4">No messages yet.</p>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-0 p-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-dark border border-white/20 rounded-l px-2 py-1 text-xs text-text placeholder-muted/50 focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-primary hover:bg-primary/80 text-white px-2 py-1 rounded-r text-xs disabled:opacity-50"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
