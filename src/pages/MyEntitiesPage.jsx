import { useState } from 'react'
import {
  Building2,
  Search,
  SlidersHorizontal,
  Plus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Bot,
  MoreHorizontal,
  Wallet,
  Flame,
  Loader2,
  Trash2,
  PenLine,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useMyEntitiesFromApi } from '../hooks/useMyEntitiesFromApi'
import { useRouter } from '../router'
import { useActiveBusiness } from '../context/ActiveBusinessContext'
import { cancelGenesisBusiness } from '../api/genesis/businessesApi'
import { loadPersistedGenesisBusinesses, removePersistedGenesisBusiness } from '../dashboard/genesisBusinessStorage'
import EditBusinessModal from '../components/EditBusinessModal'

const statusStyles = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20', dot: 'bg-emerald-500' },
  pendingVat: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20', dot: 'bg-amber-500' },
  underReview: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-600/20', dot: 'bg-blue-500' },
  hibernating: { bg: 'bg-surface-100', text: 'text-surface-500', ring: 'ring-surface-400/20', dot: 'bg-surface-400' },
}

const typeMap = {
  privateCompany: 'entities.typePrivateCompany',
  llc: 'entities.typeLLC',
  corporation: 'entities.typeCorporation',
}

const statusMap = {
  active: 'entities.statusActive',
  pendingVat: 'entities.statusPendingVat',
  underReview: 'entities.statusUnderReview',
  hibernating: 'entities.statusHibernating',
}

const agentAvatars = [
  { name: 'GovReg', color: 'from-genesis-600 to-genesis-400', seed: 'GovReg' },
  { name: 'TaxFin', color: 'from-amber-600 to-orange-400', seed: 'TaxFin' },
  { name: 'OpsHR', color: 'from-blue-600 to-cyan-400', seed: 'OpsHR' },
]

function resolveEditInitials(entity) {
  const row = loadPersistedGenesisBusinesses().find((b) => b.businessId === entity.key)
  let hp = ''
  let company = entity.name
  if (row) {
    hp = (row.api.hp_number || '').trim()
    company = (row.api.company_name || '').trim() || entity.name
  }
  if (!hp && entity.legalIdDisplay) {
    const m = entity.legalIdDisplay.match(/HP\s+(\d+)/i)
    if (m) hp = m[1]
  }
  return {
    businessId: entity.key,
    initialCompanyName: company,
    initialHpNumber: hp,
  }
}

