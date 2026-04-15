import type { DashboardStatCardApi } from '../types/dashboardStats'

export type NormalizedDashboardStatCard = {
  label: string
  value: string
  sublabel: string
  gaugePct: number
  linearPct: number
  goalLabel: string
}

function str(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v)
    } catch {
      return ''
    }
  }
  return String(v)
}

function breakdownText(b: unknown): string {
  if (typeof b === 'string') return b
  if (b && typeof b === 'object') {
    try {
      return JSON.stringify(b)
    } catch {
      return ''
    }
  }
  return ''
}

function fromApiCard(c: DashboardStatCardApi): NormalizedDashboardStatCard {
  const valueRaw = c.value_formatted ?? c.value
  const gauge = Number(c.gauge_percent)
  const linear = Number(c.linear_percent ?? c.gauge_percent)
  return {
    label: str(c.label ?? c.key ?? c.id ?? '—'),
    value: valueRaw != null && valueRaw !== '' ? str(valueRaw) : '—',
    sublabel: str(c.sublabel) || breakdownText(c.breakdown) || '\u00a0',
    gaugePct: Number.isFinite(gauge) ? Math.round(gauge) : 50,
    linearPct: Number.isFinite(linear) ? Math.round(linear) : 50,
    goalLabel: str(c.goal_label) || '—',
  }
}

/** Maps BE stats payload to up to five KPI cards. */
export function normalizeDashboardStats(raw: unknown): NormalizedDashboardStatCard[] | null {
  if (!raw || typeof raw !== 'object') return null
  const d = raw as Record<string, unknown>

  if (Array.isArray(d.cards) && d.cards.length) {
    return (d.cards as DashboardStatCardApi[]).map(fromApiCard)
  }
  if (Array.isArray(d.items) && d.items.length) {
    return (d.items as DashboardStatCardApi[]).map(fromApiCard)
  }

  const preferredOrder = ['total_tasks', 'budget', 'agents', 'monthly_cost', 'progress']
  const out: NormalizedDashboardStatCard[] = []
  for (const key of preferredOrder) {
    const v = d[key]
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(fromApiCard(v as DashboardStatCardApi))
    }
  }
  return out.length ? out : null
}
