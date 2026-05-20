import { useMemo } from 'react'
import { Activity, Gauge, LayoutGrid, MessageSquareText } from 'lucide-react'
import PrettyApiDataView from './PrettyApiDataView.jsx'

function unwrapPayload(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'data' in raw && Object.keys(raw).length <= 3) {
    const inner = raw.data
    if (inner !== undefined && typeof inner === 'object') return inner
  }
  return raw
}

function humanizeKey(key) {
  return String(key || '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

function humanizePath(path) {
  if (!path.length) return 'Value'
  return path.map((p) => (/^\d+$/.test(p) ? `#${Number(p) + 1}` : humanizeKey(p))).join(' · ')
}

const SCORE_KEY_RE =
  /confidence|score|progress|completion|probability|health|certainty|quality|grade|rating|pct|percent|weight|index|partial|blueprint|scoring|signal|alignment|coverage|readiness|maturity|velocity|margin|exposure|likelihood|strength|weakness|satisfaction|density|saturation|balance|parity|drift|latency/i

const RISK_KEY_RE = /risk|loss|burn|debt|exposure|threat|vulnerability|severity|downside|gap|deficit|shortfall/i

const NARRATIVE_KEY_RE =
  /synthesis|risk|directive|insight|narrative|summary|outcome|recommendation|explanation|analysis|verdict|assessment|commentary|rationale|finding|observation|conclusion|forecast|projection|narrative|story|briefing/i

const MONEY_KEY_RE = /amount|revenue|cost|price|value|money|currency|ils|nis|shekel|budget|payout|loss|profit|burn|runway|salary|fee|charge/i

/** Grounding / audit fields — never show as chips or “insights”. */
const GROUNDING_META_KEY_RE = /^(reason|tool|field|status|phase|mode|missing_input|user_input)$/i

function isGroundingOrAuditPath(pathStr, leafKey) {
  const p = pathStr.toLowerCase()
  if (p.includes('grounded.') || p.includes('missing_input') || p.includes('audit.')) return true
  if (GROUNDING_META_KEY_RE.test(leafKey)) return true
  return false
}

function shouldDropInsightNarrative(n) {
  const title = String(n.title || '').toLowerCase()
  const body = String(n.body || '').trim()
  const bodyLower = body.toLowerCase()
  const key = String(n.key || '').toLowerCase()

  if (/revenue\s*derivation|feasibility\s*confidence/.test(title)) return true
  if (key.includes('revenue_derivation') || key.includes('feasibility_confidence')) return true
  if (title.includes('derivation') && body.length < 320) return true
  if ((title.includes('feasibility') || key.includes('feasibility')) && body.length < 80) return true
  if (body.length <= 20 && /^(low|medium|high|partial|none|n\/a|na)$/i.test(bodyLower)) return true
  return false
}

function numberToPercent(key, n) {
  if (!Number.isFinite(n)) return null
  const abs = Math.abs(n)
  if (n >= 0 && n <= 1 && !Number.isInteger(n)) return n * 100
  if (n === 0 || n === 1) {
    const lk = String(key).toLowerCase()
    if (SCORE_KEY_RE.test(lk)) return n * 100
    return null
  }
  if (abs > 1 && abs <= 100) return n
  return null
}

function flattenLeaves(value, path, out, depth) {
  if (depth > 10) return
  if (value === null || value === undefined) return

  if (typeof value === 'number' && Number.isFinite(value)) {
    out.push({ path: [...path], value })
    return
  }
  if (typeof value === 'boolean') {
    out.push({ path: [...path], value })
    return
  }
  if (typeof value === 'string') {
    out.push({ path: [...path], value })
    return
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return
    if (value.every((v) => typeof v === 'string' || typeof v === 'number')) {
      const joined = value
        .map((v) => (typeof v === 'number' ? String(v) : String(v).trim()))
        .filter(Boolean)
        .join('\n')
      if (joined) out.push({ path: [...path], value: joined })
      return
    }
    value.forEach((v, i) => flattenLeaves(v, [...path, String(i)], out, depth + 1))
    return
  }

  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('_') || k === 'meta') continue
      flattenLeaves(v, [...path, k], out, depth + 1)
    }
  }
}

function formatNumberForKpi(n, keyPath) {
  const k = keyPath.join('.').toLowerCase()
  if (MONEY_KEY_RE.test(k) && Math.abs(n) >= 1000) {
    try {
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)
    } catch {
      return String(Math.round(n))
    }
  }
  if (Math.abs(n) >= 1000) {
    try {
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 1, notation: 'compact' }).format(n)
    } catch {
      return String(n)
    }
  }
  if (Number.isInteger(n)) return String(n)
  return String(Math.round(n * 1000) / 1000)
}

