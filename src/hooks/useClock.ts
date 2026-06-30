import { useState, useEffect } from 'react'

export interface ClockState {
  hours: number
  minutes: number
  seconds: number
  date: Date
}

export function useClock(): ClockState {
  const [state, setState] = useState<ClockState>(() => {
    const now = new Date()
    return {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      date: now,
    }
  })

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setState({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
        date: now,
      })
    }

    // Align to the next second boundary
    const delay = 1000 - new Date().getMilliseconds()
    const timeout = setTimeout(() => {
      tick()
      const interval = setInterval(tick, 1000)
      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [])

  return state
}
