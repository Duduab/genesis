/** Standard `meta` on success responses. */
export interface GenesisApiMeta {
  request_id: string
  timestamp: string
  api_version: string
}

export interface GenesisPagination {
  next_cursor: string | null
  has_more: boolean
  count: number
}

/** Single-resource success envelope. */
export interface GenesisEnvelopeSingle<T> {
  data: T
  meta: GenesisApiMeta
  _links?: Record<string, string>
}

/** List success envelope. */
export interface GenesisEnvelopeList<T> {
  data: T[]
  meta: GenesisApiMeta
  pagination: GenesisPagination
  _links?: Record<string, string>
}

/** RFC 9457 problem details (API errors). */
export interface GenesisProblemDetails {
  type?: string
  title?: string
  status: number
  detail?: string
  code?: string
  instance?: string
  request_id?: string
  timestamp?: string
}

/** FastAPI validation error item. */
export interface GenesisValidationErrorItem {
  loc?: (string | number)[]
  msg?: string
  type?: string
}
