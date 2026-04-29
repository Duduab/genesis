import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useActiveBusiness } from '../context/ActiveBusinessContext'
import {
  GENESIS_BUSINESSES_UPDATED_EVENT,
  loadPersistedGenesisBusinesses,
} from '../dashboard/genesisBusinessStorage'
import { useMyEntitiesMergedQuery } from './useMyEntitiesFromApi'

/**
 * Business id used for Orchestrator chat: active selection, else first from my-entities cache, else localStorage.
 */
export function useOrchestratorBusinessId(): string | null {
  const { isAuthenticated } = useAuth()
  const { activeBusinessId } = useActiveBusiness()
  const mergedQ = useMyEntitiesMergedQuery({ enabled: Boolean(isAuthenticated) })
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
    const merged = mergedQ.data?.merged ?? []
    const fromMerged = merged[0]?.businessId?.trim()
    if (fromMerged) return fromMerged
    return loadPersistedGenesisBusinesses()[0]?.businessId?.trim() || null
  }, [activeBusinessId, listTick, mergedQ.data])
}
