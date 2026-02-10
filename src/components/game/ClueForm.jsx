import { useState } from 'react'
import { validateClue, getCardWords } from '../../logic/gameEngine'
import { Send } from 'lucide-react'

export default function ClueForm({ cards, onSubmit, disabled }) {
  const [clue, setClue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!clue.trim() || disabled) return

    const cardWords = getCardWords(cards)
    const validation = validateClue(clue.trim(), cardWords)
    if (!validation.valid) {
      alert(validation.reason)
      setClue('')
      return
    }

    const formatted = clue.trim().charAt(0).toUpperCase() + clue.trim().slice(1)
    onSubmit(formatted)
    setClue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-0">
      <input
        type="text"
        value={clue}
        onChange={e => setClue(e.target.value)}
        placeholder="Enter clue..."
        disabled={disabled}
        className="flex-1 bg-dark border border-white/20 rounded-l px-3 py-2 text-text placeholder-muted/50 focus:outline-none focus:border-primary disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !clue.trim()}
        className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-r transition-colors disabled:opacity-50"
      >
        <Send size={18} />
      </button>
    </form>
  )
}
