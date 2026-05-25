import { useCallback, useState } from 'react'

export type ViewMode = 'cards' | 'list'

function readStoredMode(storageKey: string, defaultMode: ViewMode): ViewMode {
  try {
    const v = localStorage.getItem(storageKey)
    if (v === 'list' || v === 'cards') return v
  } catch {
    /* ignore */
  }
  return defaultMode
}

export function usePersistedViewMode(storageKey: string, defaultMode: ViewMode = 'cards') {
  const [mode, setModeState] = useState<ViewMode>(() => readStoredMode(storageKey, defaultMode))

  const setMode = useCallback(
    (next: ViewMode) => {
      setModeState(next)
      try {
        localStorage.setItem(storageKey, next)
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  )

  return [mode, setMode] as const
}
