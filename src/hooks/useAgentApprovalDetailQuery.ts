import { useQuery } from '@tanstack/react-query'
import { fetchAgentApprovalByStageId } from '../api/genesis/agentApprovalsApi'
import { POLL_MS_INTERACTIVE, refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'

export function useAgentApprovalDetailQuery(stageId: string | null | undefined, options?: { enabled?: boolean }) {
  const id = stageId?.trim() || null
  const enabled = Boolean(id) && (options?.enabled !== false)

  return useQuery({
    queryKey: ['agent-approval', id],
    queryFn: () => fetchAgentApprovalByStageId(id!),
    enabled,
    staleTime: 5_000,
    refetchInterval: enabled ? refetchIntervalWithVisibilityAndBackoff(POLL_MS_INTERACTIVE) : false,
  })
}
