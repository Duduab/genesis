import { useCallback, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchGenesisBusinessById } from '../api/genesis/businessesApi'
import {
  GENESIS_BUSINESSES_UPDATED_EVENT,
  GENESIS_SAVED_BUSINESSES_STORAGE_KEY,
  loadPersistedGenesisBusinesses,
  type PersistedGenesisBusiness,
} from '../dashboard/genesisBusinessStorage'
import {
  mapPersistedBusinessToEntityView,
  type GenesisEntityViewModel,
} from '../dashboard/mapPersistedBusinessToEntityView'
import type { GenesisBusinessApiData } from '../types/genesisBusiness'
import { POLL_MS_DASHBOARD, refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'

function mergeRow(persisted: PersistedGenesisBusiness, api: GenesisBusinessApiData): PersistedGenesisBusiness {
  return { ...persisted, api }
}

async function loadMergedEntities(): Promise<{
  merged: PersistedGenesisBusiness[]
  errorKey: string | null
}> {
  const persisted = loadPersistedGenesisBusinesses()
  if (persisted.length === 0) {
    return { merged: [], errorKey: null }
  }
  const results = await Promise.all(
    persisted.map(async (p) => {
      try {
        const api = await fetchGenesisBusinessById(p.businessId)
        return { ok: true as const, row: mergeRow(p, api) }
      } catch {
        return { ok: false as const, row: p }
      }
    }),
  )
  const merged = results.map((r) => r.row)
  const failed = results.filter((r) => !r.ok)
  let errorKey: string | null = null
  if (failed.length === results.length) errorKey = 'entities.loadFromApiFailed'
  else if (failed.length > 0) errorKey = 'entities.loadFromApiPartial'
  return { merged, errorKey }
}

const MY_ENTITIES_QUERY_KEY = ['my-entities'] as const

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
    const onCustom = () => refetch()
    const onStorage = (e: StorageEvent) => {
      if (e.key === GENESIS_SAVED_BUSINESSES_STORAGE_KEY) refetch()
    }
    window.addEventListener(GENESIS_BUSINESSES_UPDATED_EVENT, onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(GENESIS_BUSINESSES_UPDATED_EVENT, onCustom)
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
