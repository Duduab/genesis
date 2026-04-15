/** Shapes from GET `/api/v1/{business_id}/dashboard` (and legacy `GET /api/v1/businesses/{id}/dashboard`). */

export interface DashboardRecentActivityItem {
  activity_id: string
  business_id: string
  agent_id: string
  action: string
  description: string
  status: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface DashboardOverviewData {
  total_businesses: number
  total_budget_ils?: number
  active_agents: number
  monthly_cost_ils: number
  progress_percent: number
  status_counts: Record<string, number>
  recent_activity?: DashboardRecentActivityItem[]
  pending_approvals?: number
  completed_stages?: number
  total_stages?: number
  cost_saved_ils?: number
  hours_saved?: number
}
