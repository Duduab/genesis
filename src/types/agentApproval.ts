/**
 * Human-in-the-loop decisions for stages in `AWAITING_APPROVAL`.
 * @see `GET/POST /api/v1/agent-approvals/*`
 */

/** Row from `GET /api/v1/agent-approvals/pending` (one pending decision per stage). */
export interface PendingAgentApprovalItem {
  stage_id: string
  business_id?: string
  title?: string
  summary?: string
  display_name?: string
  agent_id?: string
  action_type?: string
  created_at?: string
  [key: string]: unknown
}

export interface PendingApprovalsPayload {
  items: PendingAgentApprovalItem[]
}

/** `GET /api/v1/agent-approvals/{stage_id}` — full context for the approval card. */
export interface AgentApprovalDetail {
  stage_id: string
  business_id?: string
  title?: string
  summary?: string
  recommendation?: unknown
  options?: unknown
  terms?: unknown
  pricing?: unknown
  /** Free-form agent context (price, lease lines, etc.) */
  context?: unknown
  [key: string]: unknown
}

/** `POST /api/v1/agent-approvals/{stage_id}/decide` body.decision */
export type AgentApprovalDecisionValue = 'APPROVED' | 'REJECTED'
