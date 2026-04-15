import { useQuery } from '@tanstack/react-query'
import { fetchAgentActivityList, type FetchAgentActivityParams } from '../api/genesis/agentActivityApi'
import { POLL_MS_INTERACTIVE, refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'

export function useAgentActivityListQuery(
  params: FetchAgentActivityParams,
  options: { enabled?: boolean; limit?: number } = {},
) {
  const { enabled = true, limit = 200 } = options
  const businessId = params.business_id?.trim() || null
  const agent = params.agent?.trim() || null
  const status = params.status?.trim() || null

  return useQuery({
    queryKey: ['agent-activity', businessId, agent, status, limit],
    queryFn: () =>
      fetchAgentActivityList({
        business_id: businessId,
        agent: agent || undefined,
        status: status || undefined,
        limit,
        offset: 0,
      }),
    enabled: enabled && Boolean(businessId),
    refetchInterval: enabled ? refetchIntervalWithVisibilityAndBackoff(POLL_MS_INTERACTIVE) : false,
  })
}
