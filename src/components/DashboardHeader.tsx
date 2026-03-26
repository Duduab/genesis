import { useMemo } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { loadEffectiveBusinessProfile } from '../dashboard/loadEffectiveBusinessProfile'
import type { DashboardBusinessProfile } from '../dashboard/dashboardBusinessProfileStorage'
import { formatNisFull } from '../utils/formatNis'

function hashProfile(b: DashboardBusinessProfile): number {
  const s = `${b.categoryId}-${b.subTypeId}-${b.budgetNis}-${b.expectedMonthlyRevenueNis}`
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i)
  return Math.abs(h)
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function interpolate(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v), template)
}

function barHeights(seed: number, count = 6): number[] {
  return Array.from({ length: count }, (_, i) => 22 + ((seed >> (i * 4)) % 58))
}

type Theme = 'purple' | 'green' | 'cyan' | 'orange' | 'blue'

const THEME: Record<
  Theme,
  { stroke: string; fill: string; track: string; barMuted: string; glow: string }
> = {
  purple: {
    stroke: '#a78bfa',
    fill: 'bg-violet-500',
    track: 'bg-violet-500/15',
    barMuted: 'bg-violet-400/35',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.25)]',
  },
  green: {
    stroke: '#34d399',
    fill: 'bg-emerald-500',
    track: 'bg-emerald-500/15',
    barMuted: 'bg-emerald-400/35',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
  },
  cyan: {
    stroke: '#22d3ee',
    fill: 'bg-cyan-500',
    track: 'bg-cyan-500/15',
    barMuted: 'bg-cyan-400/35',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
  },
  orange: {
    stroke: '#fb923c',
    fill: 'bg-orange-500',
    track: 'bg-orange-500/15',
    barMuted: 'bg-orange-400/35',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]',
  },
  blue: {
    stroke: '#60a5fa',
    fill: 'bg-blue-500',
    track: 'bg-blue-500/15',
    barMuted: 'bg-blue-400/35',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
  },
}

function RingGauge({ pct, stroke }: { pct: number; stroke: string }) {
  const p = clamp(Math.round(pct), 0, 100)
  const r = 17
  const c = 2 * Math.PI * r
  const dash = (p / 100) * c
  return (
    <svg width={44} height={44} viewBox="0 0 44 44" className="shrink-0" aria-hidden>
      <circle cx={22} cy={22} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
      <circle
        cx={22}
        cy={22}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 22 22)"
      />
      <text x={22} y={23} textAnchor="middle" dominantBaseline="middle" fill="#fff" style={{ fontSize: '9px', fontWeight: 700 }}>
        {p}%
      </text>
    </svg>
  )
}

