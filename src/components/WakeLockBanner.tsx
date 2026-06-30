import type { WakeLockStatus } from '../hooks/useWakeLock'
import styles from './WakeLockBanner.module.css'

interface Props {
  status: WakeLockStatus
}

export function WakeLockBanner({ status }: Props) {
  if (status === 'active' || status === 'idle') return null

  const messages: Partial<Record<WakeLockStatus, string>> = {
    unsupported: '画面スリープの防止はこのブラウザで利用できません',
    error: '画面をONのまま維持できませんでした',
    released: '画面ロックが解除されました。再取得を試みています…',
  }

  const msg = messages[status]
  if (!msg) return null

  return (
    <div className={styles.banner}>
      <span>{msg}</span>
    </div>
  )
}
