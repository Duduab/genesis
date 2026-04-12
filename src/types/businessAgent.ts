/** Row from GET `/api/v1/businesses/{business_id}/agents`. */
export interface BusinessAgentApiRow {
  agent_id: string
  status: string
  last_action: string
  completed_at: string | null
}
