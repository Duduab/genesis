import { useCallback, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchGenesisBusinessById, fetchGenesisBusinessList } from '../api/genesis/businessesApi'
import { isGenesisApiError } from '../api/genesis/errors'
import {
  GENESIS_SAVED_BUSINESSES_STORAGE_KEY,
  loadPersistedGenesisBusinesses,
  setPersistedGenesisBusinesses,
  type PersistedGenesisBusiness,
} from '../dashboard/genesisBusinessStorage'
import {
  mapPersistedBusinessToEntityView,
  type GenesisEntityViewModel,
} from '../dashboard/mapPersistedBusinessToEntityView'
import type { LicenseTypeId } from '../types/business'
import type { GenesisBusinessApiData } from '../types/genesisBusiness'
import { POLL_MS_DASHBOARD, refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'

function mergeRow(persisted: PersistedGenesisBusiness, api: GenesisBusinessApiData): PersistedGenesisBusiness {
  return { ...persisted, api }
}

function stubPersisted(api: GenesisBusinessApiData, licenseType: LicenseTypeId): PersistedGenesisBusiness {
  return {
    businessId: api.business_id,
    savedAt: new Date().toISOString(),
    api,
    licenseType,
  }
}

/**
 * Prefer GET `/api/v1/businesses` as the source of truth so localStorage does not keep
 * business UUIDs the signed-in user is no longer allowed to access (would otherwise 401 every chart/dashboard call).
 */
async function loadMergedEntities(): Promise<{
  merged: PersistedGenesisBusiness[]
  errorKey: string | null
}> {
  const persisted = loadPersistedGenesisBusinesses()
  try {
    const { items } = await fetchGenesisBusinessList({ limit: 100 })
    const byId = new Map(persisted.map((p) => [p.businessId, p]))
    const merged = items.map((api) => {
      const prev = byId.get(api.business_id)
      const license = (prev?.licenseType ?? 'ltd') as LicenseTypeId
      return mergeRow(prev ?? stubPersisted(api, license), api)
    })
    setPersistedGenesisBusinesses(merged)
    return { merged, errorKey: null }
  } catch (e) {
    if (persisted.length === 0) {
      return {
        merged: [],
        errorKey: 'entities.loadFromApiFailed',
      }
    }
    const next: PersistedGenesisBusiness[] = []
    let forbiddenOrGone = 0
    let otherFailures = 0
    for (const p of persisted) {
      try {
        const api = await fetchGenesisBusinessById(p.businessId)
        next.push(mergeRow(p, api))
      } catch (err) {
        if (isGenesisApiError(err) && (err.status === 401 || err.status === 403)) {
          forbiddenOrGone += 1
        } else {
          otherFailures += 1
          next.push(p)
        }
      }
    }
    setPersistedGenesisBusinesses(next)
    let errorKey: string | null = null
    if (otherFailures === persisted.length) errorKey = 'entities.loadFromApiFailed'
    else if (otherFailures > 0 || forbiddenOrGone > 0) errorKey = 'entities.loadFromApiPartial'
    return { merged: next, errorKey }
  }
}

export const MY_ENTITIES_QUERY_KEY = ['my-entities'] as const

export function useMyEntitiesFromApi(locale: string): {
  rows: GenesisEntityViewModel[]
  loading: boolean
  error: string | null
  refetch: () => void
} {
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: MY_ENTITIES_QUERY_KEY,
    queryFn: loadMergedEntities,
    refetchInterval: refetchIntervalWithVisibilityAndBackoff(POLL_MS_DASHBOARD),
  })

  const refetch = useCallback(() => {
    void qc.invalidateQueries({ queryKey: MY_ENTITIES_QUERY_KEY })
  }, [qc])

  useEffect(() => {
    /** Cross-tab only: same-tab `localStorage.setItem` does not fire `storage`. */
    /** Do not listen to `GENESIS_BUSINESSES_UPDATED_EVENT`: `loadMergedEntities` writes storage and notifies;
     *  refetching on that event caused an infinite loop (API payload JSON rarely matches byte-for-byte). */
    const onStorage = (e: StorageEvent) => {
      if (e.key === GENESIS_SAVED_BUSINESSES_STORAGE_KEY) refetch()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
    }
  }, [refetch])

  const rows = useMemo(
    () => (q.data?.merged ?? []).map((r) => mapPersistedBusinessToEntityView(r, locale)),
    [q.data?.merged, locale],
  )

  return {
    rows,
    loading: q.isPending || q.isFetching,
    error: q.data?.errorKey ?? (q.isError ? 'entities.loadFromApiFailed' : null),
    refetch,
  }
}
