/** Row from GET `/api/v1/agent-activity` (OpenAPI). */

export interface AgentActivityApiItem {
  activity_id: string
  business_id: string
  agent_id: string
  action: string
  description: string
  /** `completed` | `pending_approval` | `error` — see `GENESIS_ACTIVITY_STATUSES`. */
  status: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface AgentActivityListPayload {
  items: AgentActivityApiItem[]
  status_counts?: Record<string, number>
}
