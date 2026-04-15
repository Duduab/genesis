import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBusinessMilestones } from '../api/genesis/businessMilestonesApi'
import type { BusinessMilestoneApiRow } from '../types/businessMilestone'
import { POLL_MS_DASHBOARD, refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'

export function useBusinessMilestones(businessId: string | null): {
  milestones: BusinessMilestoneApiRow[]
  loading: boolean
  error: string | null
  refetch: () => void
} {
  const qc = useQueryClient()
  const id = businessId?.trim() || null

  const q = useQuery({
    queryKey: ['business-milestones', id],
    queryFn: () => fetchBusinessMilestones(id!),
    enabled: Boolean(id),
    refetchInterval: refetchIntervalWithVisibilityAndBackoff(POLL_MS_DASHBOARD),
  })

  const refetch = useCallback(() => {
    if (id) void qc.invalidateQueries({ queryKey: ['business-milestones', id] })
  }, [qc, id])

  return {
    milestones: q.data ?? [],
    loading: Boolean(id) && (q.isLoading || q.isFetching),
    error: q.isError ? 'dashboard.milestones.error' : null,
    refetch,
  }
}
