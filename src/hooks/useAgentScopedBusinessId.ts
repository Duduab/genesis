import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useActiveBusiness } from '../context/ActiveBusinessContext'
import {
  GENESIS_BUSINESSES_UPDATED_EVENT,
  loadPersistedGenesisBusinesses,
} from '../dashboard/genesisBusinessStorage'
import { mapPersistedBusinessToEntityView } from '../dashboard/mapPersistedBusinessToEntityView'
import { useMyEntitiesMergedQuery } from './useMyEntitiesFromApi'

/**
 * Active business id for agent activity / legal surfaces: same resolution as orchestrator
 * (active selection, else first row from my-entities API cache, else first persisted row).
 * Subscribes to `my-entities` so business_id is available even when My Entities was never opened.
 */
export function useAgentScopedBusinessId(locale: string): { businessId: string | null; businessName: string } {
  const { isAuthenticated } = useAuth()
  const { activeBusinessId, activeViewModel } = useActiveBusiness()
  const mergedQ = useMyEntitiesMergedQuery({ enabled: Boolean(isAuthenticated) })
  const [listTick, setListTick] = useState(0)

  useEffect(() => {
    const onList = () => setListTick((n) => n + 1)
    window.addEventListener(GENESIS_BUSINESSES_UPDATED_EVENT, onList)
    return () => window.removeEventListener(GENESIS_BUSINESSES_UPDATED_EVENT, onList)
  }, [])

  return useMemo(() => {
    void listTick
    const storedList = loadPersistedGenesisBusinesses()
    const merged = mergedQ.data?.merged ?? []
    const active = activeBusinessId?.trim() || null
    const id =
      active || merged[0]?.businessId?.trim() || storedList[0]?.businessId?.trim() || null
    if (!id) return { businessId: null, businessName: '' }
    let name = ''
    if (active && activeViewModel && active === id) {
      name = activeViewModel.name
    } else {
      const row = merged.find((b) => b.businessId === id) ?? storedList.find((b) => b.businessId === id) ?? null
      if (row) name = mapPersistedBusinessToEntityView(row, locale).name
    }
    return { businessId: id, businessName: name }
  }, [activeBusinessId, activeViewModel, locale, listTick, mergedQ.data])
}
