/** Item from GET `/api/v1/businesses/{id}/legal-documents` (or list legal documents). */
export interface GenesisLegalDocumentItem {
  document_id: string
  business_id: string
  agent_id: string
  name: string
  /** `contract` | `tax` | `employment` | `licensing` — see `GENESIS_DOCUMENT_CATEGORIES`. */
  category: string
  file_size_bytes: number
  /** `pending` | `approved` | `pending_signature` | `signed` | `error` — see `GENESIS_DOCUMENT_STATUSES`. */
  status: string
  created_at: string
}

/** `data` object when the envelope wraps a list + aggregates. */
export interface LegalDocumentsListPayload {
  items: GenesisLegalDocumentItem[]
  category_counts: Record<string, number>
  status_counts: Record<string, number>
}
