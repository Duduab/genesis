import { useEffect, useMemo, useState } from 'react'
import { X, Loader2, Bug, RefreshCw } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useStageDetailQuery } from '../hooks/useStageDetailQuery'
import { useStageLogsQuery } from '../hooks/useStageLogsQuery'
import { useStageRetryMutation } from '../hooks/useStageRetryMutation'
import GenesisStageStatusBadge from './GenesisStageStatusBadge'
import { normalizeGenesisStageStatus } from '../constants/genesisApiEnums'
import { formatNisFull } from '../utils/formatNis'
import { isGenesisApiError } from '../api/genesis/errors'

function safeJson(value) {
  try {
    return JSON.stringify(value ?? null, null, 2)
  } catch {
    return String(value)
  }
}

function formatWhen(iso, locale) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const tag = locale === 'he' ? 'he-IL' : 'en-US'
  return d.toLocaleString(tag, { dateStyle: 'medium', timeStyle: 'short' })
}

export default function StageDetailModal({ open, stageId, businessId, onClose }) {
  const { t, locale } = useI18n()
  const [tab, setTab] = useState('detail')
  const detailQ = useStageDetailQuery(stageId, { enabled: open && Boolean(stageId) })
  const logsQ = useStageLogsQuery(stageId, { enabled: open && Boolean(stageId) && tab === 'debug' })
  const retryM = useStageRetryMutation(stageId, { businessId })

  const d = detailQ.data

  const displayTitle = useMemo(() => {
    if (!d) return ''
    return locale === 'he' ? (d.display_name || '') : (d.display_name_en || d.display_name || '')
  }, [d, locale])

  const canRetry = normalizeGenesisStageStatus(d?.status) === 'FAILED'

  useEffect(() => {
    if (!open) setTab('detail')
  }, [open])

  const detailErrorKey = useMemo(() => {
    if (!detailQ.isError) return null
    const e = detailQ.error
    if (isGenesisApiError(e) && e.code === 'stage_not_found') return 'apiErrors.stageNotFound'
    return 'dashboard.stages.loadDetailFailed'
  }, [detailQ.isError, detailQ.error])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm"
        aria-label={t('dashboard.stages.close')}
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-2xl flex-col rounded-t-2xl border border-surface-200 bg-white shadow-xl sm:rounded-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-surface-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-surface-900">{displayTitle || t('dashboard.stages.detailTitle')}</h2>
            {d?.action_type ? (
              <p className="mt-0.5 font-mono text-xs text-surface-500">{d.action_type}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-800"
            aria-label={t('dashboard.stages.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex shrink-0 gap-1 border-b border-surface-100 px-5 py-2">
          <button
            type="button"
            onClick={() => setTab('detail')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === 'detail' ? 'bg-genesis-100 text-genesis-800' : 'text-surface-500 hover:bg-surface-50'
            }`}
          >
            {t('dashboard.stages.detailTab')}
          </button>
          <button
            type="button"
            onClick={() => setTab('debug')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === 'debug' ? 'bg-genesis-100 text-genesis-800' : 'text-surface-500 hover:bg-surface-50'
            }`}
          >
            <Bug className="h-3.5 w-3.5" aria-hidden />
            {t('dashboard.stages.debugTab')}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {tab === 'detail' ? (
            <>
              {detailQ.isPending ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-surface-500">
                  <Loader2 className="h-8 w-8 animate-spin text-genesis-600" aria-hidden />
                  <p className="text-sm">{t('dashboard.stages.loadingDetail')}</p>
                </div>
              ) : null}
              {detailErrorKey ? (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {t(detailErrorKey)}
                </p>
              ) : null}
              {d && !detailQ.isPending ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <GenesisStageStatusBadge status={d.status} />
                    {canRetry ? (
                      <button
                        type="button"
                        disabled={retryM.isPending}
                        onClick={() => retryM.mutate()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 transition-colors hover:bg-red-100 disabled:opacity-50"
                      >
                        {retryM.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                        )}
                        {t('dashboard.stages.retry')}
                      </button>
                    ) : null}
                  </div>
                  {retryM.isError ? (
                    <p className="text-sm text-red-600" role="alert">
                      {t('dashboard.stages.retryFailed')}
                    </p>
                  ) : null}

                  <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                        {t('dashboard.stages.agent')}
                      </dt>
                      <dd className="mt-0.5 font-mono text-surface-800">{d.agent_id || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                        {t('dashboard.stages.timing')}
                      </dt>
                      <dd className="mt-0.5 text-surface-700">
                        <div>
                          {t('dashboard.stages.started')}:{' '}
                          {formatWhen(d.started_at ?? d.created_at, locale)}
                        </div>
                        <div>
                          {t('dashboard.stages.ended')}: {formatWhen(d.ended_at ?? d.completed_at, locale)}
                        </div>
                      </dd>
                    </div>
                    {typeof d.allocated_budget_ils === 'number' || typeof d.actual_cost_ils === 'number' ? (
                      <div className="sm:col-span-2">
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                          {t('dashboard.stages.budget')}
                        </dt>
                        <dd className="mt-0.5 text-surface-700">
                          {typeof d.allocated_budget_ils === 'number'
                            ? `${t('dashboard.stages.allocated')}: ${formatNisFull(d.allocated_budget_ils, locale)}`
                            : null}
                          {typeof d.allocated_budget_ils === 'number' && typeof d.actual_cost_ils === 'number'
                            ? ' · '
                            : ''}
                          {typeof d.actual_cost_ils === 'number'
                            ? `${t('dashboard.stages.actual')}: ${formatNisFull(d.actual_cost_ils, locale)}`
                            : null}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  {d.description ? <p className="text-sm text-surface-600">{d.description}</p> : null}
                  {d.error_message ? (
                    <p className="rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 text-sm text-red-900">{d.error_message}</p>
                  ) : null}

                  <div>
                    <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                      {t('dashboard.stages.inputs')}
                    </h3>
                    <pre className="max-h-40 overflow-auto rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-[11px] text-surface-800">
                      {safeJson(d.inputs ?? null)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                      {t('dashboard.stages.outputs')}
                    </h3>
                    <pre className="max-h-48 overflow-auto rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-[11px] text-surface-800">
                      {safeJson(d.outputs ?? d.response_payload ?? null)}
                    </pre>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <>
              {logsQ.isPending ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-surface-500">
                  <Loader2 className="h-8 w-8 animate-spin text-genesis-600" aria-hidden />
                  <p className="text-sm">{t('dashboard.stages.loadingLogs')}</p>
                </div>
              ) : null}
              {logsQ.isError ? (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {t('dashboard.stages.loadLogsFailed')}
                </p>
              ) : null}
              {logsQ.data != null && !logsQ.isPending ? (
                <pre className="max-h-[min(55vh,480px)] overflow-auto rounded-lg border border-surface-200 bg-surface-900 p-3 font-mono text-[11px] text-emerald-100/95">
                  {safeJson(logsQ.data)}
                </pre>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
