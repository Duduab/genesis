import { useQuery } from '@tanstack/react-query'
import { fetchBusinessAgentsProgress } from '../api/genesis/businessAgentsProgressApi'
import type { BusinessAgentsProgressData } from '../types/businessAgentsProgress'
import { refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'

/** Poll interval for agent progress (manager spec: 3–5s). */
const POLL_MS_AGENT_PROGRESS = 4000

function isTerminalGlobalStatus(status: string | undefined): boolean {
  const u = String(status ?? '')
    .trim()
    .toUpperCase()
  return u === 'COMPLETED' || u === 'COMPLETE' || u === 'CANCELLED' || u === 'FAILED'
}

export function useBusinessAgentsProgressQuery(businessId: string | null | undefined, options?: { enabled?: boolean }) {
  const id = typeof businessId === 'string' ? businessId.trim() : ''
  const enabled = (options?.enabled !== false) && Boolean(id)

  return useQuery({
    queryKey: ['business-agents-progress', id],
    queryFn: (): Promise<BusinessAgentsProgressData> => fetchBusinessAgentsProgress(id),
    enabled,
    refetchInterval: (query) => {
      const d = query.state.data as BusinessAgentsProgressData | undefined
      if (d && isTerminalGlobalStatus(d.global_status)) return false
      return refetchIntervalWithVisibilityAndBackoff(POLL_MS_AGENT_PROGRESS)(query)
    },
  })
}
