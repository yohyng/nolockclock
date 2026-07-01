import { useState, useEffect, useCallback, useRef } from 'react'

export type WakeLockStatus =
  | 'active'
  | 'video'
  | 'released'
  | 'unsupported'
  | 'error'
  | 'awaiting-gesture'
  | 'idle'

export function useWakeLock(enabled: boolean) {
  const [status, setStatus] = useState<WakeLockStatus>('idle')
  const sentinelRef = useRef<WakeLockSentinel | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const enabledRef = useRef(enabled)

  useEffect(() => { enabledRef.current = enabled }, [enabled])

  // nosleep.mp4 をバックグラウンドで常時ループ（スリープ防止の保険）
  useEffect(() => {
    const video = document.createElement('video')
    video.src = '/nosleep.mp4'
    video.muted = true
    video.loop = true
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.style.cssText =
      'position:fixed;top:0;left:0;width:1px;height:1px;opacity:.01;pointer-events:none;z-index:-2;'
    document.body.appendChild(video)
    videoRef.current = video
    return () => video.remove()
  }, [])

  const playVideo = useCallback(async () => {
    try { await videoRef.current?.play() } catch { /* ignore */ }
  }, [])

  const pauseVideo = useCallback(() => {
    videoRef.current?.pause()
  }, [])

  const acquireWakeLock = useCallback(async (): Promise<boolean> => {
    if (!('wakeLock' in navigator)) return false
    if (sentinelRef.current && !sentinelRef.current.released) return true
    try {
      const sentinel = await navigator.wakeLock.request('screen')
      sentinelRef.current = sentinel
      sentinel.addEventListener('release', () => {
        if (sentinelRef.current === sentinel) sentinelRef.current = null
      })
      return true
    } catch {
      return false
    }
  }, [])

  const acquire = useCallback(async () => {
    if (!enabledRef.current) return
    const ok = await acquireWakeLock()
    if (ok) {
      setStatus('active')
      await playVideo()
      return
    }
    if (!('wakeLock' in navigator)) {
      setStatus('unsupported')
    } else {
      setStatus('awaiting-gesture')
    }
    await playVideo()
    if (videoRef.current && !videoRef.current.paused) {
      setStatus(prev => prev === 'awaiting-gesture' ? 'awaiting-gesture' : 'video')
    }
  }, [acquireWakeLock, playVideo])

  const release = useCallback(async () => {
    const s = sentinelRef.current
    sentinelRef.current = null
    try { await s?.release() } catch { /* ignore */ }
    pauseVideo()
    setStatus('idle')
  }, [pauseVideo])

  useEffect(() => {
    if (enabled) acquire()
    return () => { sentinelRef.current?.release().catch(() => {}) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!enabled) release()
  }, [enabled, release])

  useEffect(() => {
    const onVisibility = async () => {
      if (!enabledRef.current) return
      if (document.visibilityState === 'visible') {
        const ok = await acquireWakeLock()
        if (ok) setStatus('active')
        await playVideo()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [acquireWakeLock, playVideo])

  return { status, acquire, release }
}
