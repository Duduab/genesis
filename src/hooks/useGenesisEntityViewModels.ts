import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  GENESIS_BUSINESSES_UPDATED_EVENT,
  GENESIS_SAVED_BUSINESSES_STORAGE_KEY,
  loadPersistedGenesisBusinesses,
} from '../dashboard/genesisBusinessStorage'
import {
  mapPersistedBusinessToEntityView,
  type GenesisEntityViewModel,
} from '../dashboard/mapPersistedBusinessToEntityView'

export function useGenesisEntityViewModels(locale: string): GenesisEntityViewModel[] {
  const [tick, setTick] = useState(0)
  const bump = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    const onCustom = () => bump()
    const onStorage = (e: StorageEvent) => {
      if (e.key === GENESIS_SAVED_BUSINESSES_STORAGE_KEY) bump()
    }
    window.addEventListener(GENESIS_BUSINESSES_UPDATED_EVENT, onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(GENESIS_BUSINESSES_UPDATED_EVENT, onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [bump])

  return useMemo(() => {
    void tick
    return loadPersistedGenesisBusinesses().map((r) => mapPersistedBusinessToEntityView(r, locale))
  }, [locale, tick])
}
