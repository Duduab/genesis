import { genesisRequestJson } from './client'
import type { GenesisEnvelopeSingle } from './types'

export type GlobalSearchResultType = 'businesses' | 'documents' | 'activity'

export type SearchBusinessHit = {
  business_id: string
  entrepreneur_name?: string | null
  company_name?: string | null
  business_type?: string | null
  global_status?: string | null
}

/** Shape varies; common legal-document fields are handled in UI. */
export type SearchDocumentHit = {
  document_id?: string
  business_id?: string
  name?: string
  title?: string
  status?: string
  [key: string]: unknown
}

export type SearchActivityHit = {
  activity_id?: string
  business_id?: string
  title?: string
  name?: string
  summary?: string
  agent_id?: string
  [key: string]: unknown
}

export type GlobalSearchPayload = {
  businesses: SearchBusinessHit[]
  documents: SearchDocumentHit[]
  activity: SearchActivityHit[]
}

export async function fetchGlobalSearch(params: {
  q: string
  type?: GlobalSearchResultType
}): Promise<GenesisEnvelopeSingle<GlobalSearchPayload>> {
  const sp = new URLSearchParams()
  sp.set('q', params.q.trim())
  if (params.type) sp.set('type', params.type)
  return genesisRequestJson<GenesisEnvelopeSingle<GlobalSearchPayload>>({
    path: `/api/v1/search?${sp.toString()}`,
    method: 'GET',
  })
}
