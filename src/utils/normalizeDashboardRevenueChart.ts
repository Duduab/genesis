import type { DashboardRevenueChartSeries } from '../types/dashboardRevenueChart'

function num(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/** Turns various BE shapes into chart-friendly points (min 2 rows). */
export function normalizeDashboardRevenueChart(raw: unknown): DashboardRevenueChartSeries | null {
  if (raw == null) return null
  let rows: unknown[] = []
  if (Array.isArray(raw)) {
    rows = raw
  } else if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    const inner = o.months ?? o.points ?? o.series ?? o.items ?? o.rows
    if (Array.isArray(inner)) rows = inner
    else return null
  } else return null

  const points = rows
    .map((row) => {
      if (!row || typeof row !== 'object') return null
      const r = row as Record<string, unknown>
      const income = num(r.income ?? r.revenue ?? r.income_ils ?? r.income_nis)
      const expenses = num(r.expenses ?? r.expense ?? r.expense_ils ?? r.expense_nis ?? r.costs)
      let profit = num(r.profit ?? r.net ?? r.profit_ils ?? r.profit_nis)
      if (!profit && (income || expenses)) profit = income - expenses
      return {
        label: String(r.month ?? r.period ?? r.label ?? r.name ?? ''),
        income,
        expenses,
        profit,
      }
    })
    .filter((p): p is NonNullable<typeof p> => p != null)

  if (points.length < 2) return null
  return { points }
}
