import type { QueryClient } from '@tanstack/react-query'
import { isGenesisApiError } from '../api/genesis/errors'

const PREFIX = '[Genesis UI]'

/** Dev server or explicit opt-in for noisy handlers (React Query). */
export const devVerboseErrors =
  import.meta.env.DEV || String(import.meta.env.VITE_VERBOSE_ERRORS || '').toLowerCase() === 'true'

function safeJson(value: unknown, maxLen = 4000): string {
  try {
    const s = JSON.stringify(value, (_k, v) => {
      if (typeof v === 'bigint') return String(v)
      return v
    })
    return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s
  } catch {
    return '[unserializable]'
  }
}

function getRuntimeContext(): Record<string, unknown> {
  if (typeof window === 'undefined') {
    return { env: import.meta.env.MODE }
  }
  return {
    env: import.meta.env.MODE,
    href: window.location.href,
    pathname: window.location.pathname,
    time: new Date().toISOString(),
    visibility: document.visibilityState,
    onLine: navigator.onLine,
  }
}

export type SerializedError = {
  headline: string
  /** Flat key/values for `console.table` */
  details: Record<string, unknown>
  /** Prefer logging this so DevTools keeps the stack trace */
  primary: unknown
}

/**
 * Turn any thrown value into a short headline + flat details for debugging.
 */
export function serializeError(err: unknown): SerializedError {
  const details: Record<string, unknown> = {}

  if (isGenesisApiError(err)) {
    details.type = 'GenesisApiError'
    details.status = err.status
    if (err.code) details.code = err.code
    if (err.requestId) details.requestId = err.requestId
    if (err.traceId) details.traceId = err.traceId
    if (err.apiVersion) details.apiVersion = err.apiVersion
    if (err.detail) details.detail = err.detail
    if (err.rateLimitRemaining != null) details.rateLimitRemaining = err.rateLimitRemaining
    if (err.problem) details.problem = safeJson(err.problem, 2000)
    if (err.validationDetail?.length) details.validationDetail = safeJson(err.validationDetail, 2000)
    return {
      headline: `${err.name}: ${err.message} (HTTP ${err.status})`,
      details,
      primary: err,
    }
  }

  if (err instanceof Error) {
    details.type = err.name || 'Error'
    if (err.cause != null) details.cause = err.cause instanceof Error ? err.cause.message : safeJson(err.cause, 800)
    return {
      headline: `${err.name}: ${err.message}`,
      details,
      primary: err,
    }
  }

  if (typeof err === 'string') {
    return { headline: err, details: { type: 'string' }, primary: err }
  }

  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>
    const msg = typeof o.message === 'string' ? o.message : safeJson(err, 1500)
    details.type = (typeof o.name === 'string' && o.name) || 'object'
    return { headline: msg, details: { ...details, rawKeys: Object.keys(o).slice(0, 40).join(', ') }, primary: err }
  }

  return {
    headline: String(err),
    details: { type: typeof err },
    primary: err,
  }
}

/**
 * Structured console output for developers (group + context + table).
 */
export function logDevError(
  source: string,
  err: unknown,
  extra?: Record<string, unknown>,
): void {
  const { headline, details, primary } = serializeError(err)
  const ctx = { ...getRuntimeContext(), ...extra }

  // eslint-disable-next-line no-console -- intentional developer diagnostics
  console.groupCollapsed(`${PREFIX} ${source} — ${headline}`)
  // eslint-disable-next-line no-console
  console.error(primary)
  // eslint-disable-next-line no-console
  console.info('Runtime', ctx)
  if (Object.keys(details).length > 0) {
    // eslint-disable-next-line no-console
    console.table(details)
  }
  // eslint-disable-next-line no-console
  console.groupEnd()
}

function logReactQueryQueryError(error: unknown, query: { queryKey: readonly unknown[]; queryHash: string }): void {
  logDevError('ReactQuery.query', error, {
    queryKey: safeJson(query.queryKey, 2000),
    queryHash: query.queryHash,
  })
}

function logReactQueryMutationError(
  error: unknown,
  mutation: { mutationId: number; options: { mutationKey?: readonly unknown[] } },
): void {
  const key = mutation.options.mutationKey
  logDevError('ReactQuery.mutation', error, {
    mutationId: mutation.mutationId,
    mutationKey: key != null ? safeJson(key, 2000) : undefined,
  })
}

let globalListenersInstalled = false

/**
 * Captures uncaught JS errors and unhandled promise rejections at the window level.
 * Always active (including production builds) so field debugging still gets signal.
 */
export function installGlobalErrorListeners(): void {
  if (globalListenersInstalled || typeof window === 'undefined') return
  globalListenersInstalled = true

  window.addEventListener('error', (event) => {
    const err = event.error
    if (err != null) {
      logDevError('window.error', err, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
      return
    }
    logDevError('window.error (no .error object)', new Error(event.message || 'Unknown error'), {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    logDevError('window.unhandledrejection', event.reason, {
      defaultPrevented: event.defaultPrevented,
    })
  })
}

/**
 * Wires React Query global error hooks for richer failure logs in development.
 */
export function attachReactQueryDevDiagnostics(client: QueryClient): void {
  if (!devVerboseErrors) return

  const queryCache = client.getQueryCache()
  const prevQuery = queryCache.config.onError
  queryCache.config.onError = (error, query) => {
    logReactQueryQueryError(error, query)
    prevQuery?.(error, query)
  }

  const mutationCache = client.getMutationCache()
  const prevMutation = mutationCache.config.onError
  mutationCache.config.onError = (error, _vars, _ctx, mutation) => {
    logReactQueryMutationError(error, mutation)
    prevMutation?.(error, _vars, _ctx, mutation)
  }
}
