/** KPI card from GET `/api/v1/dashboard/{business_id}/stats` (flexible BE shape). */

export type DashboardStatCardApi = {
  id?: string
  key?: string
  label?: string
  value?: string | number
  value_formatted?: string
  sublabel?: string
  breakdown?: string | Record<string, unknown>
  gauge_percent?: number
  linear_percent?: number
  goal_label?: string
}

export type DashboardStatsPayload = {
  cards?: DashboardStatCardApi[]
  items?: DashboardStatCardApi[]
  [key: string]: unknown
}
