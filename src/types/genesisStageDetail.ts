/**
 * GET `/api/v1/stages/{id}` — one unit of agent work (e.g. `agent_financial` + `GOVIL_REGISTRATION`).
 * Shape may grow with the API; required identifiers are stable.
 */
export interface GenesisStageDetail {
  stage_id: string
  business_id?: string
  agent_id?: string
  action_type?: string
  status?: string
  display_name?: string
  display_name_en?: string
  description?: string
  phase?: number
  allocated_budget_ils?: number
  actual_cost_ils?: number
  /** Structured agent output / result */
  response_payload?: unknown
  error_message?: string | null
  duration_seconds?: number | null
  created_at?: string
  completed_at?: string | null
  /** Inputs / outputs when exposed separately from `response_payload` */
  inputs?: unknown
  outputs?: unknown
  started_at?: string | null
  ended_at?: string | null
  [key: string]: unknown
}

/** GET `/api/v1/stages/{id}/logs` — debug payload (LLM, tools, tokens, ILS cost). */
export type GenesisStageLogs = Record<string, unknown> | unknown[] | null
