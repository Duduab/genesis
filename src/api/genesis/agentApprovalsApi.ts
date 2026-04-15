import { genesisGetJson } from './client'
import { isGenesisApiError } from './errors'

/** Minimal pending approval row (operator/admin endpoint; entrepreneurs may get 403). */
export interface PendingAgentApprovalItem {
  stage_id?: string
  business_id?: string
  title?: string
  summary?: string
  created_at?: string
  [key: string]: unknown
}

export interface PendingApprovalsPayload {
  items: PendingAgentApprovalItem[]
}

function unwrapPending(envelope: { data?: PendingApprovalsPayload | { items?: PendingAgentApprovalItem[] } | null }) {
  const d = envelope.data as { items?: PendingAgentApprovalItem[] } | null
  if (!d || !Array.isArray(d.items)) return { items: [] as PendingAgentApprovalItem[] }
  return { items: d.items }
}

/**
 * GET `/api/v1/agent-approvals/pending` — requires operator/admin in staging.
 * Returns empty list on 403 so the entrepreneur UI can rely on dashboard `pending_approvals` instead.
 */
export async function fetchPendingAgentApprovals(): Promise<PendingApprovalsPayload> {
  try {
    const envelope = await genesisGetJson<PendingApprovalsPayload>('/api/v1/agent-approvals/pending')
    return unwrapPending(envelope)
  } catch (e) {
    if (isGenesisApiError(e) && e.status === 403) {
      return { items: [] }
    }
    throw e
  }
}
