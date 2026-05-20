import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Loader2,
  Sparkles,
  X,
  XCircle,
  CircleDot,
  Circle,
} from 'lucide-react'
import { useBusinessAgentsProgressQuery } from '../hooks/useBusinessAgentsProgressQuery'
import { fetchBusinessAgentDrilldown, drilldownSegmentForAgentId } from '../api/genesis/businessAgentsProgressApi'
import { isGenesisApiError } from '../api/genesis/errors'
import AgentDrilldownDashboard from './AgentDrilldownDashboard.jsx'
import { getAgentPresentation } from '../config/agentPresentation'

function formatIso(iso, locale) {
  if (!iso || typeof iso !== 'string') return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const tag = locale === 'he' ? 'he-IL' : 'en-US'
  return d.toLocaleString(tag, { dateStyle: 'short', timeStyle: 'short' })
}

function stageStatusKey(status) {
  const u = String(status || '')
    .trim()
    .toUpperCase()
  if (u === 'NOT_STARTED') return 'NOT_STARTED'
  if (u === 'IN_PROGRESS') return 'IN_PROGRESS'
  if (u === 'SUCCESS') return 'SUCCESS'
  if (u === 'FAILED') return 'FAILED'
  return u || 'NOT_STARTED'
}

function stageStatusUi(status) {
  const k = stageStatusKey(status)
  const map = {
    NOT_STARTED: {
      pill: 'bg-surface-100 text-surface-600 ring-surface-200',
      bar: 'bg-surface-200',
      icon: Circle,
    },
    IN_PROGRESS: {
      pill: 'bg-genesis-50 text-genesis-800 ring-genesis-200',
      bar: 'bg-gradient-to-r from-genesis-400 to-cyan-400',
      icon: Loader2,
    },
    SUCCESS: {
      pill: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
      bar: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    FAILED: {
      pill: 'bg-red-50 text-red-800 ring-red-200',
      bar: 'bg-red-500',
      icon: XCircle,
    },
  }
  return (
    map[k] ?? {
      pill: 'bg-surface-100 text-surface-600 ring-surface-200',
      bar: 'bg-surface-300',
      icon: CircleDot,
    }
  )
}

function globalStatusChipClass(status) {
  const u = String(status || '')
    .trim()
    .toUpperCase()
  if (u === 'COMPLETED' || u === 'COMPLETE') return 'bg-emerald-100 text-emerald-800 ring-emerald-200'
  if (u === 'FAILED') return 'bg-red-100 text-red-800 ring-red-200'
  if (u === 'CANCELLED') return 'bg-surface-200 text-surface-700 ring-surface-300'
  if (u === 'IN_PROGRESS' || u.includes('PROGRESS')) return 'bg-genesis-100 text-genesis-800 ring-genesis-200'
  return 'bg-amber-50 text-amber-900 ring-amber-200'
}

function globalRunStatusLabel(status, t) {
  const u = String(status ?? '')
    .trim()
    .toUpperCase()
  const base = 'activity.agentsPipeline.globalRunStatus.'
  if (u === 'COMPLETED' || u === 'COMPLETE') return t(`${base}COMPLETED`)
  if (u === 'FAILED') return t(`${base}FAILED`)
  if (u === 'CANCELLED') return t(`${base}CANCELLED`)
  if (u === 'IN_PROGRESS' || u.includes('PROGRESS')) return t(`${base}IN_PROGRESS`)
  return t(`${base}default`).replace('{{status}}', String(status || '—'))
}

function pipelineStageLabel(statusKey, t) {
  const k = `activity.agentsPipeline.pipelineStage.${statusKey}`
  const out = t(k)
  if (out !== k) return out
  const ek = `enums.stageStatus.${statusKey}`
  const fallback = t(ek)
  return fallback !== ek ? fallback : statusKey
}

function stageBarFillPercent(statusKey) {
  if (statusKey === 'SUCCESS' || statusKey === 'FAILED') return 100
  if (statusKey === 'IN_PROGRESS') return 72
  return 14
}

function pipelineAgentBlurb(agentId, t) {
  const k = `activity.agentsPipeline.agentBlurb.${String(agentId || '').trim()}`
  const out = t(k)
  return out === k ? null : out
}

function StageMiniProgress({ status, t, queueHint }) {
  const sk = stageStatusKey(status)
  const pct = stageBarFillPercent(sk)
  const label = pipelineStageLabel(sk, t)
  let gradient =
    'from-surface-300 to-surface-200 dark:from-surface-600 dark:to-surface-700 dark:opacity-90'
  if (sk === 'SUCCESS') gradient = 'from-emerald-500 to-teal-400'
  if (sk === 'FAILED') gradient = 'from-red-500 to-rose-500'
  if (sk === 'IN_PROGRESS') gradient = 'from-genesis-500 via-cyan-400 to-genesis-400'

  return (
    <div className="mt-3 space-y-1">
      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide text-surface-400">
        <span>{t('activity.agentsPipeline.stepProgressCaption')}</span>
        <span className="max-w-[55%] truncate text-end normal-case text-surface-600 dark:text-surface-300">{label}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-surface-200/95 dark:bg-surface-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={label}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} ${sk === 'IN_PROGRESS' ? 'animate-pulse' : ''} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {queueHint ? <p className="text-[10px] leading-snug text-surface-500 dark:text-surface-400">{queueHint}</p> : null}
    </div>
  )
}

