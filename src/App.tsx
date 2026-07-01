import { useState } from 'react'
import { ClockFace } from './components/ClockFace'
import { SettingsPanel } from './components/SettingsPanel'
import { WakeLockBanner } from './components/WakeLockBanner'
import { WakeLockPrompt } from './components/WakeLockPrompt'
import { PipButton } from './components/PipButton'
import { useSettings } from './hooks/useSettings'
import { useWakeLock } from './hooks/useWakeLock'
import { usePipClock } from './hooks/usePipClock'
import type { Settings } from './hooks/useSettings'
import styles from './App.module.css'

export default function App() {
  const { settings, update } = useSettings()
  const { status: wakeLockStatus, acquire } = useWakeLock(settings.wakeLockEnabled)
  const { togglePip, isPip } = usePipClock(
    settings.wakeLockEnabled && (wakeLockStatus === 'active' || wakeLockStatus === 'video')
  )
  const [showSettings, setShowSettings] = useState(false)
  const [promptDismissed, setPromptDismissed] = useState(false)

  const showPrompt =
    settings.wakeLockEnabled &&
    wakeLockStatus === 'awaiting-gesture' &&
    !promptDismissed

  const handleAcquire = async () => {
    await acquire()
    setPromptDismissed(true)
  }

  const handleClockTap = async () => {
    if (showPrompt) return
    if (settings.wakeLockEnabled && wakeLockStatus !== 'active') {
      await acquire()
    }
    setShowSettings(true)
  }

  const handleSettingsUpdate = async (patch: Partial<Settings>) => {
    update(patch)
    if (patch.wakeLockEnabled === true) await acquire()
  }

  const showPipBtn = settings.wakeLockEnabled && !showPrompt

  return (
    <div className={styles.root} onClick={handleClockTap}>
      <ClockFace settings={settings} />
      <WakeLockBanner status={wakeLockStatus} />

      {showPipBtn && (
        <PipButton isPip={isPip} onToggle={togglePip} />
      )}

      {showPrompt && (
        <WakeLockPrompt
          onAcquire={handleAcquire}
          onDismiss={() => setPromptDismissed(true)}
        />
      )}

      {showSettings && !showPrompt && (
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
