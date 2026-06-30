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
  const [isPip, setIsPip] = useState(false)
  const sentinelRef = useRef<WakeLockSentinel | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const enabledRef = useRef(enabled)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  // ── 動画要素のセットアップ ─────────────────────────────────────
  useEffect(() => {
    const video = document.createElement('video')
    video.src = '/nosleep.mp4'
    video.muted = true
    video.loop = true
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    // 1×1 で画面端に配置（display:none だと PiP 不可、opacity:0 も NG）
    video.style.cssText =
      'position:fixed;top:0;left:0;width:1px;height:1px;opacity:.01;pointer-events:none;z-index:-1;'
    video.addEventListener('enterpictureinpicture', () => setIsPip(true))
    video.addEventListener('leavepictureinpicture', () => setIsPip(false))
    document.body.appendChild(video)
    videoRef.current = video
    return () => video.remove()
  }, [])

  // ── 動画再生 ───────────────────────────────────────────────────
  const playVideo = useCallback(async () => {
    try { await videoRef.current?.play() } catch { /* ignore */ }
  }, [])

  const pauseVideo = useCallback(() => {
    videoRef.current?.pause()
  }, [])

  // ── Wake Lock API 取得 ────────────────────────────────────────
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

  // ── 取得（Wake Lock → 動画フォールバック） ──────────────────────
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
      setStatus(prev => (prev === 'awaiting-gesture' ? 'awaiting-gesture' : 'video'))
    }
  }, [acquireWakeLock, playVideo])

  // ── 解除 ───────────────────────────────────────────────────────
  const release = useCallback(async () => {
    const s = sentinelRef.current
    sentinelRef.current = null
    try { await s?.release() } catch { /* ignore */ }
    pauseVideo()
    setStatus('idle')
  }, [pauseVideo])

  // ── PiP 切替（ユーザーボタン用） ─────────────────────────────
  const togglePip = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) await playVideo()

    if (document.pictureInPictureElement === video) {
      await document.exitPictureInPicture().catch(() => {})
    } else {
      await video.requestPictureInPicture().catch(() => {})
    }
  }, [playVideo])

  // ── マウント時に自動取得を試みる ───────────────────────────────
  useEffect(() => {
    if (enabled) acquire()
    return () => { sentinelRef.current?.release().catch(() => {}) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── enabled 変更時 ────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) release()
  }, [enabled, release])

  // ── ページの visibility 変更 ──────────────────────────────────
  useEffect(() => {
    const onVisibility = async () => {
      if (!enabledRef.current) return
      if (document.visibilityState === 'hidden') {
        const video = videoRef.current
        if (video && !video.paused && 'pictureInPictureEnabled' in document) {
          video.requestPictureInPicture().catch(() => {})
        }
      } else {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture().catch(() => {})
        }
        const ok = await acquireWakeLock()
        if (ok) setStatus('active')
        await playVideo()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [acquireWakeLock, playVideo])

  const pipSupported =
    typeof document !== 'undefined' && 'pictureInPictureEnabled' in document

  return { status, acquire, release, togglePip, isPip, pipSupported }
}