function buildModel(root) {
  const leaves = []
  flattenLeaves(root, [], leaves, 0)

  const metrics = []
  const kpis = []
  const narratives = []

  for (const leaf of leaves) {
    const path = leaf.path
    const leafKey = path[path.length - 1] || ''
    const pathStr = path.join('.').toLowerCase()
    const label = humanizePath(path)

    if (typeof leaf.value === 'number') {
      const pct = numberToPercent(leafKey, leaf.value)
      const fractional = leaf.value >= 0 && leaf.value <= 1 && !Number.isInteger(leaf.value)
      if (pct != null && (SCORE_KEY_RE.test(pathStr) || fractional)) {
        metrics.push({
          key: pathStr,
          label,
          pct: Math.max(0, Math.min(100, pct)),
          raw: leaf.value,
          tone: RISK_KEY_RE.test(pathStr) ? 'risk' : 'default',
        })
      } else {
        kpis.push({ key: pathStr, label, value: leaf.value })
      }
      continue
    }

    if (typeof leaf.value === 'boolean') {
      continue
    }

    if (typeof leaf.value === 'string') {
      const s = leaf.value.trim()
      if (!s) continue

      if (isGroundingOrAuditPath(pathStr, leafKey) && s.length < 400) {
        continue
      }

      if (s.length >= 120 || NARRATIVE_KEY_RE.test(pathStr)) {
        const item = { key: pathStr, title: humanizeKey(leafKey) || label, body: leaf.value }
        if (!shouldDropInsightNarrative(item)) narratives.push(item)
      } else if (s.length > 64) {
        const item = { key: pathStr, title: humanizeKey(leafKey) || label, body: leaf.value }
        if (!shouldDropInsightNarrative(item)) narratives.push(item)
      }
      continue
    }
  }

  /** De-duplicate metrics by key, keep max pct for same logical key (stabilize UI) */
  const metricMap = new Map()
  for (const m of metrics) {
    const prev = metricMap.get(m.key)
    if (!prev || m.pct > prev.pct) metricMap.set(m.key, m)
  }
  let metricList = [...metricMap.values()]

  metricList.sort((a, b) => {
    const pri = (x) =>
      /confidence|overall|aggregate|primary|total|readiness|health/i.test(x.key) ? 0 : 1
    const d = pri(a) - pri(b)
    if (d !== 0) return d
    return a.label.localeCompare(b.label)
  })

  const mainCandidates = metricList.filter((m) =>
    /confidence|overall|aggregate|primary|total.?score|readiness|health/i.test(m.key),
  )

  let mainMetric = mainCandidates[0] ?? null
  let mainComposite = null
  let secondaryMetrics = []

  if (mainMetric) {
    secondaryMetrics = metricList.filter((m) => m.key !== mainMetric.key).slice(0, 14)
  } else if (metricList.length > 1) {
    mainComposite = Math.min(
      100,
      Math.round(metricList.reduce((s, m) => s + m.pct, 0) / metricList.length),
    )
    secondaryMetrics = metricList.slice(0, 14)
  } else if (metricList.length === 1) {
    mainMetric = metricList[0]
    secondaryMetrics = []
  }

  const kpiDedup = new Map()
  for (const k of kpis) {
    if (!kpiDedup.has(k.key)) kpiDedup.set(k.key, k)
  }
  const kpiList = [...kpiDedup.values()].slice(0, 8)

  const narDedup = new Map()
  for (const n of narratives) {
    if (shouldDropInsightNarrative(n)) continue
    if (!narDedup.has(n.body)) narDedup.set(n.body, n)
  }
  const narrativeList = [...narDedup.values()].slice(0, 6)

  return {
    mainMetric,
    mainComposite,
    secondaryMetrics,
    kpis: kpiList,
    narratives: narrativeList,
  }
}

