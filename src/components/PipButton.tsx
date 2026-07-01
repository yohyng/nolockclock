import styles from './PipButton.module.css'

interface Props {
  isPip: boolean
  onToggle: () => void
}

export function PipButton({ isPip, onToggle }: Props) {
  return (
    <button
      className={`${styles.btn} ${isPip ? styles.active : ''}`}
      onClick={e => { e.stopPropagation(); onToggle() }}
      aria-label={isPip ? 'ピクチャーインピクチャー終了' : 'ピクチャーインピクチャー開始'}
    >
      {isPip ? <IconPipExit /> : <IconPip />}
      <span className={styles.label}>{isPip ? 'PiP終了' : 'PiP'}</span>
    </button>
  )
}

function IconPip() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <rect x="12" y="10" width="8" height="6" rx="1.2" fill="currentColor" />
    </svg>
  )
}

function IconPipExit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <rect x="12" y="10" width="8" height="6" rx="1.2" fill="currentColor" opacity="0.4" />
      <line x1="6" y1="9" x2="10" y2="13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="10" y1="9" x2="6" y2="13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}
