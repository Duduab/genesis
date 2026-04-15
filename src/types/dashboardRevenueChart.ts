/** Expected shapes from GET `/api/v1/dashboard/{business_id}/revenue-chart` (normalized in UI). */

export type DashboardRevenueChartRow = {
  label: string
  income: number
  expenses: number
  profit: number
}

export type DashboardRevenueChartSeries = {
  points: DashboardRevenueChartRow[]
}
