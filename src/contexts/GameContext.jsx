import { createContext, useReducer } from 'react'
import { gameReducer, initialGameState } from '../logic/gameReducer'

export const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState)

  return (
    <GameContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}
