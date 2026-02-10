import { useEffect, useRef, useCallback } from 'react'
import { IDLE_TIMEOUT_MS, OFFLINE_TIMEOUT_MS, PRESENCE_STATUS } from '../lib/constants'

export function useIdleTimer(onStatusChange) {
  const idleTimeRef = useRef(0)
  const statusRef = useRef(PRESENCE_STATUS.ONLINE)
  const intervalRef = useRef(null)

  const resetTimer = useCallback(() => {
    idleTimeRef.current = 0
    if (statusRef.current !== PRESENCE_STATUS.ONLINE) {
      statusRef.current = PRESENCE_STATUS.ONLINE
      onStatusChange(PRESENCE_STATUS.ONLINE)
    }
  }, [onStatusChange])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      idleTimeRef.current += 60000 // 1 minute in ms

      if (idleTimeRef.current >= OFFLINE_TIMEOUT_MS && statusRef.current !== PRESENCE_STATUS.OFFLINE) {
        statusRef.current = PRESENCE_STATUS.OFFLINE
        onStatusChange(PRESENCE_STATUS.OFFLINE)
      } else if (idleTimeRef.current >= IDLE_TIMEOUT_MS && statusRef.current === PRESENCE_STATUS.ONLINE) {
        statusRef.current = PRESENCE_STATUS.IDLE
        onStatusChange(PRESENCE_STATUS.IDLE)
      }
    }, 60000)

    const events = ['mousemove', 'keypress', 'mousedown', 'touchstart']
    events.forEach(event => document.addEventListener(event, resetTimer))

    return () => {
      clearInterval(intervalRef.current)
      events.forEach(event => document.removeEventListener(event, resetTimer))
    }
  }, [onStatusChange, resetTimer])
}
