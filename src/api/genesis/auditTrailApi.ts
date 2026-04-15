import { getGenesisApiBaseUrl } from '../../config/genesisEnv'
import { genesisRequestJson } from './client'
import { GenesisApiError } from './errors'
import type { GenesisEnvelopeSingle } from './types'
import { resolveAdminPanelApiBearerToken } from './adminBearer'

async function adminBearer() {
  return (await resolveAdminPanelApiBearerToken()) ?? undefined
}

export type AuditTrailListItem = {
  audit_id: string
  request_id?: string
  user_id?: string
  user_email?: string
  user_role?: string
  method?: string
  path?: string
  action?: string
  resource_type?: string
  resource_id?: string | null
  request_body?: unknown
  response_status?: number
  ip_address?: string
  created_at?: string
}

export type AuditTrailListPayload = {
  items: AuditTrailListItem[]
  action_counts?: Record<string, number>
}

export type FetchAuditTrailParams = {
  user_id?: string
  action?: string
  resource_type?: string
  resource_id?: string
  method?: string
  status_code?: number
  from?: string
  to?: string
  limit?: number
  offset?: number
}

function toSearchParams(p: FetchAuditTrailParams): string {
  const sp = new URLSearchParams()
  if (p.user_id) sp.set('user_id', p.user_id)
  if (p.action) sp.set('action', p.action)
  if (p.resource_type) sp.set('resource_type', p.resource_type)
  if (p.resource_id) sp.set('resource_id', p.resource_id)
  if (p.method) sp.set('method', p.method)
  if (p.status_code != null) sp.set('status_code', String(p.status_code))
  if (p.from) sp.set('from', p.from)
  if (p.to) sp.set('to', p.to)
  if (p.limit != null) sp.set('limit', String(p.limit))
  if (p.offset != null) sp.set('offset', String(p.offset))
  const q = sp.toString()
  return q ? `?${q}` : ''
}

export async function fetchAuditTrail(
  params: FetchAuditTrailParams,
): Promise<GenesisEnvelopeSingle<AuditTrailListPayload>> {
  const bearerToken = await adminBearer()
  const qs = toSearchParams(params)
  return genesisRequestJson<GenesisEnvelopeSingle<AuditTrailListPayload>>({
    path: `/api/v1/audit-trail${qs}`,
    method: 'GET',
    bearerToken,
  })
}

export type AuditTrailDetail = AuditTrailListItem & {
  response_body?: unknown
}

export async function fetchAuditTrailById(auditId: string): Promise<GenesisEnvelopeSingle<AuditTrailDetail>> {
  const bearerToken = await adminBearer()
  return genesisRequestJson<GenesisEnvelopeSingle<AuditTrailDetail>>({
    path: `/api/v1/audit-trail/${encodeURIComponent(auditId)}`,
    method: 'GET',
    bearerToken,
  })
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

export async function exportAuditTrailCsv(params: FetchAuditTrailParams): Promise<Blob> {
  const bearerToken = await resolveAdminPanelApiBearerToken()
  const base = getGenesisApiBaseUrl()
  const qs = toSearchParams(params)
  const url = `${base}${normalizePath(`/api/v1/audit-trail/export${qs}`)}`
  const headers = new Headers()
  if (bearerToken?.trim()) headers.set('Authorization', `Bearer ${bearerToken.trim()}`)
  const res = await fetch(url, { method: 'GET', headers })
  if (!res.ok) {
    const text = await res.text()
    throw new GenesisApiError(text ? text.slice(0, 280) : `HTTP ${res.status}`, { status: res.status, detail: text })
  }
  return res.blob()
}
