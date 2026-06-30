import type { Settings } from '../hooks/useSettings'
import type { WakeLockStatus } from '../hooks/useWakeLock'
import styles from './SettingsPanel.module.css'

interface Props {
  settings: Settings
  onUpdate: (patch: Partial<Settings>) => void
  wakeLockStatus: WakeLockStatus
  onClose: () => void
}

interface ToggleRowProps {
  label: string
  sub?: string
  checked: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ label, sub, checked, onChange }: ToggleRowProps) {
  return (
    <label className={styles.row}>
      <div className={styles.rowLabel}>
        <span className={styles.rowTitle}>{label}</span>
        {sub && <span className={styles.rowSub}>{sub}</span>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
        onClick={() => onChange(!checked)}
      />
    </label>
  )
}

const WAKE_LOCK_LABELS: Record<WakeLockStatus, string> = {
  active: 'ON',
  released: '再取得中',
  idle: 'OFF',
  unsupported: '非対応',
  error: 'エラー',
}

export function SettingsPanel({ settings, onUpdate, wakeLockStatus, onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.handle} />
        <h2 className={styles.title}>設定</h2>

        <section className={styles.section}>
          <span className={styles.sectionTitle}>画面</span>
          <ToggleRow
            label="Wake Lock"
            sub={`画面スリープを防止 — ${WAKE_LOCK_LABELS[wakeLockStatus]}`}
            checked={settings.wakeLockEnabled}
            onChange={v => onUpdate({ wakeLockEnabled: v })}
          />
        </section>

        <section className={styles.section}>
          <span className={styles.sectionTitle}>時計</span>
          <ToggleRow
            label="秒を表示"
            checked={settings.showSeconds}
            onChange={v => onUpdate({ showSeconds: v })}
          />
          <ToggleRow
            label="24時間表示"
            checked={settings.use24Hour}
            onChange={v => onUpdate({ use24Hour: v })}
          />
        </section>

        <section className={styles.section}>
          <span className={styles.sectionTitle}>表示</span>
          <ToggleRow
            label="日本語表示"
            checked={settings.useJapanese}
            onChange={v => onUpdate({ useJapanese: v })}
          />
        </section>

        <button className={styles.closeBtn} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  )
}
