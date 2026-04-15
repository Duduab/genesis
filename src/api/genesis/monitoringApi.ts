import { genesisRequestJson } from './client'
import { resolveAdminPanelApiBearerToken } from './adminBearer'

async function adminBearer() {
  return (await resolveAdminPanelApiBearerToken()) ?? undefined
}

export type MonitoringOverview = {
  total_active_businesses?: number
  total_active_tasks?: number
  total_llm_cost_usd_today?: string | number
  total_llm_cost_usd_month?: string | number
  total_tokens_today?: number
  agents_healthy?: number
  agents_degraded?: number
  agents_stuck?: number
  cost_by_business?: Array<{
    business_id: string
    entrepreneur_name?: string
    business_type?: string
    total_cost_ils?: string
    stage_count?: number
  }>
}

export type AgentMetricRow = {
  agent_id: string
  total_calls?: number
  total_input_tokens?: number
  total_output_tokens?: number
  total_cached_tokens?: number
  total_cost_usd?: string | number
  avg_latency_ms?: number
  success_rate?: number
  models_used?: Record<string, unknown>
}

export type AgentHealthRow = {
  agent_id: string
  status?: string
  active_tasks?: number
  avg_task_duration_minutes?: number
  last_activity?: string
  failure_rate_last_hour?: number
  token_budget_remaining_pct?: number
}

export type BusinessCostBreakdown = {
  business_id: string
  total_llm_cost_usd?: string | number
  total_budget_spent_ils?: string | number
  cost_by_agent?: Record<string, string | number>
  token_usage_by_agent?: Record<string, number>
}

export async function fetchMonitoringOverview(): Promise<MonitoringOverview> {
  const bearerToken = await adminBearer()
  return genesisRequestJson<MonitoringOverview>({
    path: '/api/v1/monitoring/overview',
    method: 'GET',
    bearerToken,
  })
}

export async function fetchAgentMetrics(): Promise<AgentMetricRow[]> {
  const bearerToken = await adminBearer()
  return genesisRequestJson<AgentMetricRow[]>({
    path: '/api/v1/monitoring/agent-metrics',
    method: 'GET',
    bearerToken,
  })
}

export async function fetchAgentMetricsById(agentId: string): Promise<AgentMetricRow> {
  const bearerToken = await adminBearer()
  return genesisRequestJson<AgentMetricRow>({
    path: `/api/v1/monitoring/agent-metrics/${encodeURIComponent(agentId)}`,
    method: 'GET',
    bearerToken,
  })
}

export async function fetchBusinessCostBreakdown(businessId: string): Promise<BusinessCostBreakdown> {
  const bearerToken = await adminBearer()
  return genesisRequestJson<BusinessCostBreakdown>({
    path: `/api/v1/monitoring/businesses/${encodeURIComponent(businessId)}/cost`,
    method: 'GET',
    bearerToken,
  })
}

export async function fetchAgentHealth(): Promise<AgentHealthRow[]> {
  const bearerToken = await adminBearer()
  return genesisRequestJson<AgentHealthRow[]>({
    path: '/api/v1/monitoring/agent-health',
    method: 'GET',
    bearerToken,
  })
}
