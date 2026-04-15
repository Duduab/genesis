import type { DashboardOverviewData } from '../../types/dashboardOverview'
import type { DashboardStatsPayload } from '../../types/dashboardStats'
import { genesisGetJson } from './client'
import { isGenesisApiError } from './errors'

function unwrapDashboard(envelope: { data?: DashboardOverviewData | null }): DashboardOverviewData {
  const d = envelope.data
  if (!d || typeof d !== 'object') throw new Error('Invalid dashboard response')
  return d
}

/**
 * GET `/api/v1/businesses/{business_id}/dashboard` — per-business dashboard (canonical).
 * Falls back to legacy `GET /api/v1/{business_id}/dashboard` on 404 for older deployments.
 */
export async function fetchBusinessDashboard(businessId: string): Promise<DashboardOverviewData> {
  const bid = encodeURIComponent(businessId.trim())
  const paths = [`/api/v1/businesses/${bid}/dashboard`, `/api/v1/${bid}/dashboard`]
  let lastErr: unknown
  for (const path of paths) {
    try {
      const envelope = await genesisGetJson<DashboardOverviewData>(path)
      return unwrapDashboard(envelope)
    } catch (e) {
      lastErr = e
      if (isGenesisApiError(e) && e.status === 404) continue
      throw e
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Dashboard not found')
}

export type DashboardRevenueChartPeriod = 'monthly' | 'weekly' | 'yearly'

/** GET `/api/v1/businesses/{business_id}/dashboard/revenue-chart` — per-business series (e.g. 12 months). */
export async function fetchDashboardRevenueChart(
  businessId: string,
  params?: { period?: DashboardRevenueChartPeriod | string },
): Promise<unknown | null> {
  const bid = encodeURIComponent(businessId.trim())
  const period = (params?.period ?? 'monthly').toString()
  const paths = [
    `/api/v1/businesses/${bid}/dashboard/revenue-chart?period=${encodeURIComponent(period)}`,
    `/api/v1/dashboard/${bid}/revenue-chart?period=${encodeURIComponent(period)}`,
  ]
  let lastErr: unknown
  for (const path of paths) {
    try {
      const envelope = await genesisGetJson<unknown>(path)
      const data = (envelope as { data?: unknown }).data
      return data ?? null
    } catch (e) {
      lastErr = e
      if (isGenesisApiError(e) && e.status === 404) continue
      throw e
    }
  }
  if (isGenesisApiError(lastErr) && lastErr.status === 404) return null
  throw lastErr instanceof Error ? lastErr : new Error('Revenue chart not found')
}

/** GET `/api/v1/businesses/{business_id}/dashboard/stats` — per-business KPI cards. */
export async function fetchDashboardStats(businessId: string): Promise<DashboardStatsPayload | null> {
  const bid = encodeURIComponent(businessId.trim())
  const paths = [`/api/v1/businesses/${bid}/dashboard/stats`, `/api/v1/dashboard/${bid}/stats`]
  let lastErr: unknown
  for (const path of paths) {
    try {
      const envelope = await genesisGetJson<DashboardStatsPayload>(path)
      const data = (envelope as { data?: DashboardStatsPayload | null }).data
      return data ?? null
    } catch (e) {
      lastErr = e
      if (isGenesisApiError(e) && e.status === 404) continue
      throw e
    }
  }
  if (isGenesisApiError(lastErr) && lastErr.status === 404) return null
  throw lastErr instanceof Error ? lastErr : new Error('Dashboard stats not found')
}
