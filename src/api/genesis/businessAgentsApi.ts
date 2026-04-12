import type { BusinessAgentApiRow } from '../../types/businessAgent'
import { genesisListJson } from './client'

/**
 * GET `/api/v1/businesses/{business_id}/agents`
 */
export async function fetchBusinessAgents(businessId: string): Promise<BusinessAgentApiRow[]> {
  const id = encodeURIComponent(businessId.trim())
  const envelope = await genesisListJson<BusinessAgentApiRow>(`/api/v1/businesses/${id}/agents`)
  return Array.isArray(envelope.data) ? envelope.data : []
}
