import type { WakeLockStatus } from '../hooks/useWakeLock'
import styles from './WakeLockBanner.module.css'

interface Props {
  status: WakeLockStatus
}

const MESSAGES: Partial<Record<WakeLockStatus, string>> = {
  error: '画面をONのまま維持できませんでした',
  released: 'スリープ防止が解除されました。再取得を試みています…',
}

export function WakeLockBanner({ status }: Props) {
  const msg = MESSAGES[status]
  if (!msg) return null

  return (
    <div className={styles.banner}>
      <span>{msg}</span>
    </div>
  )
}
