import { useContext } from 'react'
import { SoundContext } from '../contexts/SoundContext'

export function useSound() {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider')
  }
  return context
}
