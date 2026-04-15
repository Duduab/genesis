import type { GenesisProblemDetails, GenesisValidationErrorItem } from './types'
import { genesisApiErrorI18nKey } from './genesisApiErrorCodes'

export class GenesisApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly requestId?: string
  readonly traceId?: string
  readonly apiVersion?: string
  readonly rateLimitLimit?: number
  readonly rateLimitRemaining?: number
  readonly rateLimitReset?: number
  /** Developer-only; do not surface in UI copy. */
  readonly detail?: string
  readonly problem?: GenesisProblemDetails
  readonly validationDetail?: GenesisValidationErrorItem[]

  constructor(
    message: string,
    init: {
      status: number
      code?: string
      requestId?: string
      traceId?: string
      apiVersion?: string
      rateLimitLimit?: number
      rateLimitRemaining?: number
      rateLimitReset?: number
      detail?: string
      problem?: GenesisProblemDetails
      validationDetail?: GenesisValidationErrorItem[]
    },
  ) {
    super(message)
    this.name = 'GenesisApiError'
    this.status = init.status
    this.code = init.code
    this.requestId = init.requestId
    this.traceId = init.traceId
    this.apiVersion = init.apiVersion
    this.rateLimitLimit = init.rateLimitLimit
    this.rateLimitRemaining = init.rateLimitRemaining
    this.rateLimitReset = init.rateLimitReset
    this.detail = init.detail
    this.problem = init.problem
    this.validationDetail = init.validationDetail
  }

  /**
   * Safe for end users (avoid raw `detail`).
   * Pass `t` from `useI18n()` to resolve known API `code` values via `apiErrors.*` keys.
   */
  userFacingMessage(fallback: string, t?: (key: string) => string): string {
    if (t) {
      const i18nKey = genesisApiErrorI18nKey(this.code)
      if (i18nKey) {
        const localized = t(i18nKey)
        if (localized && localized !== i18nKey) return localized
      }
    }
    if (this.problem?.title?.trim()) return this.problem.title.trim()
    return fallback
  }
}

export function isGenesisApiError(e: unknown): e is GenesisApiError {
  return e instanceof GenesisApiError
}
