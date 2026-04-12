import type { GenesisProblemDetails, GenesisValidationErrorItem } from './types'

export class GenesisApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly requestId?: string
  /** Developer-only; do not surface in UI copy. */
  readonly detail?: string
  readonly problem?: GenesisProblemDetails
  readonly validationDetail?: GenesisValidationErrorItem[]

  constructor(message: string, init: {
    status: number
    code?: string
    requestId?: string
    detail?: string
    problem?: GenesisProblemDetails
    validationDetail?: GenesisValidationErrorItem[]
  }) {
    super(message)
    this.name = 'GenesisApiError'
    this.status = init.status
    this.code = init.code
    this.requestId = init.requestId
    this.detail = init.detail
    this.problem = init.problem
    this.validationDetail = init.validationDetail
  }

  /** Safe for end users (avoid `detail`). */
  userFacingMessage(fallback: string): string {
    if (this.problem?.title?.trim()) return this.problem.title.trim()
    return fallback
  }
}

export function isGenesisApiError(e: unknown): e is GenesisApiError {
  return e instanceof GenesisApiError
}
