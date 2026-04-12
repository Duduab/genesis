import { getGenesisApiBaseUrl, getGenesisApiBearerToken } from '../../config/genesisEnv'
import { GenesisApiError } from './errors'
import type { GenesisEnvelopeList, GenesisEnvelopeSingle, GenesisProblemDetails, GenesisValidationErrorItem } from './types'

export type GenesisAccessTokenProvider = () => string | null | Promise<string | null>
export type GenesisUnauthorizedHandler = () => string | null | Promise<string | null>

let accessTokenProvider: GenesisAccessTokenProvider | null = null
let onUnauthorized: GenesisUnauthorizedHandler | null = null

/**
 * Production: set `getAccessToken` from Firebase (`getIdToken()`).
 * Optional `onUnauthorized`: e.g. `getIdToken(true)` then return new token for one retry.
 */
export function configureGenesisApi(options: {
  getAccessToken?: GenesisAccessTokenProvider | null
  onUnauthorized?: GenesisUnauthorizedHandler | null
}): void {
  if ('getAccessToken' in options) accessTokenProvider = options.getAccessToken ?? null
  if ('onUnauthorized' in options) onUnauthorized = options.onUnauthorized ?? null
}

async function resolveBearerToken(): Promise<string | null> {
  if (accessTokenProvider) {
    const t = await accessTokenProvider()
    if (t?.trim()) return t.trim()
  }
  const env = getGenesisApiBearerToken()
  return env || null
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

function resolveGenesisRequestUrl(path: string): string {
  const base = getGenesisApiBaseUrl()
  const p = normalizePath(path)
  if (base) return `${base}${p}`
  return p
}

async function readJsonBody(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return { raw: text }
  }
}

function isProblemDetails(body: unknown): body is GenesisProblemDetails {
  if (!body || typeof body !== 'object') return false
  const o = body as Record<string, unknown>
  return typeof o.status === 'number'
}

function isValidationErrorBody(body: unknown): body is { detail: GenesisValidationErrorItem[] } {
  if (!body || typeof body !== 'object') return false
  const d = (body as { detail?: unknown }).detail
  return Array.isArray(d)
}

function toApiError(status: number, body: unknown): GenesisApiError {
  if (isProblemDetails(body)) {
    const p = body
    return new GenesisApiError(p.title || `Request failed (${status})`, {
      status: p.status,
      code: p.code,
      requestId: p.request_id,
      detail: p.detail,
      problem: p,
    })
  }
  if (isValidationErrorBody(body)) {
    const first = body.detail[0]
    const msg = first?.msg || 'Validation failed'
    return new GenesisApiError(msg, {
      status,
      validationDetail: body.detail,
      detail: JSON.stringify(body.detail),
    })
  }
  const fallback =
    body && typeof body === 'object' && 'message' in body && typeof (body as { message?: unknown }).message === 'string'
      ? String((body as { message: string }).message)
      : `HTTP ${status}`
  return new GenesisApiError(fallback, { status, detail: typeof body === 'object' ? JSON.stringify(body) : String(body) })
}

export interface GenesisRequestOptions extends Omit<RequestInit, 'body'> {
  /** Relative to API host, e.g. `/api/v1/businesses` */
  path: string
  body?: unknown
  idempotencyKey?: string
  /** When false, omit Authorization (rare). */
  auth?: boolean
}

/**
 * Low-level JSON request. Throws {@link GenesisApiError} on error responses.
 */
export async function genesisRequestJson<T>(options: GenesisRequestOptions): Promise<T> {
  const { path, body, idempotencyKey, auth = true, headers: initHeaders, ...rest } = options
  const url = resolveGenesisRequestUrl(path)

  const run = async (bearerOverride: string | null) => {
    const headers = new Headers(initHeaders)
    if (!headers.has('Accept')) headers.set('Accept', 'application/json')
    if (body !== undefined && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    if (auth) {
      const token = bearerOverride ?? (await resolveBearerToken())
      if (token) headers.set('Authorization', `Bearer ${token}`)
    }
    if (idempotencyKey) headers.set('Idempotency-Key', idempotencyKey)

    return fetch(url, {
      ...rest,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  }

  let res = await run(null)

  if (res.status === 401 && onUnauthorized && auth) {
    const refreshed = await onUnauthorized()
    if (refreshed?.trim()) {
      res = await run(refreshed.trim())
    }
  }

  const payload = await readJsonBody(res)

  if (!res.ok) {
    throw toApiError(res.status, payload)
  }

  return payload as T
}

export async function genesisGetJson<TData>(path: string, init?: Omit<GenesisRequestOptions, 'path' | 'method' | 'body'>) {
  return genesisRequestJson<GenesisEnvelopeSingle<TData>>({ ...init, path, method: 'GET' })
}

export async function genesisPostJson<TData>(path: string, init?: Omit<GenesisRequestOptions, 'path' | 'method'>) {
  return genesisRequestJson<GenesisEnvelopeSingle<TData>>({ ...init, path, method: 'POST' })
}

export async function genesisPutJson<TData>(path: string, init?: Omit<GenesisRequestOptions, 'path' | 'method'>) {
  return genesisRequestJson<GenesisEnvelopeSingle<TData>>({ ...init, path, method: 'PUT' })
}

export async function genesisListJson<TItem>(path: string, init?: Omit<GenesisRequestOptions, 'path' | 'method' | 'body'>) {
  return genesisRequestJson<GenesisEnvelopeList<TItem>>({ ...init, path, method: 'GET' })
}
