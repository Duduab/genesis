import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  Loader2,
  UsersRound,
  ArrowRight,
  Plus,
  AlertCircle,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useRouter } from '../router'
import { ORGANIZATIONS_QUERY_KEY, useOrganizationsQuery } from '../hooks/useOrganizationsQuery'
import { postCreateOrganization } from '../api/genesis/organizationsApi'
import { isGenesisApiError } from '../api/genesis/errors'
import { useActiveOrganization } from '../context/ActiveOrganizationContext'
import { roleStringToDisplayBucket } from '../auth/firebaseRoles'
import ViewModeToggle from '../components/ViewModeToggle'
import { usePersistedViewMode } from '../hooks/usePersistedViewMode'

function orgTypeLabelKey(organization_type) {
  const x = String(organization_type || '').toLowerCase()
  if (x === 'chain') return 'organizations.type.chain'
  if (x === 'franchise') return 'organizations.type.franchise'
  return 'organizations.type.workspace'
}

function AddOrganizationPanel() {
  const { t } = useI18n()
  const qc = useQueryClient()
  const { setActiveOrganizationId } = useActiveOrganization()
  const [name, setName] = useState('')
  const [organizationType, setOrganizationType] = useState('workspace')

  const createMutation = useMutation({
    mutationFn: () =>
      postCreateOrganization({
        name,
        organization_type:
          organizationType === 'chain' ? 'chain' : organizationType === 'franchise' ? 'franchise' : 'workspace',
      }),
    onSuccess: async (data) => {
      setName('')
      if (data?.organization_id) setActiveOrganizationId(data.organization_id)
      await qc.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY })
    },
  })

  const submitError =
    createMutation.error != null
      ? isGenesisApiError(createMutation.error)
        ? createMutation.error.userFacingMessage(t('organizations.add.createFailed'), t)
        : t('organizations.add.createFailed')
      : null

  const canSubmit = name.trim().length > 0 && !createMutation.isPending

  return (
    <div className="mt-8 rounded-xl border border-genesis-200/80 bg-gradient-to-br from-genesis-50/90 to-white p-5 shadow-sm ring-1 ring-genesis-100">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-genesis-200/60">
            <Plus className="h-5 w-5 text-genesis-600" aria-hidden />
          </div>
          <div>
            <h2 className="text-sm font-bold text-surface-900">{t('organizations.add.title')}</h2>
            <p className="mt-0.5 text-xs text-surface-500">{t('organizations.add.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block min-w-0">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-surface-400">
            {t('organizations.add.nameLabel')}
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('organizations.add.namePlaceholder')}
            className="h-10 w-full rounded-lg border border-surface-200 bg-white px-3 text-sm text-surface-800 outline-none placeholder:text-surface-400 focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100"
          />
        </label>
        <label className="block min-w-[11rem]">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-surface-400">
            {t('organizations.add.typeLabel')}
          </span>
          <select
            value={organizationType}
            onChange={(e) => setOrganizationType(e.target.value)}
            className="h-10 w-full rounded-lg border border-surface-200 bg-white px-3 text-sm font-medium text-surface-800 outline-none focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100"
          >
            <option value="workspace">{t('organizations.type.workspace')}</option>
            <option value="chain">{t('organizations.type.chain')}</option>
            <option value="franchise">{t('organizations.type.franchise')}</option>
          </select>
        </label>
      </div>

      {submitError ? (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{submitError}</span>
        </div>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => createMutation.mutate()}
          className="btn-authora-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Plus className="h-4 w-4" aria-hidden />
          )}
          {t('organizations.add.submit')}
        </button>
      </div>
    </div>
  )
}