function EntityCard({ entity, t, onManageBusiness, onEditBusiness, onDeleteBusiness, isWorkspaceActive, deleteBusy }) {
  const s = statusStyles[entity.status]
  const BalanceIcon = entity.balanceTrend === 'up' ? TrendingUp : TrendingDown
  const BurnIcon = entity.burnTrend === 'up' ? TrendingUp : TrendingDown

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:border-genesis-200 hover:shadow-lg ${
        isWorkspaceActive ? 'border-genesis-400 ring-2 ring-genesis-200' : 'border-surface-200'
      }`}
    >
      <div className="flex items-start justify-between p-5 pb-0">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-genesis-50 ring-1 ring-genesis-200/60">
            <Building2 className="h-5 w-5 text-genesis-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold leading-snug text-surface-900">{entity.name}</h3>
            <p className="mt-0.5 font-mono text-xs text-surface-400">
              {t('entities.id')}: {entity.legalIdDisplay}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${s.bg} ${s.text} ${s.ring}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {t(statusMap[entity.status])}
          </span>
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-surface-400 opacity-0 transition-all hover:bg-surface-100 hover:text-surface-600 group-hover:opacity-100">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-1 flex items-center gap-2 px-5">
        <span className="text-[11px] text-surface-400">{t(typeMap[entity.entityType])}</span>
        <span className="text-surface-300">·</span>
        <span className="text-[11px] text-surface-400">
          {t('entities.since')} {entity.registeredLabel}
        </span>
      </div>

      <div className="mx-5 mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface-50 p-3">
          <div className="flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-surface-400" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-surface-400">
              {t('entities.balance')}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-base font-bold text-surface-900">{entity.balanceLabel}</span>
            <BalanceIcon
              className={`h-3.5 w-3.5 ${entity.balanceTrend === 'up' ? 'text-emerald-500' : 'text-red-400'}`}
            />
          </div>
        </div>
        <div className="rounded-lg bg-surface-50 p-3">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-surface-400" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-surface-400">
              {t('entities.burnRate')}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-base font-bold text-surface-900">{entity.burnRateLabel}</span>
            <BurnIcon
              className={`h-3.5 w-3.5 ${entity.burnTrend === 'down' ? 'text-emerald-500' : 'text-red-400'}`}
            />
          </div>
        </div>
      </div>

      <div className="mx-5 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-3.5 w-3.5 text-surface-400" />
          <span className="text-[11px] font-medium text-surface-500">{t('entities.activeAgents')}</span>
        </div>
        {entity.agentAvatarIndices.length > 0 ? (
          <div className="flex -space-x-2">
            {entity.agentAvatarIndices.map((agentIdx) => {
              const agent = agentAvatars[agentIdx]
              return (
                <div
                  key={`${entity.key}-${agent.seed}`}
                  title={`${agent.name}-Agent`}
                  className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${agent.color} ring-2 ring-white`}
                >
                  <img
                    src={`https://api.dicebear.com/9.x/bottts/svg?seed=${agent.seed}&backgroundColor=transparent&size=20`}
                    alt={agent.name}
                    className="h-4 w-4"
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <span className="text-[11px] italic text-surface-400">{t('entities.noneAssigned')}</span>
        )}
      </div>

      <div className="mt-auto mt-4 space-y-2 border-t border-surface-100 px-5 py-3.5">
        <button
          type="button"
          onClick={() => onManageBusiness?.(entity)}
          className="group/btn flex w-full items-center justify-center gap-2 rounded-lg border border-genesis-200 bg-genesis-50/50 px-4 py-2 text-xs font-semibold text-genesis-700 transition-all hover:bg-genesis-100 hover:shadow-sm active:scale-[0.98]"
        >
          {t('entities.manageEntity')}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
        <button
          type="button"
          onClick={() => onEditBusiness?.(entity)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-surface-200 bg-white px-4 py-2 text-xs font-semibold text-surface-700 transition-all hover:border-genesis-300 hover:bg-genesis-50/40 hover:shadow-sm active:scale-[0.98]"
        >
          <PenLine className="h-3.5 w-3.5 text-surface-500" aria-hidden />
          {t('entities.editBusiness')}
        </button>
        <button
          type="button"
          disabled={deleteBusy}
          onClick={() => onDeleteBusiness?.(entity)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-4 py-2 text-xs font-semibold text-red-700 transition-all hover:bg-red-100 hover:shadow-sm active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {deleteBusy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          )}
          {t('entities.deleteBusiness')}
        </button>
      </div>
    </div>
  )
}

function CreateEntityCard({ onClick, t }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[340px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-300 bg-white/50 p-8 transition-all hover:border-genesis-400 hover:bg-genesis-50/30 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-surface-300 transition-all group-hover:border-genesis-400 group-hover:bg-genesis-100">
        <Plus className="h-7 w-7 text-surface-400 transition-colors group-hover:text-genesis-600" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-surface-600 transition-colors group-hover:text-genesis-700">
        {t('entities.createNew')}
      </h3>
      <p className="mt-1 text-xs text-surface-400 transition-colors group-hover:text-genesis-500">
        {t('entities.createNewSub')}
      </p>
    </button>
  )
}

