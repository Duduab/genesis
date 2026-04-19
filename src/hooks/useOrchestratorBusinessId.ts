import { useEffect, useMemo, useState } from 'react'
import { useActiveBusiness } from '../context/ActiveBusinessContext'
import {
  GENESIS_BUSINESSES_UPDATED_EVENT,
  loadPersistedGenesisBusinesses,
} from '../dashboard/genesisBusinessStorage'

/**
 * Business id used for Orchestrator chat: active selection, else first saved business (dashboard parity).
 */
export function useOrchestratorBusinessId(): string | null {
  const { activeBusinessId } = useActiveBusiness()
  const [listTick, setListTick] = useState(0)

  useEffect(() => {
    const onList = () => setListTick((n) => n + 1)
    window.addEventListener(GENESIS_BUSINESSES_UPDATED_EVENT, onList)
    return () => window.removeEventListener(GENESIS_BUSINESSES_UPDATED_EVENT, onList)
  }, [])

  return useMemo(() => {
    void listTick
    const trimmed = activeBusinessId?.trim()
    if (trimmed) return trimmed
    const list = loadPersistedGenesisBusinesses()
    return list[0]?.businessId?.trim() || null
  }, [activeBusinessId, listTick])
}
