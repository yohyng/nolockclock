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
      title={isPip ? 'PiP 終了' : '他のアプリでも継続（PiP）'}
      aria-label={isPip ? 'ピクチャーインピクチャー終了' : 'ピクチャーインピクチャー開始'}
    >
      {isPip ? <IconPipExit /> : <IconPip />}
    </button>
  )
}

function IconPip() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* 外枠（画面） */}
      <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
      {/* 小ウィンドウ */}
      <rect x="12" y="10" width="8" height="6" rx="1.2" fill="currentColor" />
    </svg>
  )
}

function IconPipExit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* 外枠 */}
      <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
      {/* 小ウィンドウ（アクティブ色） */}
      <rect x="12" y="10" width="8" height="6" rx="1.2" fill="currentColor" opacity="0.5" />
      {/* × 線 */}
      <line x1="7" y1="9" x2="11" y2="13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="11" y1="9" x2="7" y2="13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}
