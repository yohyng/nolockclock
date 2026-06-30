import { useState } from 'react'
import { ClockFace } from './components/ClockFace'
import { SettingsPanel } from './components/SettingsPanel'
import { WakeLockBanner } from './components/WakeLockBanner'
import { useSettings } from './hooks/useSettings'
import { useWakeLock } from './hooks/useWakeLock'
import type { Settings } from './hooks/useSettings'
import styles from './App.module.css'

export default function App() {
  const { settings, update } = useSettings()
  const { status: wakeLockStatus, acquire } = useWakeLock(settings.wakeLockEnabled)
  const [showSettings, setShowSettings] = useState(false)

  // Safari requires Wake Lock to be requested inside a user gesture handler.
  // Every tap on the clock face re-attempts acquisition if not yet active.
  const handleTap = async () => {
    if (settings.wakeLockEnabled && wakeLockStatus !== 'active') {
      await acquire()
    }
    setShowSettings(true)
  }

  // When the user enables Wake Lock from the settings toggle (also a user gesture)
  const handleSettingsUpdate = async (patch: Partial<Settings>) => {
    update(patch)
    if (patch.wakeLockEnabled === true) {
      await acquire()
    }
  }

  return (
    <div className={styles.root} onClick={handleTap}>
      <ClockFace settings={settings} />
      {wakeLockStatus === 'awaiting-gesture' && settings.wakeLockEnabled && (
        <p className={styles.tapHint}>タップして画面スリープを防止</p>
      )}
      <WakeLockBanner status={wakeLockStatus} />
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onUpdate={handleSettingsUpdate}
          wakeLockStatus={wakeLockStatus}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