function OrganizationCard({ org, t, onManage }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm transition-all hover:border-genesis-200 hover:shadow-md">
      <div className="flex items-start gap-3 border-b border-surface-100 px-5 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-genesis-50 ring-1 ring-genesis-200/60">
          <Building2 className="h-5 w-5 text-genesis-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-bold leading-snug text-surface-900">{org.name}</h2>
          <p className="mt-1 text-[11px] text-surface-400">{t(orgTypeLabelKey(org.organization_type))}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-5 py-4 text-sm text-surface-600">
        <div className="flex items-center gap-2">
          <UsersRound className="h-4 w-4 text-surface-400" aria-hidden />
          <span>
            {t('organizations.card.yourRole')}:{' '}
            <strong className="text-surface-800">
              {t(roleStringToDisplayBucket(org.role) === 'admin' ? 'roles.admin' : 'roles.user')}
            </strong>
          </span>
        </div>
        <div className="text-xs text-surface-500">
          {t('organizations.card.members')}:{' '}
          <span className="font-semibold text-surface-800">
            {org.member_count != null ? String(org.member_count) : '—'}
          </span>
        </div>
      </div>
      <div className="border-t border-surface-100 px-5 py-3">
        <button
          type="button"
          onClick={onManage}
          className="group/btn flex w-full items-center justify-center gap-2 rounded-lg border border-genesis-200 bg-genesis-50/50 px-4 py-2 text-xs font-semibold text-genesis-700 transition-all hover:bg-genesis-100 hover:shadow-sm active:scale-[0.98]"
        >
          {t('organizations.card.manage')}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}

function OrganizationListRow({ org, t, onManage }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-surface-200 bg-white px-4 py-4 shadow-sm transition-all hover:border-genesis-200 hover:shadow-md sm:flex-row sm:items-center sm:gap-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-genesis-50 ring-1 ring-genesis-200/60">
          <Building2 className="h-5 w-5 text-genesis-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-surface-900">{org.name}</h2>
          <p className="mt-0.5 text-[11px] text-surface-400">{t(orgTypeLabelKey(org.organization_type))}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-surface-600">
        <div className="flex items-center gap-2">
          <UsersRound className="h-4 w-4 text-surface-400" aria-hidden />
          <span>
            {t('organizations.card.yourRole')}:{' '}
            <strong className="text-surface-800">
              {t(roleStringToDisplayBucket(org.role) === 'admin' ? 'roles.admin' : 'roles.user')}
            </strong>
          </span>
        </div>
        <div className="text-xs text-surface-500 sm:text-sm">
          {t('organizations.card.members')}:{' '}
          <span className="font-semibold text-surface-800">
            {org.member_count != null ? String(org.member_count) : '—'}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onManage}
        className="group/btn inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-genesis-200 bg-genesis-50/50 px-4 py-2 text-xs font-semibold text-genesis-700 transition-all hover:bg-genesis-100 sm:self-center"
      >
        {t('organizations.card.manage')}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
      </button>
    </div>
  )
}

export default function MyOrganizationsPage() {
  const { t } = useI18n()
  const { navigate } = useRouter()
  const orgsQ = useOrganizationsQuery({ enabled: true })
  const organizations = orgsQ.data ?? []
  const [viewMode, setViewMode] = usePersistedViewMode('genesis.ui.viewMode.organizations', 'cards')

  const sorted = useMemo(() => {
    // Oldest first so the org you just created appears at the end of the grid (not first).
    return [...organizations].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }, [organizations])

  const openManage = (organizationId) => {
    navigate(`/settings?tab=profile&organizationId=${encodeURIComponent(organizationId)}`)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t('organizations.page.title')}</h1>
          <p className="mt-1 text-sm text-surface-500">{t('organizations.page.subtitle')}</p>
        </div>
        {!orgsQ.isLoading && sorted.length > 0 ? (
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        ) : null}
      </div>

      <AddOrganizationPanel />

      {orgsQ.isLoading ? (
        <div className="mt-10 flex flex-col items-center justify-center gap-3 py-12 text-surface-500">
          <Loader2 className="h-10 w-10 animate-spin text-genesis-600" aria-hidden />
          <p className="text-sm font-medium">{t('organizations.page.loading')}</p>
        </div>
      ) : orgsQ.isError ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-semibold">{t('organizations.page.loadError')}</p>
            <p className="mt-1 text-xs text-red-700/90">{t('organizations.page.loadErrorHint')}</p>
          </div>
        </div>
      ) : sorted.length === 0 ? (
        <p className="mt-8 rounded-xl border border-surface-200 bg-white px-6 py-8 text-center text-sm text-surface-500">
          {t('organizations.page.empty')}
        </p>
      ) : viewMode === 'cards' ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((org) => (
            <OrganizationCard
              key={org.organization_id}
              org={org}
              t={t}
              onManage={() => openManage(org.organization_id)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {sorted.map((org) => (
            <OrganizationListRow
              key={org.organization_id}
              org={org}
              t={t}
              onManage={() => openManage(org.organization_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
