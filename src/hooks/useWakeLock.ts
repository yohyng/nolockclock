import { useState, useEffect, useCallback, useRef } from 'react'

export type WakeLockStatus = 'active' | 'released' | 'unsupported' | 'error' | 'idle'

export function useWakeLock(enabled: boolean) {
  const [status, setStatus] = useState<WakeLockStatus>('idle')
  const sentinelRef = useRef<WakeLockSentinel | null>(null)
  const enabledRef = useRef(enabled)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const acquire = useCallback(async () => {
    if (!enabledRef.current) return
    if (!('wakeLock' in navigator)) {
      setStatus('unsupported')
      return
    }
    try {
      sentinelRef.current = await navigator.wakeLock.request('screen')
      setStatus('active')

      sentinelRef.current.addEventListener('release', () => {
        setStatus('released')
        sentinelRef.current = null
      })
    } catch {
      setStatus('error')
    }
  }, [])

  const release = useCallback(async () => {
    if (sentinelRef.current) {
      await sentinelRef.current.release()
      sentinelRef.current = null
    }
    setStatus('idle')
  }, [])

  // Acquire on mount and when enabled changes
  useEffect(() => {
    if (enabled) {
      acquire()
    } else {
      release()
    }
    return () => {
      sentinelRef.current?.release()
    }
  }, [enabled, acquire, release])

  // Re-acquire when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabledRef.current) {
        acquire()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [acquire])

  return { status, acquire, release }
}
