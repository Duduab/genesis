import { useEffect, useMemo } from 'react'
import { Building2, Loader2, UsersRound, ArrowRight } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useRouter } from '../router'
import { useOrganizationsQuery } from '../hooks/useOrganizationsQuery'

function orgTypeLabelKey(organization_type) {
  const x = String(organization_type || '').toLowerCase()
  if (x === 'chain') return 'organizations.type.chain'
  if (x === 'franchise') return 'organizations.type.franchise'
  return 'organizations.type.workspace'
}

export default function MyOrganizationsPage() {
  const { t } = useI18n()
  const { navigate } = useRouter()
  const orgsQ = useOrganizationsQuery({ enabled: true })
  const organizations = orgsQ.data ?? []

  useEffect(() => {
    if (!orgsQ.isSuccess || organizations.length !== 1) return
    const id = organizations[0].organization_id
    navigate(`/settings?tab=teamMembers&organizationId=${encodeURIComponent(id)}`, { replace: true })
  }, [orgsQ.isSuccess, organizations, navigate])

  const sorted = useMemo(() => {
    return [...organizations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [organizations])

  return (
    <div className="mx-auto max-w-7xl">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-surface-900">{t('organizations.page.title')}</h1>
        <p className="mt-1 text-sm text-surface-500">{t('organizations.page.subtitle')}</p>
      </div>

      {orgsQ.isLoading ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-3 py-16 text-surface-500">
          <Loader2 className="h-10 w-10 animate-spin text-genesis-600" aria-hidden />
          <p className="text-sm font-medium">{t('organizations.page.loading')}</p>
        </div>
      ) : orgsQ.isError ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {t('organizations.page.loadError')}
        </div>
      ) : sorted.length === 0 ? (
        <p className="mt-8 rounded-xl border border-surface-200 bg-white px-6 py-10 text-center text-sm text-surface-500">
          {t('organizations.page.empty')}
        </p>
      ) : sorted.length === 1 ? (
        <p className="mt-6 text-center text-sm text-surface-400">{t('organizations.page.redirecting')}</p>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((org) => (
            <div
              key={org.organization_id}
              className="flex h-full flex-col overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm transition-all hover:border-genesis-200 hover:shadow-md"
            >
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
                      {String(org.role || '').toLowerCase() === 'owner'
                        ? t('organizations.card.roleOwner')
                        : t('organizations.card.roleMember')}
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
                  onClick={() =>
                    navigate(
                      `/settings?tab=teamMembers&organizationId=${encodeURIComponent(org.organization_id)}`,
                    )
                  }
                  className="group/btn flex w-full items-center justify-center gap-2 rounded-lg border border-genesis-200 bg-genesis-50/50 px-4 py-2 text-xs font-semibold text-genesis-700 transition-all hover:bg-genesis-100 hover:shadow-sm active:scale-[0.98]"
                >
                  {t('organizations.card.manage')}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
