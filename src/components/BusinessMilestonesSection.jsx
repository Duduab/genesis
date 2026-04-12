import { useMemo } from 'react'
import { CheckCircle2, CircleDashed, Flag, Loader2 } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useActiveBusiness } from '../context/ActiveBusinessContext'
import { useBusinessMilestones } from '../hooks/useBusinessMilestones'
import { loadPersistedGenesisBusinesses } from '../dashboard/genesisBusinessStorage'
import { getAgentPresentation } from '../config/agentPresentation'

function formatCompletedDate(iso, locale) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const tag = locale === 'he' ? 'he-IL' : 'en-US'
  return d.toLocaleDateString(tag, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BusinessMilestonesSection() {
  const { t, locale } = useI18n()
  const { activeBusinessId } = useActiveBusiness()

  const businessId = useMemo(() => {
    const list = loadPersistedGenesisBusinesses()
    return activeBusinessId?.trim() || list[0]?.businessId || null
  }, [activeBusinessId])

  const { milestones, loading, error } = useBusinessMilestones(businessId)

  const doneCount = milestones.filter((m) => m.completed).length
  const total = milestones.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  if (!businessId) {
    return (
      <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50/50 p-8 text-center">
        <Flag className="mx-auto h-8 w-8 text-surface-400" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-surface-700">{t('dashboard.milestones.noBusiness')}</p>
      </div>
    )
  }

  return (
    <section className="rounded-xl border border-surface-200 bg-white shadow-sm">
      <div className="border-b border-surface-100 px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-genesis-50 ring-1 ring-genesis-200/60">
              <Flag className="h-5 w-5 text-genesis-600" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-bold text-surface-900 dark:text-surface-50">{t('dashboard.milestones.sectionTitle')}</h2>
              <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{t('dashboard.milestones.sectionSubtitle')}</p>
            </div>
          </div>
          {!loading && total > 0 ? (
            <div className="shrink-0 text-end">
              <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                {t('dashboard.milestones.progress')
                  .replaceAll('{{done}}', String(doneCount))
                  .replaceAll('{{total}}', String(total))}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-genesis-600">{pct}%</p>
            </div>
          ) : null}
        </div>

        {!loading && total > 0 ? (
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-genesis-600 to-cyan-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        ) : null}
      </div>

      <div className="px-6 py-4">
        {error ? (
          <p className="text-sm font-medium text-amber-800" role="alert">
            {t(error)}
          </p>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-surface-500">
            <Loader2 className="h-6 w-6 animate-spin text-genesis-600" aria-hidden />
            <span className="text-sm font-medium">{t('dashboard.milestones.loading')}</span>
          </div>
        ) : null}

        {!loading && !error && milestones.length === 0 ? (
          <p className="py-8 text-center text-sm text-surface-500">{t('dashboard.milestones.empty')}</p>
        ) : null}

        {!loading && milestones.length > 0 ? (
          <ul className="divide-y divide-surface-100">
            {milestones.map((m, i) => {
              const agent = getAgentPresentation(m.agent_id)
              const agentLabel = agent.tKey ? t(agent.tKey) : agent.label
              const dateStr = m.completed && m.completed_at ? formatCompletedDate(m.completed_at, locale) : ''
              return (
                <li key={`${m.agent_id}-${i}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex shrink-0 flex-col items-center pt-0.5">
                    {m.completed ? (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 ring-2 ring-emerald-200/80">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
                      </span>
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-100 ring-2 ring-surface-200/80">
                        <CircleDashed className="h-5 w-5 text-surface-400" aria-hidden />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-surface-900">{m.name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          m.completed ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60' : 'bg-surface-100 text-surface-500 ring-1 ring-surface-200/60'
                        }`}
                      >
                        {m.completed ? t('dashboard.milestones.done') : t('dashboard.milestones.todo')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-surface-600">{m.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-surface-500">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md bg-gradient-to-br px-2 py-0.5 font-medium text-white shadow-sm ${agent.gradient}`}
                      >
                        <img
                          src={`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(agent.avatar)}&backgroundColor=transparent&size=14`}
                          alt=""
                          className="h-3.5 w-3.5"
                        />
                        {agentLabel}
                      </span>
                      {m.completed && dateStr ? (
                        <span className="text-surface-400">
                          {t('dashboard.milestones.completedOn').replaceAll('{{date}}', dateStr)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