function BarFill({ pct, tone, tall }) {
  const p = Math.max(0, Math.min(100, pct))
  const grad =
    tone === 'risk'
      ? 'from-amber-500 via-orange-500 to-red-600'
      : 'from-genesis-500 via-cyan-500 to-emerald-400'
  const h = tall ? 'h-4' : 'h-2.5'
  return (
    <div className={`${h} overflow-hidden rounded-full bg-surface-200 shadow-inner dark:bg-surface-800`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700 ease-out`}
        style={{ width: `${p}%` }}
      />
    </div>
  )
}

function MetricRow({ label, pct, raw, tone, t }) {
  const display = Number.isInteger(pct) ? String(Math.round(pct)) : (Math.round(pct * 10) / 10).toFixed(1)
  const suffix = t('activity.drilldownDashboard.percentSuffix')
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold leading-snug text-surface-800 dark:text-surface-100">{label}</span>
        <span className="shrink-0 text-xs font-bold tabular-nums text-genesis-700 dark:text-genesis-300">
          {display}
          {suffix}
        </span>
      </div>
      <BarFill pct={pct} tone={tone} tall={false} />
      {typeof raw === 'number' && raw > 0 && raw < 1 ? (
        <p className="text-[10px] text-surface-400">{t('activity.drilldownDashboard.rawScaleHint')}</p>
      ) : null}
    </div>
  )
}

export default function AgentDrilldownDashboard({ data, t }) {
  const model = useMemo(() => {
    const body = unwrapPayload(data)
    if (body == null || typeof body !== 'object') return null
    return buildModel(body)
  }, [data])

  const body = unwrapPayload(data)

  if (body == null) {
    return <p className="text-sm text-surface-500">{t('activity.dataView.empty')}</p>
  }
  if (typeof body !== 'object') {
    return <PrettyApiDataView data={data} t={t} />
  }

  if (!model) return null

  const mainPct = model.mainMetric ? model.mainMetric.pct : model.mainComposite != null ? model.mainComposite : null

  return (
    <div className="space-y-5">
      {/* Hero — main score */}
      <section className="relative overflow-hidden rounded-2xl border border-genesis-200/80 bg-gradient-to-br from-white via-genesis-50/50 to-cyan-50/30 p-5 shadow-md dark:border-genesis-900/50 dark:from-surface-900 dark:via-genesis-950/40 dark:to-surface-950">
        <div className="pointer-events-none absolute -end-16 -top-16 h-40 w-40 rounded-full bg-genesis-400/15 blur-3xl dark:bg-genesis-500/10" />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-genesis-800 dark:text-genesis-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-genesis-500 to-cyan-500 text-white shadow-lg shadow-genesis-500/25">
              <Gauge className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h3 className="text-sm font-bold text-surface-900 dark:text-surface-50">
                {t('activity.drilldownDashboard.mainScoreTitle')}
              </h3>
              <p className="text-[11px] text-surface-600 dark:text-surface-400">
                {model.mainMetric
                  ? model.mainMetric.label
                  : model.mainComposite != null
                    ? t('activity.drilldownDashboard.compositeHint')
                    : t('activity.drilldownDashboard.noScoreHint')}
              </p>
            </div>
          </div>
          {mainPct != null ? (
            <div className="text-end">
              <p className="text-3xl font-black tabular-nums tracking-tight text-genesis-700 dark:text-genesis-300">
                {Number.isInteger(mainPct) ? Math.round(mainPct) : (Math.round(mainPct * 10) / 10).toFixed(1)}
                <span className="text-lg font-bold text-genesis-600/80 dark:text-genesis-400/90">
                  {t('activity.drilldownDashboard.percentSuffix')}
                </span>
              </p>
            </div>
          ) : null}
        </div>
        {mainPct != null ? (
          <div className="relative mt-4 space-y-2">
            <BarFill pct={mainPct} tone={model.mainMetric?.tone === 'risk' ? 'risk' : 'default'} tall />
            <p className="text-[10px] font-medium uppercase tracking-wide text-surface-400">
              {t('activity.drilldownDashboard.mainBarCaption')}
            </p>
          </div>
        ) : (
          <p className="relative mt-3 text-xs text-surface-600 dark:text-surface-300">
            {t('activity.drilldownDashboard.noBarsHint')}
          </p>
        )}
      </section>

      {/* KPI strip */}
      {model.kpis.length ? (
        <section>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-surface-500 dark:text-surface-400">
            <LayoutGrid className="h-4 w-4 text-genesis-600" aria-hidden />
            {t('activity.drilldownDashboard.kpiTitle')}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {model.kpis.map((k) => (
              <div
                key={k.key}
                className="rounded-xl border border-surface-200/90 bg-white/95 p-4 shadow-sm dark:border-surface-700 dark:bg-surface-900/80"
              >
                <p className="text-[10px] font-bold uppercase leading-tight tracking-wide text-surface-400">{k.label}</p>
                <p className="mt-2 text-lg font-black tabular-nums text-surface-900 dark:text-surface-50">
                  {formatNumberForKpi(k.value, k.key.split('.'))}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Secondary metrics */}
      {model.secondaryMetrics.length ? (
        <section className="rounded-2xl border border-surface-200/90 bg-surface-50/50 p-4 dark:border-surface-700 dark:bg-surface-950/50">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-surface-500 dark:text-surface-400">
            <Activity className="h-4 w-4 text-genesis-600" aria-hidden />
            {t('activity.drilldownDashboard.signalsTitle')}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {model.secondaryMetrics.map((m) => (
              <MetricRow key={m.key} label={m.label} pct={m.pct} raw={m.raw} tone={m.tone} t={t} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Narratives */}
      {model.narratives.length ? (
        <section>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-surface-500 dark:text-surface-400">
            <MessageSquareText className="h-4 w-4 text-genesis-600" aria-hidden />
            {t('activity.drilldownDashboard.insightsTitle')}
          </div>
          <div className="space-y-3">
            {model.narratives.map((n, i) => (
              <article
                key={`${n.key}-${i}`}
                className="rounded-2xl border border-surface-200/90 bg-white p-4 shadow-sm dark:border-surface-700 dark:bg-surface-900/80"
              >
                <h4 className="text-xs font-bold uppercase tracking-wide text-genesis-700 dark:text-genesis-300">{n.title}</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-surface-700 dark:text-surface-200" dir="auto">
                  {n.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* Fallback when model is thin */}
      {!model.secondaryMetrics.length && !model.kpis.length && !model.narratives.length && mainPct == null ? (
        <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50/80 p-4 dark:border-surface-600">
          <PrettyApiDataView data={data} t={t} />
        </div>
      ) : null}
    </div>
  )
}
