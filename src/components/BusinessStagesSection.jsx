import { useMemo, useState } from 'react'
import { Layers, Loader2 } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useActiveBusiness } from '../context/ActiveBusinessContext'
import { useBusinessStagesQuery } from '../hooks/useBusinessStagesQuery'
import { loadPersistedGenesisBusinesses } from '../dashboard/genesisBusinessStorage'
import GenesisStageStatusBadge from './GenesisStageStatusBadge'
import StageDetailModal from './StageDetailModal'

export default function BusinessStagesSection() {
  const { t, locale } = useI18n()
  const { activeBusinessId } = useActiveBusiness()
  const [openStageId, setOpenStageId] = useState(null)

  const businessId = useMemo(() => {
    const list = loadPersistedGenesisBusinesses()
    return activeBusinessId?.trim() || list[0]?.businessId || null
  }, [activeBusinessId])

  const { stages, loading, error } = useBusinessStagesQuery(businessId)

  const sorted = useMemo(() => {
    return [...stages].sort((a, b) => (a.phase ?? 0) - (b.phase ?? 0))
  }, [stages])

  const stageLabel = (row) => (locale === 'he' ? row.display_name : row.display_name_en || row.display_name)

  if (!businessId) {
    return (
      <section className="rounded-xl border border-dashed border-surface-300 bg-surface-50/50 p-8 text-center">
        <Layers className="mx-auto h-8 w-8 text-surface-400" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-surface-700">{t('dashboard.stages.noBusiness')}</p>
      </section>
    )
  }

  return (
    <>
      <section className="rounded-xl border border-surface-200 bg-white shadow-sm">
        <div className="border-b border-surface-100 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-genesis-50 ring-1 ring-genesis-200/60">
              <Layers className="h-5 w-5 text-genesis-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-surface-900 dark:text-surface-50">{t('dashboard.stages.sectionTitle')}</h2>
              <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{t('dashboard.stages.sectionSubtitle')}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          {error ? (
            <p className="text-sm font-medium text-amber-800" role="alert">
              {t(error)}
            </p>
          ) : null}
          {loading && sorted.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-12 text-surface-500">
              <Loader2 className="h-6 w-6 animate-spin text-genesis-600" aria-hidden />
              <span className="text-sm">{t('dashboard.stages.loading')}</span>
            </div>
          ) : null}
          {!loading && sorted.length === 0 ? (
            <p className="py-8 text-center text-sm text-surface-500">{t('dashboard.stages.empty')}</p>
          ) : null}

          <ul className="flex flex-col gap-2">
            {sorted.map((row) => (
              <li key={row.stage_id}>
                <button
                  type="button"
                  onClick={() => setOpenStageId(row.stage_id)}
                  className="flex w-full items-start gap-3 rounded-xl border border-surface-200 bg-surface-50/40 px-4 py-3 text-start transition-colors hover:border-genesis-200 hover:bg-genesis-50/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-surface-900">{stageLabel(row)}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-surface-500">
                      {row.agent_id} · {row.action_type}
                    </p>
                  </div>
                  <GenesisStageStatusBadge status={row.status} className="shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StageDetailModal
        open={Boolean(openStageId)}
        stageId={openStageId}
        businessId={businessId}
        onClose={() => setOpenStageId(null)}
      />
    </>
  )
}
