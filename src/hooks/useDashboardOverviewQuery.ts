import { useQuery } from '@tanstack/react-query'
import { fetchBusinessDashboard } from '../api/genesis/dashboardApi'
import type { DashboardOverviewData } from '../types/dashboardOverview'
import { POLL_MS_DASHBOARD, refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'

export function useDashboardOverviewQuery(
  activeBusinessId: string | null | undefined,
  options?: { enabled?: boolean },
) {
  const id = activeBusinessId?.trim() || null
  const enabled = (options?.enabled !== false) && Boolean(id)
  return useQuery({
    queryKey: ['dashboard-overview', id],
    queryFn: (): Promise<DashboardOverviewData> => fetchBusinessDashboard(id!),
    enabled,
    refetchInterval: enabled ? refetchIntervalWithVisibilityAndBackoff(POLL_MS_DASHBOARD) : false,
  })
}