export default function MyEntitiesPage({ onOpenChat, onAddBusiness }) {
  const { t, locale } = useI18n()
  const { navigate } = useRouter()
  const { enterBusiness, activeBusinessId, clearActiveBusiness } = useActiveBusiness()
  const { rows: entities, loading, error, refetch } = useMyEntitiesFromApi(locale)
  const [confirmCancel, setConfirmCancel] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [editBusiness, setEditBusiness] = useState(null)

  const handleManageBusiness = (entity) => {
    enterBusiness(entity.key)
    navigate('/dashboard')
  }

  const openEditModal = (entity) => {
    setEditBusiness(resolveEditInitials(entity))
  }

  const closeEditModal = () => setEditBusiness(null)

  const openCancelDialog = (entity) => {
    setCancelError(null)
    setConfirmCancel({ key: entity.key, name: entity.name })
  }

  const closeCancelDialog = () => {
    if (cancelLoading) return
    setConfirmCancel(null)
    setCancelError(null)
  }

  const confirmServerCancel = async () => {
    if (!confirmCancel) return
    setCancelLoading(true)
    setCancelError(null)
    setDeletingId(confirmCancel.key)
    try {
      await cancelGenesisBusiness(confirmCancel.key)
      removePersistedGenesisBusiness(confirmCancel.key)
      if (activeBusinessId === confirmCancel.key) clearActiveBusiness()
      await refetch()
      setConfirmCancel(null)
    } catch {
      setCancelError(t('entities.cancelBusinessFailed'))
    } finally {
      setCancelLoading(false)
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="animate-fade-in flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t('entities.title')}</h1>
          <p className="mt-1 text-sm text-surface-500">
            {loading ? t('entities.loadingFromApi') : `${entities.length} ${t('entities.registered')}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder={t('entities.searchPlaceholder')}
              className="h-9 w-56 rounded-lg border border-surface-200 bg-white ps-9 pe-3 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100"
            />
          </div>
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 text-xs font-medium text-surface-600 transition-colors hover:bg-surface-50"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t('entities.filters')}
          </button>
        </div>
      </div>

      {error ? (
        <div
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          {t(error)}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { tKey: 'entities.totalEntities', value: loading ? '—' : entities.length, color: 'text-genesis-600' },
          {
            tKey: 'entities.statusActive',
            value: loading ? '—' : entities.filter((e) => e.status === 'active').length,
            color: 'text-emerald-600',
          },
          {
            tKey: 'entities.pending',
            value: loading
              ? '—'
              : entities.filter((e) => e.status === 'pendingVat' || e.status === 'underReview').length,
            color: 'text-amber-600',
          },
          {
            tKey: 'entities.statusHibernating',
            value: loading ? '—' : entities.filter((e) => e.status === 'hibernating').length,
            color: 'text-surface-500',
          },
        ].map((stat) => (
          <div key={stat.tKey} className="rounded-lg border border-surface-200 bg-white px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-surface-400">{t(stat.tKey)}</p>
            <p className={`mt-1 text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading && entities.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 py-20 text-surface-500">
            <Loader2 className="h-10 w-10 animate-spin text-genesis-600" aria-hidden />
            <p className="text-sm font-medium">{t('entities.loadingFromApi')}</p>
          </div>
        ) : (
          <>
            {entities.map((entity, i) => (
              <div key={entity.key} className="animate-slide-up-fade" style={{ animationDelay: `${i * 75}ms` }}>
                <EntityCard
                  entity={entity}
                  t={t}
                  onManageBusiness={handleManageBusiness}
                  onEditBusiness={openEditModal}
                  onDeleteBusiness={openCancelDialog}
                  isWorkspaceActive={activeBusinessId === entity.key}
                  deleteBusy={deletingId === entity.key}
                />
              </div>
            ))}
            <div className="animate-slide-up-fade" style={{ animationDelay: `${entities.length * 75}ms` }}>
              <CreateEntityCard onClick={onAddBusiness ?? onOpenChat} t={t} />
            </div>
          </>
        )}
      </div>

      <EditBusinessModal
        open={Boolean(editBusiness)}
        onClose={closeEditModal}
        onSaved={refetch}
        businessId={editBusiness?.businessId ?? ''}
        initialCompanyName={editBusiness?.initialCompanyName ?? ''}
        initialHpNumber={editBusiness?.initialHpNumber ?? ''}
      />

      {confirmCancel ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-business-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm"
            aria-label={t('entities.dialogGoBack')}
            onClick={closeCancelDialog}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-surface-200 bg-white p-6 shadow-xl">
            <h2 id="cancel-business-title" className="text-lg font-bold text-surface-900">
              {t('entities.cancelBusinessConfirmTitle')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-surface-600">
              {t('entities.cancelBusinessConfirmBody').replaceAll('{{name}}', confirmCancel.name)}
            </p>
            {cancelError ? (
              <p className="mt-3 text-sm font-medium text-red-600" role="alert">
                {cancelError}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={cancelLoading}
                onClick={closeCancelDialog}
                className="rounded-lg border border-surface-200 bg-white px-4 py-2.5 text-sm font-semibold text-surface-700 transition-colors hover:bg-surface-50 disabled:opacity-50"
              >
                {t('entities.dialogGoBack')}
              </button>
              <button
                type="button"
                disabled={cancelLoading}
                onClick={confirmServerCancel}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {t('entities.cancelBusinessInProgress')}
                  </>
                ) : (
                  t('entities.confirmCancelBusiness')
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