function KpiCard({
  theme,
  label,
  value,
  sublabel,
  gaugePct,
  bars,
  linearPct,
  goalLabel,
}: {
  theme: Theme
  label: string
  value: string
  sublabel?: string
  gaugePct: number
  bars: number[]
  linearPct: number
  goalLabel: string
}) {
  const t = THEME[theme]
  const lp = clamp(Math.round(linearPct), 0, 100)

  return (
    <div
      className={`flex h-full min-h-[268px] w-full min-w-0 flex-col rounded-xl border border-white/10 bg-[#12161f]/95 p-4 shadow-lg backdrop-blur-md dark:border-white/[0.08] dark:bg-[#0c1018]/95 sm:min-h-0 ${t.glow}`}
    >
      <div className="flex min-h-[5.75rem] w-full flex-shrink-0 flex-col justify-start">
        <div className="flex w-full items-start justify-between gap-3">
          <div className="min-w-0 flex-1 text-start">
            <p className="truncate text-2xl font-bold tabular-nums tracking-tight text-white" title={value}>
              {value}
            </p>
            <p className="mt-1 min-h-[2.5rem] text-[11px] leading-snug text-white/50 line-clamp-2">
              {sublabel ?? '\u00a0'}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 text-end">
            <span className="max-w-[7rem] text-[10px] font-semibold uppercase leading-tight tracking-wide text-white/45">
              {label}
            </span>
            <RingGauge pct={gaugePct} stroke={t.stroke} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex h-10 flex-shrink-0 items-end justify-center gap-1 px-0.5">
        {bars.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm ${t.barMuted}`}
            style={{ height: `${h}%`, minHeight: '4px' }}
          />
        ))}
      </div>

      <div className="mt-3 flex-shrink-0">
        <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-white/40">
          <span className="truncate text-start">{goalLabel}</span>
          <span className="shrink-0 tabular-nums text-white/55">{lp}%</span>
        </div>
        <div className={`h-1.5 w-full overflow-hidden rounded-full ${t.track}`}>
          <div className={`h-full rounded-full ${t.fill} transition-all`} style={{ width: `${lp}%` }} />
        </div>
      </div>
    </div>
  )
}

export default function DashboardHeader() {
  const { t, locale } = useI18n()

  const profile = useMemo(() => loadEffectiveBusinessProfile(t), [t, locale])
  const seed = useMemo(() => hashProfile(profile), [profile])

  const kpis = useMemo(() => {
    const h = seed
    const profitPct = 8 + (h % 8)
    const marketDelta = 3 + ((h >> 2) % 7)
    const revenueGoal = Math.round(profile.expectedMonthlyRevenueNis * 1.25)
    const revenueCurrent = Math.round(profile.expectedMonthlyRevenueNis * (0.62 + ((h >> 4) % 25) / 100))
    const revenueGauge = clamp(Math.round((revenueCurrent / revenueGoal) * 100), 12, 100)
    const hired = Math.max(0, profile.recommendedEmployees - 1 - ((h >> 6) % 2))
    const empGauge = clamp(Math.round((hired / Math.max(1, profile.recommendedEmployees)) * 100), 35, 100)
    const budgetUsedPct = clamp(32 + ((h >> 8) % 48), 28, 92)
    const setupTasks = 12 + (h % 11)
    const setupPct = clamp(58 + ((h >> 10) % 38), 45, 98)

    return {
      profitPct,
      marketDelta,
      revenueFormatted: formatNisFull(profile.expectedMonthlyRevenueNis, locale),
      revenueGauge,
      revenueLinear: revenueGauge,
      employees: String(profile.recommendedEmployees),
      empGauge,
      budgetFormatted: formatNisFull(profile.budgetNis, locale),
      budgetUsedPct,
      setupTasks: String(setupTasks),
      setupPct,
      barsAnalysis: barHeights(h),
      barsRevenue: barHeights(h + 1),
      barsEmp: barHeights(h + 2),
      barsBudget: barHeights(h + 3),
      barsSetup: barHeights(h + 4),
    }
  }, [profile, seed, locale])

  return (
    <div className="mb-8 animate-fade-in">
      <h2 className="text-sm font-bold text-surface-800 dark:text-surface-100">{t('dashboard.kpi.sectionTitle')}</h2>
      <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">{t('dashboard.kpi.sectionSubtitle')}</p>

      <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:auto-rows-fr sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:items-stretch lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
        <div className="flex h-full min-h-[268px] w-full min-w-[85vw] snap-center sm:min-h-0 sm:min-w-0">
          <KpiCard
            theme="purple"
            label={t('dashboard.kpi_analysis')}
            value={`${kpis.profitPct}%`}
            sublabel={interpolate(t('dashboard.kpi.analysis.vsMarket'), { delta: String(kpis.marketDelta) })}
            gaugePct={clamp(40 + (seed % 45), 35, 95)}
            bars={kpis.barsAnalysis}
            linearPct={clamp(48 + (seed % 40), 40, 95)}
            goalLabel={t('dashboard.kpi.common.goalTrack')}
          />
        </div>
        <div className="flex h-full min-h-[268px] w-full min-w-[85vw] snap-center sm:min-h-0 sm:min-w-0">
          <KpiCard
            theme="green"
            label={t('dashboard.kpi_revenue')}
            value={kpis.revenueFormatted}
            sublabel={t('dashboard.kpi.revenue.sublabel')}
            gaugePct={kpis.revenueGauge}
            bars={kpis.barsRevenue}
            linearPct={kpis.revenueLinear}
            goalLabel={t('dashboard.kpi.common.currentVsGoal')}
          />
        </div>
        <div className="flex h-full min-h-[268px] w-full min-w-[85vw] snap-center sm:min-h-0 sm:min-w-0">
          <KpiCard
            theme="cyan"
            label={t('dashboard.kpi_employees')}
            value={kpis.employees}
            sublabel={t('dashboard.kpi.employees.status')}
            gaugePct={kpis.empGauge}
            bars={kpis.barsEmp}
            linearPct={kpis.empGauge}
            goalLabel={t('dashboard.kpi.common.capacityTrack')}
          />
        </div>
        <div className="flex h-full min-h-[268px] w-full min-w-[85vw] snap-center sm:min-h-0 sm:min-w-0">
          <KpiCard
            theme="orange"
            label={t('dashboard.kpi_budget')}
            value={kpis.budgetFormatted}
            sublabel={interpolate(t('dashboard.kpi.budget.utilized'), { pct: String(kpis.budgetUsedPct) })}
            gaugePct={kpis.budgetUsedPct}
            bars={kpis.barsBudget}
            linearPct={kpis.budgetUsedPct}
            goalLabel={t('dashboard.kpi.common.spentVsPlan')}
          />
        </div>
        <div className="flex h-full min-h-[268px] w-full min-w-[85vw] snap-center sm:min-h-0 sm:min-w-0">
          <KpiCard
            theme="blue"
            label={t('dashboard.kpi_setup_progress')}
            value={interpolate(t('dashboard.kpi.setup.tasksValue'), { count: kpis.setupTasks })}
            sublabel={t('dashboard.kpi.setup.sublabel')}
            gaugePct={kpis.setupPct}
            bars={kpis.barsSetup}
            linearPct={kpis.setupPct}
            goalLabel={t('dashboard.kpi.common.launchProgress')}
          />
        </div>
      </div>
    </div>
  )
}