function AgentDrilldownModal({ open, onClose, businessId, agentId, displayLabel, t }) {
  const [copied, setCopied] = useState(false)
  const hasPath = Boolean(agentId && drilldownSegmentForAgentId(agentId))

  const q = useQuery({
    queryKey: ['agent-drilldown', businessId, agentId],
    queryFn: () => fetchBusinessAgentDrilldown(businessId, agentId),
    enabled: open && Boolean(businessId && agentId && hasPath),
    retry: false,
  })

  const handleCopy = useCallback(() => {
    const payload = q.data
    if (payload == null) return
    void navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }, [q.data])

  if (!open) return null

  /** Portal to document.body avoids main/sidebar stacking contexts so the overlay sits above the nav (z-50). */
  const overlay = (
    <div
      className="fixed inset-0 z-[2147483646] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-drilldown-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[min(92vh,880px)] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-surface-200 bg-white shadow-2xl sm:rounded-2xl dark:border-surface-700 dark:bg-surface-900">
        <div className="flex items-start justify-between gap-3 border-b border-surface-100 bg-gradient-to-l from-genesis-50/80 to-white px-5 py-4 dark:border-surface-800 dark:from-genesis-950/40 dark:to-surface-900">
          <div className="min-w-0">
            <p id="agent-drilldown-title" className="text-sm font-bold text-surface-900 dark:text-surface-50">
              {displayLabel}
            </p>
            <p className="mt-0.5 text-xs text-surface-500">{t('activity.drilldownDashboard.modalSubtitle')}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {hasPath && q.data != null && !q.isPending && !q.isError ? (
              <button
                type="button"
                onClick={handleCopy}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-800 dark:hover:bg-surface-800"
                aria-label={t('activity.dataView.copyJson')}
                title={t('activity.dataView.copyJson')}
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-800 dark:hover:bg-surface-800"
              aria-label={t('common.close')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {!hasPath ? (
            <p className="text-sm text-surface-500">{t('activity.agentsPipeline.drilldownUnsupported')}</p>
          ) : q.isPending ? (
            <div className="flex flex-col items-center gap-3 py-12 text-surface-500">
              <Loader2 className="h-8 w-8 animate-spin text-genesis-600" />
              <p className="text-sm">{t('activity.agentsPipeline.drilldownLoading')}</p>
            </div>
          ) : q.isError ? (
            <p className="text-sm text-red-600">
              {isGenesisApiError(q.error) ? q.error.message : String(q.error)}
            </p>
          ) : q.data == null ? (
            <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50/80 px-4 py-8 text-center dark:border-surface-600 dark:bg-surface-800/50">
              <p className="text-sm font-medium text-surface-600 dark:text-surface-300">
                {t('activity.agentsPipeline.drilldownEmpty')}
              </p>
              <p className="mt-1 text-xs text-surface-400">{t('activity.agentsPipeline.drilldownEmptyHint')}</p>
            </div>
          ) : (
            <AgentDrilldownDashboard data={q.data} t={t} />
          )}
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(overlay, document.body) : overlay
}

export default function AgentActivityProgressSection({ businessId, locale, t }) {
  const [drill, setDrill] = useState({ open: false, agentId: '', label: '' })

  const progressQ = useBusinessAgentsProgressQuery(businessId, { enabled: Boolean(businessId) })
  const data = progressQ.data

  const stages = data?.stages ?? []

  const summaryLine = useMemo(() => {
    if (!data) return ''
    return t('activity.agentsPipeline.stagesSummary')
      .replaceAll('{{completed}}', String(data.stages_completed ?? 0))
      .replaceAll('{{inProgress}}', String(data.stages_in_progress ?? 0))
      .replaceAll('{{failed}}', String(data.stages_failed ?? 0))
      .replaceAll('{{total}}', String(data.stages_total ?? stages.length))
  }, [data, stages.length, t])

  const stepsLine = useMemo(() => {
    if (!data) return ''
    return t('activity.agentsPipeline.stepsCompleteLine')
      .replace('{{completed}}', String(data.stages_completed ?? 0))
      .replace('{{total}}', String(data.stages_total ?? stages.length))
  }, [data, stages.length, t])

  const runningLine = useMemo(() => {
    if (!data) return ''
    const n = Number(data.stages_in_progress ?? 0)
    if (!n) return ''
    return t('activity.agentsPipeline.runningNow').replace('{{count}}', String(n))
  }, [data, t])

  if (!businessId) return null

  const closeDrill = () => setDrill({ open: false, agentId: '', label: '' })

  const openDrill = (stage) => {
    const label =
      locale === 'he' ? stage.display_name || stage.display_name_en : stage.display_name_en || stage.display_name
    setDrill({ open: true, agentId: stage.agent_id, label })
  }

  const pct = Math.max(0, Math.min(100, Math.round(Number(data?.progress_percent ?? 0))))

  return (
    <>
      <div className="mt-6 overflow-hidden rounded-2xl border border-genesis-200/70 bg-gradient-to-br from-white via-genesis-50/30 to-cyan-50/20 shadow-md ring-1 ring-genesis-100/80 dark:border-genesis-800/50 dark:from-surface-900 dark:via-genesis-950/20 dark:to-surface-950 dark:ring-genesis-900/40">
        <div className="border-b border-genesis-100/80 bg-white/60 px-5 py-4 backdrop-blur-sm dark:border-genesis-900/40 dark:bg-surface-900/40">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-genesis-500 to-cyan-500 shadow-lg shadow-genesis-500/25">
                <Sparkles className="h-5 w-5 text-white" aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-bold text-surface-900 dark:text-surface-50">
                  {t('activity.agentsPipeline.title')}
                </h2>
                <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">{t('activity.agentsPipeline.subtitle')}</p>
              </div>
            </div>
            {data?.global_status ? (
              <span
                className={`max-w-[min(100%,220px)] text-balance text-end text-xs font-semibold leading-snug tracking-normal ring-1 ring-inset ${globalStatusChipClass(data.global_status)} inline-flex items-center rounded-full px-3 py-1.5`}
              >
                {globalRunStatusLabel(data.global_status, t)}
              </span>
            ) : progressQ.isPending ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-100 px-3 py-1 text-[11px] font-medium text-surface-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t('activity.loadingAgents')}
              </span>
            ) : null}
          </div>

          {progressQ.isError ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
              {isGenesisApiError(progressQ.error) ? progressQ.error.message : t('activity.agentsPipeline.loadFailed')}
            </div>
          ) : null}

          {data ? (
            <>
              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-genesis-800/90 dark:text-genesis-200/90">
                    {t('activity.agentsPipeline.overallProgressLabel')}
                  </p>
                  <span className="text-2xl font-bold tabular-nums text-genesis-700 dark:text-genesis-300">{pct}%</span>
                </div>
                <p className="text-xs font-medium text-surface-700 dark:text-surface-200">{stepsLine}</p>
                {runningLine ? (
                  <p className="text-xs font-semibold text-genesis-700 dark:text-genesis-300">{runningLine}</p>
                ) : null}
                <div className="h-3 overflow-hidden rounded-full bg-surface-200/90 shadow-inner dark:bg-surface-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-genesis-500 via-cyan-500 to-emerald-400 transition-[width] duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-surface-500 dark:text-surface-400">{summaryLine}</p>
              </div>
            </>
          ) : null}
        </div>

        <div className="border-t border-genesis-100/60 bg-white/40 px-4 py-4 dark:border-genesis-900/40 dark:bg-surface-950/30 sm:px-5">
          {progressQ.isPending && !data ? (
            <div className="flex items-center gap-3 py-6 text-sm text-surface-500">
              <Loader2 className="h-6 w-6 shrink-0 animate-spin text-genesis-600" />
              {t('activity.agentsPipeline.loadingPipeline')}
            </div>
          ) : progressQ.isError && !data ? (
            <div className="py-6 text-center text-sm text-surface-500">{t('activity.agentsPipeline.loadFailed')}</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {stages.map((stage, idx) => {
                const ui = stageStatusUi(stage.status)
                const StatusIcon = ui.icon
                const pres = getAgentPresentation(stage.agent_id)
                const agentRoleLabel = pres.tKey ? t(pres.tKey) : null
                const name =
                  locale === 'he' ? stage.display_name || stage.display_name_en : stage.display_name_en || stage.display_name
                const sk = stageStatusKey(stage.status)
                const statusLabel = pipelineStageLabel(sk, t)
                const canDrill = sk !== 'NOT_STARTED' && drilldownSegmentForAgentId(stage.agent_id)
                const blurb = pipelineAgentBlurb(stage.agent_id, t)
                const queueHint =
                  sk === 'NOT_STARTED'
                    ? idx === 0
                      ? t('activity.agentsPipeline.stepReadyFirst')
                      : t('activity.agentsPipeline.stepQueued')
                    : null

                const activeRing =
                  sk === 'IN_PROGRESS'
                    ? 'ring-2 ring-genesis-400/70 shadow-lg shadow-genesis-500/10 dark:ring-genesis-500/50'
                    : 'ring-1 ring-surface-200/80 dark:ring-surface-700/80'

                return (
                  <div
                    key={stage.agent_id}
                    className={`relative overflow-hidden rounded-2xl border border-surface-200/90 bg-white/90 transition-all dark:border-surface-700/90 dark:bg-surface-900/80 ${activeRing} ${
                      canDrill
                        ? 'cursor-pointer hover:border-genesis-300/90 hover:bg-genesis-50/40 dark:hover:border-genesis-600/60 dark:hover:bg-genesis-950/25'
                        : ''
                    }`}
                    onClick={() => {
                      if (canDrill) openDrill(stage)
                    }}
                    onKeyDown={(e) => {
                      if (canDrill && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        openDrill(stage)
                      }
                    }}
                    role={canDrill ? 'button' : undefined}
                    tabIndex={canDrill ? 0 : undefined}
                  >
                    <div
                      className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${pres.gradient}`}
                      aria-hidden
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 gap-3">
                          <div
                            className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${pres.gradient} shadow-lg shadow-black/10 ring-2 ring-white/50 dark:ring-surface-900/60`}
                          >
                            <img
                              src={`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(pres.avatar)}&backgroundColor=transparent&size=40`}
                              alt=""
                              className="h-9 w-9"
                            />
                            <span className="absolute -bottom-1.5 -end-1 flex h-6 min-w-6 items-center justify-center rounded-full border border-white bg-surface-900 px-1 text-[10px] font-bold text-white shadow-sm dark:border-surface-700 dark:bg-surface-100 dark:text-surface-900">
                              {stage.phase ?? idx + 1}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <p className="text-sm font-bold leading-snug text-surface-900 dark:text-surface-50">{name}</p>
                            {agentRoleLabel ? (
                              <p className="mt-0.5 text-[11px] font-semibold text-genesis-700 dark:text-genesis-300">
                                {agentRoleLabel}
                              </p>
                            ) : null}
                            {blurb ? (
                              <p className="mt-1.5 text-xs leading-relaxed text-surface-600 dark:text-surface-300">{blurb}</p>
                            ) : null}
                          </div>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ring-inset ${ui.pill}`}
                        >
                          <StatusIcon className={`h-3.5 w-3.5 ${sk === 'IN_PROGRESS' ? 'animate-spin' : ''}`} />
                          {statusLabel}
                        </span>
                      </div>

                      <StageMiniProgress status={stage.status} t={t} queueHint={queueHint} />

                      <dl className="mt-3 grid gap-1 border-t border-surface-100 pt-3 text-[11px] dark:border-surface-800">
                        <div className="flex justify-between gap-2">
                          <dt className="text-surface-500">{t('activity.agentsPipeline.started')}</dt>
                          <dd className="font-medium text-surface-800 dark:text-surface-200">{formatIso(stage.started_at, locale)}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-surface-500">{t('activity.agentsPipeline.finished')}</dt>
                          <dd className="font-medium text-surface-800 dark:text-surface-200">{formatIso(stage.completed_at, locale)}</dd>
                        </div>
                      </dl>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        {canDrill ? (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-genesis-600 dark:text-genesis-400">
                            {t('activity.agentsPipeline.viewDetails')}
                            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                          </span>
                        ) : (
                          <span className="text-[11px] text-surface-400">{t('activity.agentsPipeline.noDrilldown')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {data && stages.length === 0 ? (
          <div className="px-5 py-6 text-center text-sm text-surface-500">{t('activity.agentsPipeline.noStages')}</div>
        ) : null}
      </div>

      <AgentDrilldownModal
        open={drill.open}
        onClose={closeDrill}
        businessId={businessId}
        agentId={drill.agentId}
        displayLabel={drill.label}
        t={t}
      />
    </>
  )
}
