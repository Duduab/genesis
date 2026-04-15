import { useQuery } from '@tanstack/react-query'
import { fetchPendingAgentApprovals } from '../api/genesis/agentApprovalsApi'
import { POLL_MS_DASHBOARD, refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'

export const PENDING_AGENT_APPROVALS_QUERY_KEY = ['agent-approvals', 'pending'] as const

export function usePendingAgentApprovalsQuery(options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false

  return useQuery({
    queryKey: PENDING_AGENT_APPROVALS_QUERY_KEY,
    queryFn: fetchPendingAgentApprovals,
    enabled,
    staleTime: 5_000,
    refetchInterval: enabled ? refetchIntervalWithVisibilityAndBackoff(POLL_MS_DASHBOARD) : false,
  })
}
