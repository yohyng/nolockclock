import { useState } from 'react'
import { ClockFace } from './components/ClockFace'
import { SettingsPanel } from './components/SettingsPanel'
import { WakeLockBanner } from './components/WakeLockBanner'
import { useSettings } from './hooks/useSettings'
import { useWakeLock } from './hooks/useWakeLock'
import styles from './App.module.css'

export default function App() {
  const { settings, update } = useSettings()
  const { status: wakeLockStatus } = useWakeLock(settings.wakeLockEnabled)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className={styles.root} onClick={() => setShowSettings(true)}>
      <ClockFace settings={settings} />
      <WakeLockBanner status={wakeLockStatus} />
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onUpdate={update}
          wakeLockStatus={wakeLockStatus}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
