import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { useActiveBusiness } from '../context/ActiveBusinessContext'
import { useAgentActivityListQuery } from '../hooks/useAgentActivityListQuery'
import { loadPersistedGenesisBusinesses } from '../dashboard/genesisBusinessStorage'
import { mapPersistedBusinessToEntityView } from '../dashboard/mapPersistedBusinessToEntityView'
import { getAgentPresentation } from '../config/agentPresentation'
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Activity,
  Filter,
  Code2,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'

const ENTITY_ALL = '__all__'

const statusConfig = {
  Completed: { style: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', icon: CheckCircle2, tKey: 'activity.statusSuccess' },
  'Awaiting Action': { style: 'bg-amber-50 text-amber-700 ring-emerald-600/20', icon: AlertCircle, tKey: 'activity.statusPending' },
  Failed: { style: 'bg-red-50 text-red-700 ring-red-600/20', icon: XCircle, tKey: 'activity.statusError' },
  'In Progress': { style: 'bg-blue-50 text-blue-700 ring-blue-600/20', icon: Clock, tKey: 'activity.statusInProgress' },
  'Not Started': { style: 'bg-surface-100 text-surface-500 ring-surface-400/20', icon: Clock, tKey: 'activity.statusNotStarted' },
}

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function dateKeyFromDate(d) {
  if (!d || Number.isNaN(d.getTime())) return 'earlier'
  const today = startOfDay(new Date())
  const that = startOfDay(d)
  const diffDays = Math.round((today.getTime() - that.getTime()) / 86400000)
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  return 'earlier'
}

function formatActivityTime(d, locale) {
  const tag = locale === 'he' ? 'he-IL' : 'en-US'
  return d.toLocaleTimeString(tag, { hour: 'numeric', minute: '2-digit' })
}

function mapApiStatusToDisplay(raw) {
  const u = String(raw || '').toLowerCase()
  if (u === 'completed') return 'Completed'
  if (u === 'error') return 'Failed'
  if (u === 'pending_approval') return 'Awaiting Action'
  if (u === 'in_progress') return 'In Progress'
  return 'Not Started'
}

function mapStatusFilterToApi(statusFilter) {
  if (statusFilter === 'Completed') return 'completed'
  if (statusFilter === 'Failed') return 'error'
  if (statusFilter === 'Awaiting Action') return 'pending_approval'
  if (statusFilter === 'In Progress') return 'in_progress'
  return undefined
}

function mapActivityItemToRow(row, businessName, locale) {
  const completed = new Date(row.created_at)
  const sortBase = Number.isNaN(completed.getTime()) ? Date.now() : completed.getTime()
  const displayDate = Number.isNaN(completed.getTime()) ? new Date() : completed
  return {
    id: row.activity_id,
    agent: row.agent_id,
    time: Number.isNaN(completed.getTime()) ? '—' : formatActivityTime(completed, locale),
    dateKey: dateKeyFromDate(displayDate),
    entity: businessName || '—',
    action: row.description || row.action,
    status: mapApiStatusToDisplay(row.status),
    payload: row,
    sortAt: sortBase,
    source: 'api',
  }
}

function SelectDropdown({ value, onChange, options, label, t }) {
  return (
    <div className="relative">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-surface-400">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-surface-200 bg-white ps-3 pe-8 text-sm font-medium text-surface-700 outline-none transition-all focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100"
        >
          {options.map((opt) => {
            const optValue = typeof opt === 'string' ? opt : opt.value
            const optLabel =
              typeof opt === 'string' ? opt : opt.tKey ? t(opt.tKey) : opt.label != null ? opt.label : optValue
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            )
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute end-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-surface-400" />
      </div>
    </div>
  )
}

function TimelineItem({ item, t }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const st = statusConfig[item.status] ?? statusConfig['Not Started']
  const StatusIcon = st.icon
  const agentInfo = getAgentPresentation(item.agent)
  const agentLabel = agentInfo.tKey ? t(agentInfo.tKey) : agentInfo.label

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(item.payload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group relative flex gap-4 pb-8 last:pb-0">
      <div className="absolute start-[19px] top-10 bottom-0 w-px bg-surface-200 group-last:hidden" />

      <div
        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${agentInfo.gradient} ring-4 ring-surface-50`}
      >
        <img
          src={`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(agentInfo.avatar)}&backgroundColor=transparent&size=24`}
          alt={agentLabel}
          className="h-5 w-5"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="rounded-xl border border-surface-200 bg-white shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-surface-900">{agentLabel}</span>
                <span className="text-surface-300">·</span>
                <span className="text-xs text-surface-400">{item.entity}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-surface-600">{item.action}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${st.style}`}
              >
                <StatusIcon className="h-3 w-3" />
                {t(st.tKey)}
              </span>
              <span className="hidden whitespace-nowrap text-xs text-surface-400 sm:inline">{item.time}</span>
            </div>
          </div>

          <div className="border-t border-surface-100">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center gap-2 px-5 py-2 text-xs font-medium text-surface-400 transition-colors hover:text-genesis-600"
            >
              {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <Code2 className="h-3.5 w-3.5" />
              {expanded ? t('activity.hideDetails') : t('activity.expandDetails')}
              <span className="ms-auto text-xs text-surface-400 sm:hidden">{item.time}</span>
            </button>

            {expanded ? (
              <div className="border-t border-surface-100 bg-surface-50/70 px-5 py-4">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">{t('activity.rawPayload')}</p>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copied ? t('activity.copied') : t('activity.copy')}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-lg border border-surface-200 bg-white p-3.5 font-mono text-xs leading-relaxed text-surface-600">
                  {JSON.stringify(item.payload, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

const DATE_SECTION_ORDER = ['today', 'yesterday', 'earlier']

export default function AgentActivityPage() {
  const { t, locale } = useI18n()
  const { activeBusinessId, activeViewModel } = useActiveBusiness()
  const [agentFilter, setAgentFilter] = useState('all')
  const [entityFilter, setEntityFilter] = useState(ENTITY_ALL)
  const [statusFilter, setStatusFilter] = useState('All')

  const { businessId, businessName } = useMemo(() => {
    const list = loadPersistedGenesisBusinesses()
    const id = activeBusinessId?.trim() || list[0]?.businessId || null
    if (!id) return { businessId: null, businessName: '' }
    let name = ''
    if (activeBusinessId === id && activeViewModel) {
      name = activeViewModel.name
    } else {
      const row = list.find((b) => b.businessId === id)
      if (row) name = mapPersistedBusinessToEntityView(row, locale).name
    }
    return { businessId: id, businessName: name }
  }, [activeBusinessId, activeViewModel, locale])

  const statusApi = mapStatusFilterToApi(statusFilter)
  const { data: activityPayload, isLoading, isError, refetch } = useAgentActivityListQuery(
    {
      business_id: businessId,
      agent: agentFilter === 'all' ? undefined : agentFilter,
      status: statusApi,
    },
    { enabled: Boolean(businessId), limit: 200 },
  )

  const apiItems = useMemo(() => activityPayload?.items ?? [], [activityPayload?.items])

  const apiTimelineItems = useMemo(
    () => apiItems.map((row) => mapActivityItemToRow(row, businessName, locale)),
    [apiItems, businessName, locale],
  )

  const agentFilterOptions = useMemo(() => {
    const opts = [{ value: 'all', tKey: 'activity.allAgents' }]
    const seen = new Set()
    for (const row of apiItems) {
      if (seen.has(row.agent_id)) continue
      seen.add(row.agent_id)
      const meta = getAgentPresentation(row.agent_id)
      opts.push({
        value: row.agent_id,
        tKey: meta.tKey,
        label: meta.label,
      })
    }
    return opts
  }, [apiItems])

  const entityOptions = useMemo(() => {
    const names = [...new Set(apiTimelineItems.map((a) => a.entity).filter(Boolean))]
    names.sort()
    return [ENTITY_ALL, ...names]
  }, [apiTimelineItems])

  const filtered = apiTimelineItems.filter((item) => {
    const matchAgent = agentFilter === 'all' || item.agent === agentFilter
    const matchEntity = entityFilter === ENTITY_ALL || item.entity === entityFilter
    const matchStatus = statusFilter === 'All' || item.status === statusFilter
    return matchAgent && matchEntity && matchStatus
  })

  const grouped = useMemo(() => {
    const acc = { today: [], yesterday: [], earlier: [] }
    for (const item of filtered) {
      const key = item.dateKey === 'today' || item.dateKey === 'yesterday' ? item.dateKey : 'earlier'
      acc[key].push(item)
    }
    for (const key of DATE_SECTION_ORDER) {
      acc[key].sort((a, b) => (b.sortAt ?? 0) - (a.sortAt ?? 0))
    }
    return acc
  }, [filtered])

  const totalActions = apiTimelineItems.length
  const completedCount = apiTimelineItems.filter((d) => d.status === 'Completed').length
  const pendingCount = apiTimelineItems.filter((d) => d.status === 'Awaiting Action' || d.status === 'Not Started').length
  const failedCount = apiTimelineItems.filter((d) => d.status === 'Failed').length

  return (
    <div key={businessId ?? 'none'} className="mx-auto max-w-5xl">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-surface-900">{t('activity.title')}</h1>
        <p className="mt-1 text-sm text-surface-500">{t('activity.subtitle')}</p>
        {businessName ? (
          <p className="mt-0.5 text-xs font-medium text-genesis-600">
            {t('legal.subtitleForBusiness').replaceAll('{{name}}', businessName)}
          </p>
        ) : null}
      </div>

      {isError && businessId ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          {t('activity.loadActivityFailed')}
          <button type="button" className="ms-2 font-semibold text-genesis-700 underline" onClick={() => refetch()}>
            {t('common.retry')}
          </button>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { tKey: 'activity.totalActions', value: totalActions, color: 'text-genesis-600', bg: 'bg-genesis-50', icon: Activity },
          { tKey: 'activity.statusSuccess', value: completedCount, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { tKey: 'activity.statusPending', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle },
          { tKey: 'activity.statusError', value: failedCount, color: 'text-red-500', bg: 'bg-red-50', icon: XCircle },
        ].map((s) => {
          const SIcon = s.icon
          return (
            <div key={s.tKey} className="rounded-xl border border-surface-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.bg}`}>
                  <SIcon className={`h-3.5 w-3.5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-surface-400">{t(s.tKey)}</p>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 rounded-xl border border-surface-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-end gap-1.5 pb-3">
          <Filter className="h-4 w-4 text-surface-400" />
          <span className="text-xs font-semibold text-surface-500">{t('activity.filters')}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectDropdown
            label={t('activity.filterAgent')}
            value={agentFilter}
            onChange={setAgentFilter}
            options={agentFilterOptions}
            t={t}
          />
          <SelectDropdown
            label={t('activity.filterEntity')}
            value={entityFilter}
            onChange={setEntityFilter}
            options={[
              { value: ENTITY_ALL, tKey: 'activity.allEntities' },
              ...entityOptions.slice(1).map((e) => ({ value: e, label: e })),
            ]}
            t={t}
          />
          <SelectDropdown
            label={t('activity.filterStatus')}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'All', tKey: 'activity.all' },
              { value: 'Completed', tKey: 'activity.statusSuccess' },
              { value: 'In Progress', tKey: 'activity.statusInProgress' },
              { value: 'Not Started', tKey: 'activity.statusNotStarted' },
              { value: 'Awaiting Action', tKey: 'activity.statusPending' },
              { value: 'Failed', tKey: 'activity.statusError' },
            ]}
            t={t}
          />
        </div>
      </div>

      <div className="mt-6">
        {isLoading && businessId ? (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-4 py-3 text-sm text-surface-600">
            <Loader2 className="h-4 w-4 animate-spin text-genesis-600" aria-hidden />
            {t('activity.loadingAgents')}
          </div>
        ) : null}

        {DATE_SECTION_ORDER.some((k) => grouped[k].length > 0) ? (
          DATE_SECTION_ORDER.map((dateKey) =>
            grouped[dateKey].length > 0 ? (
              <div key={dateKey} className="mb-8 last:mb-0">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-surface-500">
                    {t(`activity.${dateKey}`)}
                  </span>
                  <div className="h-px flex-1 bg-surface-200" />
                  <span className="rounded-full bg-surface-100 px-2.5 py-0.5 text-[10px] font-bold text-surface-400">
                    {grouped[dateKey].length}{' '}
                    {grouped[dateKey].length === 1 ? t('activity.event') : t('activity.events')}
                  </span>
                </div>
                <div className="ps-0">
                  {grouped[dateKey].map((item) => (
                    <TimelineItem key={item.id} item={item} t={t} />
                  ))}
                </div>
              </div>
            ) : null,
          )
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-300 bg-white/50 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-100">
              <Activity className="h-6 w-6 text-surface-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-surface-500">{t('activity.noActivity')}</p>
            <p className="mt-0.5 text-xs text-surface-400">{t('activity.noActivitySub')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
