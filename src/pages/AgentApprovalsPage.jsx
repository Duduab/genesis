import { useMemo, useState } from 'react'
import { ClipboardCheck, Loader2, X } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useActiveBusiness } from '../context/ActiveBusinessContext'
import { usePendingAgentApprovalsQuery } from '../hooks/usePendingAgentApprovalsQuery'
import { useAgentApprovalDetailQuery } from '../hooks/useAgentApprovalDetailQuery'
import { useAgentApprovalDecideMutation } from '../hooks/useAgentApprovalDecideMutation'
import { isGenesisApiError } from '../api/genesis/errors'

function safeJson(value) {
  try {
    return JSON.stringify(value ?? null, null, 2)
  } catch {
    return String(value)
  }
}

function rowTitle(row, locale) {
  if (row.title?.trim()) return row.title.trim()
  if (locale === 'he' && row.display_name?.trim()) return row.display_name.trim()
  return row.summary?.trim() || row.action_type || row.stage_id
}

export default function AgentApprovalsPage() {
  const { t, locale } = useI18n()
  const { enterBusiness } = useActiveBusiness()
  const { data, isPending, isError, error } = usePendingAgentApprovalsQuery()
  const [selectedStageId, setSelectedStageId] = useState(null)
  const [notes, setNotes] = useState('')

  const items = data?.items ?? []

  const detailQ = useAgentApprovalDetailQuery(selectedStageId, {
    enabled: Boolean(selectedStageId),
  })
  const decideM = useAgentApprovalDecideMutation(selectedStageId)

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const ta = new Date(a.created_at || 0).getTime()
      const tb = new Date(b.created_at || 0).getTime()
      return tb - ta
    })
  }, [items])

  const closeModal = () => {
    setSelectedStageId(null)
    setNotes('')
    decideM.reset()
  }

  const onDecide = (decision) => {
    decideM.mutate(
      { decision, notes },
      {
        onSuccess: () => {
          closeModal()
        },
      },
    )
  }

  const listErrorKey = isError
    ? isGenesisApiError(error) && error.code === 'auth_insufficient_role'
      ? 'apiErrors.authInsufficientRole'
      : 'approvals.loadFailed'
    : null

  return (
    <div className="mx-auto max-w-4xl">
      <div className="animate-fade-in mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-200/60">
            <ClipboardCheck className="h-5 w-5 text-amber-700" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">{t('approvals.title')}</h1>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{t('approvals.subtitle')}</p>
          </div>
        </div>
      </div>

      {listErrorKey ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          {t(listErrorKey)}
        </div>
      ) : null}

      {isPending && sortedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-surface-500">
          <Loader2 className="h-10 w-10 animate-spin text-genesis-600" aria-hidden />
          <p className="text-sm font-medium">{t('approvals.loading')}</p>
        </div>
      ) : null}

      {!isPending && !listErrorKey && sortedItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50/50 px-6 py-16 text-center">
          <p className="text-sm font-semibold text-surface-700">{t('approvals.empty')}</p>
        </div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {sortedItems.map((row) => (
          <li key={row.stage_id}>
            <button
              type="button"
              onClick={() => {
                if (row.business_id) enterBusiness(row.business_id)
                setNotes('')
                decideM.reset()
                setSelectedStageId(row.stage_id)
              }}
              className="flex w-full items-start gap-3 rounded-xl border border-surface-200 bg-white px-4 py-4 text-start shadow-sm transition-colors hover:border-amber-200 hover:bg-amber-50/20 dark:border-surface-700 dark:bg-surface-900"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">{rowTitle(row, locale)}</p>
                {row.summary ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-surface-500">{row.summary}</p>
                ) : null}
                <p className="mt-2 font-mono text-[11px] text-surface-400">
                  {row.agent_id ? `${row.agent_id} · ` : ''}
                  {row.action_type || row.stage_id}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                {t('approvals.awaiting')}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {selectedStageId ? (
        <div className="fixed inset-0 z-[2147483646] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm"
            aria-label={t('approvals.close')}
            onClick={closeModal}
          />
          <div className="relative z-10 flex max-h-[min(92vh,680px)] w-full max-w-lg flex-col rounded-t-2xl border border-surface-200 bg-white shadow-xl dark:border-surface-700 dark:bg-surface-900 sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-surface-100 px-5 py-4 dark:border-surface-800">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50">{t('approvals.detailTitle')}</h2>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
                aria-label={t('approvals.close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {detailQ.isPending ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-genesis-600" aria-hidden />
                </div>
              ) : null}
              {detailQ.isError ? (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {t('approvals.detailFailed')}
                </p>
              ) : null}
              {detailQ.data ? (
                <div className="space-y-4">
                  {detailQ.data.summary || detailQ.data.title ? (
                    <p className="text-sm leading-relaxed text-surface-700 dark:text-surface-200">
                      {detailQ.data.summary || detailQ.data.title}
                    </p>
                  ) : null}
                  <div>
                    <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                      {t('approvals.contextJson')}
                    </h3>
                    <pre className="max-h-52 overflow-auto rounded-lg border border-surface-200 bg-surface-50 p-3 font-mono text-[11px] text-surface-800 dark:border-surface-600 dark:bg-surface-950 dark:text-surface-100">
                      {safeJson(
                        detailQ.data.context ??
                          detailQ.data.options ??
                          detailQ.data.terms ??
                          detailQ.data.pricing ??
                          detailQ.data.recommendation ??
                          detailQ.data,
                      )}
                    </pre>
                  </div>
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                      {t('approvals.notesOptional')}
                    </span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="mt-1.5 w-full resize-none rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-800 outline-none focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-100"
                      placeholder={t('approvals.notesPlaceholder')}
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-surface-100 px-5 py-4 sm:flex-row sm:justify-end dark:border-surface-800">
              {decideM.isError ? (
                <p className="me-auto text-sm text-red-600 sm:col-span-full" role="alert">
                  {t('approvals.decideFailed')}
                </p>
              ) : null}
              <button
                type="button"
                disabled={decideM.isPending || detailQ.isPending}
                onClick={() => onDecide('REJECTED')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
              >
                {decideM.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {t('approvals.reject')}
              </button>
              <button
                type="button"
                disabled={decideM.isPending || detailQ.isPending}
                onClick={() => onDecide('APPROVED')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {decideM.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {decideM.isPending ? t('approvals.submitting') : t('approvals.approve')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
