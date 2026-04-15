import type {
  AgentApprovalDecisionValue,
  AgentApprovalDetail,
  PendingAgentApprovalItem,
  PendingApprovalsPayload,
} from '../../types/agentApproval'
import { genesisGetJson, genesisPostJson } from './client'

function unwrapPendingList(data: unknown): PendingAgentApprovalItem[] {
  if (data == null) return []
  if (Array.isArray(data)) {
    return data.filter((row) => row && typeof row === 'object' && typeof (row as PendingAgentApprovalItem).stage_id === 'string') as PendingAgentApprovalItem[]
  }
  if (typeof data === 'object' && data !== null && 'items' in data) {
    const items = (data as { items?: unknown }).items
    if (Array.isArray(items)) {
      return items.filter(
        (row) => row && typeof row === 'object' && typeof (row as PendingAgentApprovalItem).stage_id === 'string',
      ) as PendingAgentApprovalItem[]
    }
  }
  return []
}

/**
 * GET `/api/v1/agent-approvals/pending` — all stages awaiting a human decision (all businesses).
 */
export async function fetchPendingAgentApprovals(): Promise<PendingApprovalsPayload> {
  const envelope = await genesisGetJson<PendingApprovalsPayload | PendingAgentApprovalItem[]>(
    '/api/v1/agent-approvals/pending',
  )
  return { items: unwrapPendingList(envelope.data) }
}

/**
 * GET `/api/v1/agent-approvals/{stage_id}` — full approval context (terms, recommendation, options).
 */
export async function fetchAgentApprovalByStageId(stageId: string): Promise<AgentApprovalDetail> {
  const id = encodeURIComponent(stageId.trim())
  const envelope = await genesisGetJson<AgentApprovalDetail>(`/api/v1/agent-approvals/${id}`)
  const d = envelope.data
  if (d == null || typeof d !== 'object') {
    throw new Error('Invalid agent approval detail response')
  }
  return d as AgentApprovalDetail
}

export interface PostAgentApprovalDecideBody {
  decision: AgentApprovalDecisionValue
  notes?: string
}

/**
 * POST `/api/v1/agent-approvals/{stage_id}/decide` — submit APPROVED / REJECTED; workflow resumes when this returns.
 */
export async function postAgentApprovalDecision(stageId: string, body: PostAgentApprovalDecideBody): Promise<void> {
  const id = encodeURIComponent(stageId.trim())
  const idempotencyKey =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `approval-decide-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const payload: { decision: AgentApprovalDecisionValue; notes?: string } = {
    decision: body.decision,
  }
  if (body.notes != null && String(body.notes).trim()) {
    payload.notes = String(body.notes).trim()
  }
  await genesisPostJson<unknown>(`/api/v1/agent-approvals/${id}/decide`, {
    body: payload,
    idempotencyKey,
  })
}
