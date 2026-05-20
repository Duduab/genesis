import { LayoutList } from 'lucide-react'

function humanizeKey(key) {
  return String(key || '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

function PrettyValue({ value, depth, t }) {
  if (depth > 12) {
    return <span className="text-xs text-surface-400">…</span>
  }
  if (value === null || value === undefined) {
    return (
      <span className="inline-block rounded-md bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-500 dark:bg-surface-800">
        —
      </span>
    )
  }
  if (typeof value === 'boolean') {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
          value ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80' : 'bg-surface-200 text-surface-600 ring-1 ring-surface-300/80'
        }`}
      >
        {value ? t('activity.dataView.yes') : t('activity.dataView.no')}
      </span>
    )
  }
  if (typeof value === 'number') {
    return <span className="font-mono text-sm font-semibold tabular-nums text-surface-900 dark:text-surface-100">{value}</span>
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return <span className="text-xs text-surface-400">{t('activity.dataView.empty')}</span>
    }
    if (trimmed.length > 600) {
      return (
        <p className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-surface-100 bg-white/90 p-3 text-sm leading-relaxed text-surface-700 dark:border-surface-700 dark:bg-surface-950/50 dark:text-surface-200">
          {value}
        </p>
      )
    }
    return <p className="text-sm leading-relaxed text-surface-800 dark:text-surface-200">{value}</p>
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-xs italic text-surface-400">{t('activity.dataView.emptyList')}</span>
    }
    return (
      <ul className="space-y-2">
        {value.map((entry, i) => (
          <li
            key={i}
            className="relative overflow-hidden rounded-xl border border-surface-100 bg-gradient-to-br from-white to-surface-50/90 ps-3 pe-3 py-2.5 shadow-sm dark:border-surface-700 dark:from-surface-900 dark:to-surface-800/80"
          >
            <span
              className="absolute start-0 top-0 bottom-0 w-1 rounded-e bg-gradient-to-b from-genesis-400 to-cyan-500 shadow-sm shadow-genesis-500/30"
              aria-hidden
            />
            <div className="ps-2">
              {typeof entry === 'object' && entry !== null ? (
                <PrettyRecord data={entry} depth={depth + 1} t={t} nested />
              ) : (
                <PrettyValue value={entry} depth={depth + 1} t={t} />
              )}
            </div>
          </li>
        ))}
      </ul>
    )
  }
  if (typeof value === 'object') {
    return <PrettyRecord data={value} depth={depth + 1} t={t} nested />
  }
  return <span className="text-sm text-surface-700">{String(value)}</span>
}

function PrettyRecord({ data, depth = 0, t, nested = false }) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const entries = Object.entries(data).filter(([k]) => !k.startsWith('_') && k !== 'meta')
  if (entries.length === 0) {
    return <span className="text-xs text-surface-400">{t('activity.dataView.emptyObject')}</span>
  }

  const wrapClass = nested ? 'space-y-2' : 'grid gap-3 sm:grid-cols-1'

  return (
    <div className={wrapClass}>
      {entries.map(([key, val]) => (
        <div
          key={key}
          className={`rounded-xl border border-surface-100 bg-white/90 px-4 py-3 shadow-sm ring-1 ring-surface-100/80 dark:border-surface-700 dark:bg-surface-900/60 dark:ring-surface-800 ${
            nested ? 'border-dashed' : ''
          }`}
        >
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-genesis-500 to-cyan-500 shadow-sm shadow-genesis-500/40" />
            <dt className="text-[11px] font-bold uppercase tracking-wide text-genesis-700 dark:text-genesis-300">
              {humanizeKey(key)}
            </dt>
          </div>
          <dd className="min-w-0 ps-3.5">
            <PrettyValue value={val} depth={depth} t={t} />
          </dd>
        </div>
      ))}
    </div>
  )
}

function unwrapPayload(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'data' in raw && Object.keys(raw).length <= 3) {
    const inner = raw.data
    if (inner !== undefined && typeof inner === 'object') return inner
  }
  return raw
}

export default function PrettyApiDataView({ data, t }) {
  const body = unwrapPayload(data)
  if (body === null || body === undefined) {
    return <p className="text-sm text-surface-500">{t('activity.dataView.empty')}</p>
  }
  if (Array.isArray(body)) {
    return (
      <div className="rounded-2xl border border-genesis-100/80 bg-gradient-to-br from-genesis-50/40 to-white p-4 dark:border-genesis-900/50 dark:from-genesis-950/30 dark:to-surface-900">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-genesis-700 dark:text-genesis-300">
          <LayoutList className="h-4 w-4" />
          {t('activity.dataView.listTitle')}
        </div>
        <PrettyValue value={body} depth={0} t={t} />
      </div>
    )
  }
  if (typeof body === 'object') {
    return (
      <div className="rounded-2xl border border-genesis-100/80 bg-gradient-to-br from-genesis-50/30 via-white to-cyan-50/20 p-4 dark:border-genesis-900/40 dark:from-genesis-950/25 dark:via-surface-900 dark:to-surface-950">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-genesis-700 dark:text-genesis-300">
          <LayoutList className="h-4 w-4" />
          {t('activity.dataView.fieldsTitle')}
        </div>
        <PrettyRecord data={body} depth={0} t={t} />
      </div>
    )
  }
  return <PrettyValue value={body} depth={0} t={t} />
}
