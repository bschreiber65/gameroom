import { useEffect, useRef } from 'react'

const codeColors = {
  o: 'text-operative-solid',
  i: 'text-innocent-solid',
  a: 'text-assassin-solid',
}

export default function EventLog({ events }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events.length])

  // Show events in reverse chronological order (newest first)
  const reversed = [...events].reverse()

  return (
    <div
      ref={scrollRef}
      className="border border-white/10 rounded overflow-y-auto max-h-[400px] lg:max-h-[535px]"
    >
      {reversed.map((event, i) => {
        if (event.type === 'clue') {
          return (
            <div
              key={i}
              className={`px-3 py-2 capitalize transition-all duration-500 ${
                i === 0 ? 'animate-clue-blink' : ''
              }`}
            >
              {event.number}. {event.text}
            </div>
          )
        }
        if (event.type === 'card') {
          return (
            <div
              key={i}
              className={`px-3 py-2 italic transition-all duration-500 ${codeColors[event.code] || ''} ${
                i === 0 ? 'animate-message-blink' : ''
              }`}
            >
              {event.text}
            </div>
          )
        }
        if (event.type === 'system') {
          return (
            <div key={i} className="px-3 py-2 text-primary font-semibold">
              {event.text}
            </div>
          )
        }
        return null
      })}
      {events.length === 0 && (
        <div className="px-3 py-6 text-center text-muted text-sm">
          No events yet. Enter a clue to begin.
        </div>
      )}
    </div>
  )
}
