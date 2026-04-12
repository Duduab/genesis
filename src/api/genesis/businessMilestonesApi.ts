import type { BusinessMilestoneApiRow } from '../../types/businessMilestone'
import { genesisListJson } from './client'

/**
 * GET `/api/v1/businesses/{business_id}/milestones`
 */
export async function fetchBusinessMilestones(businessId: string): Promise<BusinessMilestoneApiRow[]> {
  const id = encodeURIComponent(businessId.trim())
  const envelope = await genesisListJson<BusinessMilestoneApiRow>(`/api/v1/businesses/${id}/milestones`)
  return Array.isArray(envelope.data) ? envelope.data : []
}
