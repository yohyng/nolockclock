import { useState, useEffect, useCallback, useRef } from 'react'

export type WakeLockStatus =
  | 'active'       // Wake Lock API 取得済み
  | 'video'        // 動画ループで代替中
  | 'released'     // 解除された（再取得中）
  | 'unsupported'  // API 非対応
  | 'error'        // エラー
  | 'awaiting-gesture' // Safari：ユーザー操作待ち
  | 'idle'

export function useWakeLock(enabled: boolean) {
  const [status, setStatus] = useState<WakeLockStatus>('idle')
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

    // Wake Lock API を試みる
    const ok = await acquireWakeLock()
    if (ok) {
      setStatus('active')
      await playVideo() // 動画も同時に回す（切替時の保険）
      return
    }

    // Safari：NotAllowedError かどうかを判別せず、ステータスで分岐
    if (!('wakeLock' in navigator)) {
      setStatus('unsupported')
    } else {
      // ユーザー操作なしに呼ばれた → awaiting-gesture
      setStatus('awaiting-gesture')
    }

    // 動画フォールバック（Wake Lock の代替）
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
        // 他のアプリに切り替わった → PiP で動画を継続させる
        const video = videoRef.current
        if (video && !video.paused && 'pictureInPictureEnabled' in document) {
          try {
            await video.requestPictureInPicture()
          } catch { /* PiP が拒否される場合は無視 */ }
        }
      } else {
        // 戻ってきた → PiP 終了 & Wake Lock 再取得
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

  return { status, acquire, release }
}
