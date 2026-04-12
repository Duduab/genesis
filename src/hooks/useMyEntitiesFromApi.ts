import { useCallback, useEffect, useMemo, useState } from 'react'
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

function mergeRow(persisted: PersistedGenesisBusiness, api: GenesisBusinessApiData): PersistedGenesisBusiness {
  return { ...persisted, api }
}

export function useMyEntitiesFromApi(locale: string): {
  rows: GenesisEntityViewModel[]
  loading: boolean
  error: string | null
  refetch: () => void
} {
  const [tick, setTick] = useState(0)
  const [loading, setLoading] = useState(() => loadPersistedGenesisBusinesses().length > 0)
  const [error, setError] = useState<string | null>(null)
  const [merged, setMerged] = useState<PersistedGenesisBusiness[]>([])

  const refetch = useCallback(() => setTick((n) => n + 1), [])

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

  useEffect(() => {
    let cancelled = false
    const persisted = loadPersistedGenesisBusinesses()

    if (persisted.length === 0) {
      setMerged([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    ;(async () => {
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

      if (cancelled) return

      setMerged(results.map((r) => r.row))
      const failed = results.filter((r) => !r.ok)
      if (failed.length === results.length) {
        setError('entities.loadFromApiFailed')
      } else if (failed.length > 0) {
        setError('entities.loadFromApiPartial')
      } else {
        setError(null)
      }
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [tick])

  const rows = useMemo(
    () => merged.map((r) => mapPersistedBusinessToEntityView(r, locale)),
    [merged, locale],
  )

  return { rows, loading, error, refetch }
}
