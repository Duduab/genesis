import type { GenesisBusinessApiData, GenesisBusinessStage } from '../../types/genesisBusiness'
import type { FetchGenesisBusinessesParams, GenesisBusinessListResult } from '../../types/businessList'
import { getGenesisApiBaseUrl } from '../../config/genesisEnv'
import {
  genesisGetJson,
  genesisListJson,
  genesisPostJson,
  genesisPutJson,
  resolveGenesisBearerToken,
  throwGenesisFetchError,
} from './client'

export async function fetchGenesisBusinessById(businessId: string): Promise<GenesisBusinessApiData> {
  const id = encodeURIComponent(businessId.trim())
  const envelope = await genesisGetJson<GenesisBusinessApiData>(`/api/v1/businesses/${id}`)
  if (!envelope.data?.business_id) {
    throw new Error('Invalid business response')
  }
  return envelope.data
}

/**
 * GET `/api/v1/businesses` — list with optional status filter, search, cursor pagination.
 */
export async function fetchGenesisBusinessList(params: FetchGenesisBusinessesParams = {}): Promise<GenesisBusinessListResult> {
  const q = new URLSearchParams()
  if (params.status?.trim()) q.set('status', params.status.trim())
  if (params.search?.trim()) q.set('search', params.search.trim())
  if (typeof params.limit === 'number') {
    const lim = Math.min(100, Math.max(1, Math.floor(params.limit)))
    q.set('limit', String(lim))
  }
  if (params.cursor?.trim()) q.set('cursor', params.cursor.trim())
  const qs = q.toString()
  const path = `/api/v1/businesses${qs ? `?${qs}` : ''}`
  const envelope = await genesisListJson<GenesisBusinessApiData>(path)
  return {
    items: Array.isArray(envelope.data) ? envelope.data : [],
    pagination: envelope.pagination ?? null,
  }
}

/**
 * PUT `/api/v1/businesses/{id}` — all fields optional; only sends keys you set.
 */
export interface UpdateGenesisBusinessBody {
  hp_number?: string | null
  company_name?: string | null
  monthly_cost_ils?: number | null
  target_location?: string | null
  business_type?: string | null
}

export async function updateGenesisBusiness(
  businessId: string,
  body: UpdateGenesisBusinessBody,
): Promise<GenesisBusinessApiData> {
  const id = encodeURIComponent(businessId.trim())
  const payload: Record<string, unknown> = {}
  if (body.company_name !== undefined && body.company_name != null) {
    payload.company_name = String(body.company_name).trim()
  }
  if (body.hp_number !== undefined && body.hp_number != null) {
    payload.hp_number = String(body.hp_number).trim()
  }
  if (body.monthly_cost_ils !== undefined && body.monthly_cost_ils != null) {
    const n = Number(body.monthly_cost_ils)
    if (Number.isFinite(n)) payload.monthly_cost_ils = n
  }
  if (body.target_location !== undefined && body.target_location != null) {
    payload.target_location = String(body.target_location).trim()
  }
  if (body.business_type !== undefined && body.business_type != null) {
    payload.business_type = String(body.business_type).trim()
  }

  const envelope = await genesisPutJson<GenesisBusinessApiData>(`/api/v1/businesses/${id}`, { body: payload })
  if (!envelope.data?.business_id) {
    throw new Error('Invalid business update response')
  }
  return envelope.data
}

/**
 * POST `/api/v1/businesses/{business_id}/cancel` — cancel workflow (not reversible).
 */
export async function cancelGenesisBusiness(businessId: string): Promise<void> {
  const id = encodeURIComponent(businessId.trim())
  const idempotencyKey =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `cancel-${Date.now()}-${Math.random().toString(36).slice(2)}`
  await genesisPostJson<unknown>(`/api/v1/businesses/${id}/cancel`, {
    idempotencyKey,
  })
}

/** GET `/api/v1/businesses/{id}/budget` — append-only budget ledger rows. */
export async function fetchBusinessBudgetLedger(businessId: string): Promise<unknown[]> {
  const id = encodeURIComponent(businessId.trim())
  const envelope = await genesisListJson<unknown>(`/api/v1/businesses/${id}/budget`)
  return Array.isArray(envelope.data) ? envelope.data : []
}

/** GET `/api/v1/businesses/{id}/stages` — stages only (same rows as nested under full business). */
export async function fetchBusinessStages(businessId: string): Promise<GenesisBusinessStage[]> {
  const id = encodeURIComponent(businessId.trim())
  const envelope = await genesisListJson<GenesisBusinessStage>(`/api/v1/businesses/${id}/stages`)
  return Array.isArray(envelope.data) ? envelope.data : []
}

/**
 * GET `/api/v1/businesses/{id}/timeline` — business-wide activity feed (not chat).
 * Response is a list envelope; if the server wraps rows differently, normalize to an array.
 */
export async function fetchBusinessTimeline(businessId: string, limit = 100): Promise<unknown[]> {
  const id = encodeURIComponent(businessId.trim())
  const envelope = await genesisListJson<Record<string, unknown>>(
    `/api/v1/businesses/${id}/timeline?limit=${encodeURIComponent(String(limit))}`,
  )
  const d = envelope.data
  if (Array.isArray(d)) return d
  return []
}

/**
 * GET `/api/v1/businesses/{id}/report` — summary export (PDF or JSON per `Content-Type`).
 */
export async function fetchBusinessReportBlob(
  businessId: string,
): Promise<{ blob: Blob; contentType: string | null }> {
  const base = getGenesisApiBaseUrl()
  const path = `/api/v1/businesses/${encodeURIComponent(businessId.trim())}/report`
  const url = base ? `${base.replace(/\/$/, '')}${path}` : path
  const token = await resolveGenesisBearerToken()
  const headers = new Headers()
  headers.set('Accept', 'application/pdf, application/json;q=0.9, */*;q=0.8')
  if (token) headers.set('Authorization', `Bearer ${token.trim()}`)

  const res = await fetch(url, { method: 'GET', headers })
  if (!res.ok) {
    const text = await res.text()
    let payload: unknown = text
    try {
      payload = JSON.parse(text) as unknown
    } catch {
      payload = { message: text }
    }
    throwGenesisFetchError(res, payload)
  }
  return { blob: await res.blob(), contentType: res.headers.get('content-type') }
}
