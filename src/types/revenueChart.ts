/**
 * Generic time series for Monthly Revenue Flow (API-ready).
 * When provided, the chart can map points to path coordinates; until then the
 * UI derives waves from {@link baselineMonthlyNis}.
 */
export interface RevenueHistoryPoint {
  timestamp: string
  amount: number
}
