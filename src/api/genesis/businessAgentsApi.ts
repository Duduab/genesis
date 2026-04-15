import type { BusinessAgentApiRow } from '../../types/businessAgent'
import { genesisListJson, genesisPostJson } from './client'

/**
 * GET `/api/v1/businesses/{business_id}/agents`
 */
export async function fetchBusinessAgents(businessId: string): Promise<BusinessAgentApiRow[]> {
  const id = encodeURIComponent(businessId.trim())
  const envelope = await genesisListJson<BusinessAgentApiRow>(`/api/v1/businesses/${id}/agents`)
  return Array.isArray(envelope.data) ? envelope.data : []
}

/**
 * POST `/api/v1/businesses/{business_id}/agents/assign` — manually dispatch an agent (`agent_id` enum).
 */
export async function assignBusinessAgent(businessId: string, agentId: string): Promise<void> {
  const id = encodeURIComponent(businessId.trim())
  const idempotencyKey =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `assign-agent-${Date.now()}-${Math.random().toString(36).slice(2)}`
  await genesisPostJson<unknown>(`/api/v1/businesses/${id}/agents/assign`, {
    body: { agent_id: agentId.trim() },
    idempotencyKey,
  })
}
