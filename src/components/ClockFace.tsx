import { useClock } from '../hooks/useClock'
import type { Settings } from '../hooks/useSettings'
import styles from './ClockFace.module.css'

interface Props {
  settings: Settings
}

const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_JA = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatDate(date: Date, japanese: boolean): string {
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  return japanese ? `${y}年${m}月${d}日` : `${y}/${m}/${d}`
}

export function ClockFace({ settings }: Props) {
  const { hours, minutes, seconds, date } = useClock()
  const { use24Hour, showSeconds, useJapanese } = settings

  let displayHours = hours
  let period = ''
  if (!use24Hour) {
    period = hours < 12 ? 'AM' : 'PM'
    displayHours = hours % 12 || 12
  }

  const timeStr = showSeconds
    ? `${pad(displayHours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(displayHours)}:${pad(minutes)}`

  const dayStr = useJapanese ? DAYS_JA[date.getDay()] : DAYS_EN[date.getDay()]
  const dateStr = formatDate(date, useJapanese)

  return (
    <div className={styles.root}>
      <div className={styles.timeRow}>
        {!use24Hour && <span className={styles.period}>{period}</span>}
        <span className={styles.time}>{timeStr}</span>
      </div>
      <div className={styles.dateRow}>
        <span className={styles.date}>{dateStr}</span>
        <span className={styles.day}>{dayStr}</span>
      </div>
    </div>
  )
}
