import { createContext, useState, useCallback, useRef } from 'react'
import { SOUNDS } from '../lib/constants'

export const SoundContext = createContext(null)

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') === 'true'
  })
  const audioCache = useRef({})

  const toggle = useCallback(() => {
    setEnabled(prev => {
      const next = !prev
      localStorage.setItem('soundEnabled', String(next))
      return next
    })
  }, [])

  const play = useCallback((soundKey) => {
    if (!enabled) return
    const src = SOUNDS[soundKey]
    if (!src) return

    if (!audioCache.current[soundKey]) {
      audioCache.current[soundKey] = new Audio(src)
    }
    const audio = audioCache.current[soundKey]
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [enabled])

  return (
    <SoundContext.Provider value={{ enabled, toggle, play }}>
      {children}
    </SoundContext.Provider>
  )
}
