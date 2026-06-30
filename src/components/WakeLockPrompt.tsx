import styles from './WakeLockPrompt.module.css'

interface Props {
  onAcquire: () => void
  onDismiss: () => void
}

export function WakeLockPrompt({ onAcquire, onDismiss }: Props) {
  return (
    <div className={styles.backdrop} onClick={onDismiss}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.handle} />

        <div className={styles.iconWrap}>
          <svg viewBox="0 0 64 64" fill="none" className={styles.icon}>
            <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="3" />
            <line x1="32" y1="32" x2="32" y2="14" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <line x1="32" y1="32" x2="44" y2="40" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="32" cy="32" r="2.5" fill="white" />
          </svg>
        </div>

        <h2 className={styles.title}>スリープを防止する</h2>
        <p className={styles.desc}>
          画面をONのまま維持して、時計を常時表示します。
          <br />
          有効にするにはタップが必要です。
        </p>

        <button className={styles.primaryBtn} onClick={onAcquire}>
          有効にする
        </button>
        <button className={styles.secondaryBtn} onClick={onDismiss}>
          あとで
        </button>
      </div>
    </div>
  )
}
