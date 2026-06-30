import { useState, useEffect, useCallback, useRef } from 'react'

export type WakeLockStatus =
  | 'active'
  | 'released'
  | 'unsupported'
  | 'error'
  | 'awaiting-gesture'
  | 'idle'

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
    // Skip if already held
    if (sentinelRef.current && !sentinelRef.current.released) return

    try {
      const sentinel = await navigator.wakeLock.request('screen')
      sentinelRef.current = sentinel
      setStatus('active')

      sentinel.addEventListener('release', () => {
        if (sentinelRef.current === sentinel) {
          sentinelRef.current = null
          setStatus('released')
        }
      })
    } catch (e) {
      // NotAllowedError = Safari requires user gesture first
      if (e instanceof DOMException && e.name === 'NotAllowedError') {
        setStatus('awaiting-gesture')
      } else {
        setStatus('error')
      }
    }
  }, [])

  const release = useCallback(async () => {
    const s = sentinelRef.current
    sentinelRef.current = null
    try { await s?.release() } catch { /* ignore */ }
    setStatus('idle')
  }, [])

  // Try on mount — Chrome/Firefox succeed; Safari sets 'awaiting-gesture'
  useEffect(() => {
    if (enabled) {
      acquire()
    }
    return () => {
      sentinelRef.current?.release().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Release when user disables
  useEffect(() => {
    if (!enabled) release()
  }, [enabled, release])

  // Re-acquire when page becomes visible (e.g. returning from another app)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && enabledRef.current) {
        acquire()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [acquire])

  return { status, acquire, release }
}
