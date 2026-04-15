/** Standard Genesis API response headers (observability + rate limiting). */
export type GenesisResponseMeta = {
  requestId: string | null
  traceId: string | null
  apiVersion: string | null
  rateLimitLimit: number | null
  rateLimitRemaining: number | null
  /** Unix timestamp when the rate limit window resets. */
  rateLimitReset: number | null
}

function header(res: Response, name: string): string | null {
  const v = res.headers.get(name)?.trim()
  return v || null
}

function parseIntHeader(v: string | null): number | null {
  if (v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Read tracing / rate-limit headers from any `fetch` `Response`. */
export function parseGenesisResponseMeta(res: Response): GenesisResponseMeta {
  return {
    requestId: header(res, 'x-request-id'),
    traceId: header(res, 'x-trace-id'),
    apiVersion: header(res, 'x-api-version'),
    rateLimitLimit: parseIntHeader(header(res, 'x-ratelimit-limit')),
    rateLimitRemaining: parseIntHeader(header(res, 'x-ratelimit-remaining')),
    rateLimitReset: parseIntHeader(header(res, 'x-ratelimit-reset')),
  }
}
