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

    let intervalId: ReturnType<typeof setInterval>
    // Align first tick to the next second boundary
    const timeoutId = setTimeout(() => {
      tick()
      intervalId = setInterval(tick, 1000)
    }, 1000 - new Date().getMilliseconds())

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [])

  return state
}
