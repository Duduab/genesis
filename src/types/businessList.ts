import type { GenesisBusinessApiData } from './genesisBusiness'

/** Query for GET `/api/v1/businesses`. */
export interface FetchGenesisBusinessesParams {
  status?: string | null
  search?: string | null
  /** 1–100 per API contract */
  limit?: number
  cursor?: string | null
}

export interface GenesisBusinessListResult {
  items: GenesisBusinessApiData[]
  pagination: {
    next_cursor: string | null
    has_more: boolean
    count: number
  } | null
}
