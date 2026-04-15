import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBusinessStages } from '../api/genesis/businessesApi'
import type { GenesisBusinessStage } from '../types/genesisBusiness'
import { POLL_MS_DASHBOARD, refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'

export function useBusinessStagesQuery(businessId: string | null): {
  stages: GenesisBusinessStage[]
  loading: boolean
  error: string | null
  refetch: () => void
} {
  const qc = useQueryClient()
  const id = businessId?.trim() || null

  const q = useQuery({
    queryKey: ['business-stages', id],
    queryFn: () => fetchBusinessStages(id!),
    enabled: Boolean(id),
    refetchInterval: refetchIntervalWithVisibilityAndBackoff(POLL_MS_DASHBOARD),
  })

  const refetch = useCallback(() => {
    if (id) void qc.invalidateQueries({ queryKey: ['business-stages', id] })
  }, [qc, id])

  return {
    stages: q.data ?? [],
    loading: Boolean(id) && (q.isLoading || q.isFetching),
    error: q.isError ? 'dashboard.stages.error' : null,
    refetch,
  }
}
