/** GET `/api/v1/businesses/{business_id}/progress` — agent pipeline snapshot. */

export type AgentStageApiStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | string

export interface BusinessAgentStage {
  agent_id: string
  display_name: string
  display_name_en: string
  status: AgentStageApiStatus
  phase: number
  started_at: string | null
  completed_at: string | null
}

export interface BusinessAgentsProgressData {
  business_id: string
  global_status: string
  progress_percent: number
  stages_completed: number
  stages_in_progress: number
  stages_failed: number
  stages_total: number
  stages: BusinessAgentStage[]
}
