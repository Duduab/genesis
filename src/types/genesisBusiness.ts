/** Business resource as returned by POST/GET `/api/v1/businesses` (`data` envelope). */

/**
 * Pipeline stage row. `status` uses API stage enums (`NOT_STARTED`, `IN_PROGRESS`, …);
 * see `GENESIS_STAGE_STATUSES` in `src/constants/genesisApiEnums.ts`.
 */
export interface GenesisBusinessStage {
  stage_id: string
  business_id: string
  agent_id: string
  action_type: string
  status: string
  display_name: string
  display_name_en: string
  description: string
  phase: number
  allocated_budget_ils: number
  actual_cost_ils: number
  response_payload: unknown
  error_message: string | null
  duration_seconds: number | null
  created_at: string
  completed_at: string | null
}

export interface GenesisBusinessApiData {
  business_id: string
  business_type: string
  target_location: string
  /** API business lifecycle enum; see `GENESIS_BUSINESS_STATUSES` in `src/constants/genesisApiEnums.ts`. */
  global_status: string
  total_budget_ils: number
  locked_budget_ils: number
  available_budget_ils: number
  progress_percent: number
  current_phase: string
  hp_number: string | null
  company_name: string | null
  monthly_cost_ils: number | null
  active_agents_count: number
  created_at: string
  updated_at: string
  entrepreneur_name: string
  entrepreneur_phone: string
  total_cost_ils: number
  estimated_time_remaining_seconds: number | null
  stages: GenesisBusinessStage[]
}
