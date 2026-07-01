import { useState, useEffect, useRef, useCallback } from 'react'

const W = 800
const H = 420

function draw(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const dateStr = now.toLocaleDateString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const dayStr = days[now.getDay()]

  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, W, H)

  // 時刻
  ctx.fillStyle = '#ffffff'
  ctx.font = `100 ${180}px -apple-system, "Helvetica Neue", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(`${hh}:${mm}`, W / 2, H / 2 + 60)

  // 日付
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = `300 32px -apple-system, "Helvetica Neue", sans-serif`
  ctx.fillText(`${dateStr}  ${dayStr}`, W / 2, H / 2 + 110)
}

export function usePipClock(active: boolean) {
  const [isPip, setIsPip] = useState(false)
  const [supported, setSupported] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const activeRef = useRef(active)

  useEffect(() => { activeRef.current = active }, [active])

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H

    // captureStream のサポート確認
    if (!('captureStream' in canvas) || !('pictureInPictureEnabled' in document)) return
    setSupported(true)

    draw(canvas)
    const interval = setInterval(() => { if (activeRef.current) draw(canvas) }, 1000)

    const video = document.createElement('video')
    video.muted = true
    video.setAttribute('playsinline', '')
    video.srcObject = (canvas as HTMLCanvasElement & { captureStream(fps?: number): MediaStream }).captureStream(2)
    // 極小で配置（display:none だと PiP 不可）
    video.style.cssText =
      'position:fixed;top:0;left:0;width:1px;height:1px;opacity:.01;pointer-events:none;z-index:-1;'
    video.addEventListener('enterpictureinpicture', () => setIsPip(true))
    video.addEventListener('leavepictureinpicture', () => setIsPip(false))
    document.body.appendChild(video)
    video.play().catch(() => {})
    videoRef.current = video

    return () => {
      clearInterval(interval)
      if (document.pictureInPictureElement === video) {
        document.exitPictureInPicture().catch(() => {})
      }
      video.remove()
    }
  }, [])

  const togglePip = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    if (document.pictureInPictureElement === video) {
      await document.exitPictureInPicture().catch(() => {})
    } else {
      await video.requestPictureInPicture().catch(() => {})
    }
  }, [])

  // バックグラウンドへ移行時に自動でPiP起動
  useEffect(() => {
    const onVisibility = () => {
      if (!activeRef.current) return
      const video = videoRef.current
      if (!video) return
      if (document.visibilityState === 'hidden') {
        video.requestPictureInPicture().catch(() => {})
      } else {
        if (document.pictureInPictureElement === video) {
          document.exitPictureInPicture().catch(() => {})
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return { togglePip, isPip, supported }
}
