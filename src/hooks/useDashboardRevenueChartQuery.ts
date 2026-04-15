import { useQuery } from '@tanstack/react-query'
import { fetchDashboardRevenueChart } from '../api/genesis/dashboardApi'
import { POLL_MS_DASHBOARD, refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'

export function useDashboardRevenueChartQuery(
  activeBusinessId: string | null | undefined,
  options?: { enabled?: boolean; period?: string },
) {
  const id = activeBusinessId?.trim() || null
  const enabled = (options?.enabled !== false) && Boolean(id)
  return useQuery({
    queryKey: ['dashboard-revenue-chart', id, options?.period ?? 'monthly'],
    queryFn: () => fetchDashboardRevenueChart(id!, { period: options?.period }),
    enabled,
    refetchInterval: enabled ? refetchIntervalWithVisibilityAndBackoff(POLL_MS_DASHBOARD) : false,
  })
}
