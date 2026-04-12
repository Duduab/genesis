import type { LegalDocumentsListPayload } from '../../types/legalDocument'
import { genesisGetJson } from './client'

/**
 * GET `/api/v1/businesses/{business_id}/legal-documents`
 */
export async function fetchLegalDocumentsForBusiness(businessId: string): Promise<LegalDocumentsListPayload> {
  const id = encodeURIComponent(businessId.trim())
  const envelope = await genesisGetJson<LegalDocumentsListPayload>(`/api/v1/businesses/${id}/legal-documents`)
  const data = envelope.data
  if (!data || !Array.isArray(data.items)) {
    throw new Error('Invalid legal documents response')
  }
  return {
    items: data.items,
    category_counts: data.category_counts && typeof data.category_counts === 'object' ? data.category_counts : {},
    status_counts: data.status_counts && typeof data.status_counts === 'object' ? data.status_counts : {},
  }
}
