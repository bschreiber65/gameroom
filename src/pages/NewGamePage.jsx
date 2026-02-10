import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { DEFAULT_TURN_LIMIT, DEFAULT_MISTAKE_LIMIT } from '../lib/constants'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function NewGamePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [turnLimit, setTurnLimit] = useState(DEFAULT_TURN_LIMIT)
  const [mistakeLimit, setMistakeLimit] = useState(DEFAULT_MISTAKE_LIMIT)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

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

    if (error) {
      alert('Failed to create game: ' + error.message)
      setLoading(false)
      return
    }

    navigate(`/game/${game.id}`)
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-text mb-6">New Game</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-dark p-6 rounded-lg">
        <Input
          label="Turn Limit"
          type="number"
          min={1}
          max={25}
          value={turnLimit}
          onChange={e => setTurnLimit(Number(e.target.value))}
        />
        <Input
          label="Mistake Limit"
          type="number"
          min={1}
          max={25}
          value={mistakeLimit}
          onChange={e => setMistakeLimit(Number(e.target.value))}
        />
        <p className="text-sm text-muted">
          Once created, share the game link with a friend to start playing.
        </p>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Game'}
        </Button>
      </form>
    </div>
  )
}
