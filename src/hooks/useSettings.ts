import { useState, useEffect } from 'react'

export interface Settings {
  showSeconds: boolean
  use24Hour: boolean
  useJapanese: boolean
  wakeLockEnabled: boolean
}

const STORAGE_KEY = 'stay-clock-settings'

const defaults: Settings = {
  showSeconds: false,
  use24Hour: true,
  useJapanese: false,
  wakeLockEnabled: true,
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // storage unavailable
    }
  }, [settings])

  const update = (patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }))
  }

  return { settings, update }
}
