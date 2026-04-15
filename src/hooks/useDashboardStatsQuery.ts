import { useQuery } from '@tanstack/react-query'
import { fetchDashboardStats } from '../api/genesis/dashboardApi'
import type { DashboardStatsPayload } from '../types/dashboardStats'
import { POLL_MS_DASHBOARD, refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'

export function useDashboardStatsQuery(activeBusinessId: string | null | undefined, options?: { enabled?: boolean }) {
  const id = activeBusinessId?.trim() || null
  const enabled = (options?.enabled !== false) && Boolean(id)
  return useQuery({
    queryKey: ['dashboard-stats', id],
    queryFn: async (): Promise<DashboardStatsPayload | null> => fetchDashboardStats(id!),
    enabled,
    refetchInterval: enabled ? refetchIntervalWithVisibilityAndBackoff(POLL_MS_DASHBOARD) : false,
  })
}
