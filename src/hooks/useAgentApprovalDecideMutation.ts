import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postAgentApprovalDecision } from '../api/genesis/agentApprovalsApi'
import type { AgentApprovalDecisionValue } from '../types/agentApproval'
import { PENDING_AGENT_APPROVALS_QUERY_KEY } from './usePendingAgentApprovalsQuery'

export function useAgentApprovalDecideMutation(stageId: string | null | undefined) {
  const qc = useQueryClient()
  const id = stageId?.trim() || null

  return useMutation({
    mutationFn: (input: { decision: AgentApprovalDecisionValue; notes?: string }) => {
      if (!id) throw new Error('Missing stage id')
      return postAgentApprovalDecision(id, input)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: PENDING_AGENT_APPROVALS_QUERY_KEY })
      await qc.invalidateQueries({ queryKey: ['agent-approval', id] })
      await qc.invalidateQueries({ queryKey: ['dashboard-overview'] })
      await qc.invalidateQueries({ queryKey: ['business-stages'] })
      await qc.invalidateQueries({ queryKey: ['stage-detail', id] })
      await qc.invalidateQueries({ queryKey: ['my-entities'] })
    },
  })
}
