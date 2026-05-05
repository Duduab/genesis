import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  AlertCircle,
  X,
  Shield,
  UserCircle,
} from 'lucide-react'
import { useI18n } from '../../i18n/I18nContext'
import { useAuth } from '../../auth/AuthContext'
import { isGenesisApiError } from '../../api/genesis/errors'
import {
  deleteOrganizationMember,
  fetchOrganizationMembers,
  patchOrganizationMemberRole,
  postOrganizationMember,
} from '../../api/genesis/organizationsApi'
import { ORGANIZATIONS_QUERY_KEY, useOrganizationsQuery } from '../../hooks/useOrganizationsQuery'
import { canWriteOrganizationBusiness } from '../../lib/orgAccess'

function isPendingRow(row) {
  return row.accepted_at == null && row.invited_email
}

export default function TeamMembersTab({ initialOrganizationId }) {
  const { t } = useI18n()
  const qc = useQueryClient()
  const { user } = useAuth()
  const claims = user?.jwtClaims ?? {}

  const orgsQ = useOrganizationsQuery({ enabled: true })
  const organizations = orgsQ.data ?? []

  const [selectedOrgId, setSelectedOrgId] = useState(() => {
    const first = organizations[0]?.organization_id
    if (initialOrganizationId && organizations.some((o) => o.organization_id === initialOrganizationId)) {
      return initialOrganizationId
    }
    return first ?? ''
  })

  useEffect(() => {
    if (!selectedOrgId && organizations[0]?.organization_id) {
      setSelectedOrgId(organizations[0].organization_id)
    }
  }, [organizations, selectedOrgId])

  useEffect(() => {
    if (
      initialOrganizationId &&
      organizations.some((o) => o.organization_id === initialOrganizationId) &&
      selectedOrgId !== initialOrganizationId
    ) {
      setSelectedOrgId(initialOrganizationId)
    }
  }, [initialOrganizationId, organizations, selectedOrgId])

  const membersQ = useQuery({
    queryKey: ['organization-members', selectedOrgId],
    queryFn: () => fetchOrganizationMembers(selectedOrgId),
    enabled: Boolean(selectedOrgId),
  })

  const canManageSelected = useMemo(() => {
    if (!selectedOrgId) return false
    return canWriteOrganizationBusiness(selectedOrgId, organizations, claims)
  }, [selectedOrgId, organizations, claims])

  const acceptedOwners = useMemo(() => {
    const rows = membersQ.data ?? []
    return rows.filter((r) => !isPendingRow(r) && String(r.role).toLowerCase() === 'owner')
  }, [membersQ.data])

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }) => postOrganizationMember(selectedOrgId, { email, role }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['organization-members', selectedOrgId] })
      await qc.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (userId) => deleteOrganizationMember(selectedOrgId, userId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['organization-members', selectedOrgId] })
      await qc.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY })
    },
  })

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) => patchOrganizationMemberRole(selectedOrgId, userId, role),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['organization-members', selectedOrgId] })
      await qc.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY })
    },
  })

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')

  const handleInvite = () => {
    if (!inviteEmail.trim() || !canManageSelected) return
    inviteMutation.mutate(
      { email: inviteEmail.trim(), role: inviteRole === 'owner' ? 'owner' : 'member' },
      {
        onSuccess: () => {
          setInviteEmail('')
          setInviteOpen(false)
        },
      },
    )
  }

  const inviteErrorText =
    inviteMutation.error != null
      ? isGenesisApiError(inviteMutation.error)
        ? inviteMutation.error.userFacingMessage(t('organizations.team.inviteFailed'), t)
        : t('organizations.team.inviteFailed')
      : null

  const rows = membersQ.data ?? []

  const displayEmail = useCallback((row) => {
    if (isPendingRow(row)) return row.invited_email || '—'
    return row.invited_email || row.user_id
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-surface-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-genesis-50 ring-1 ring-genesis-200/60">
              <Users className="h-[18px] w-[18px] text-genesis-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-surface-900">{t('organizations.team.title')}</h3>
              <p className="mt-0.5 text-xs text-surface-400">{t('organizations.team.subtitle')}</p>
            </div>
          </div>

          {organizations.length > 1 ? (
            <label className="flex min-w-[14rem] flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-surface-400">
              {t('organizations.team.orgSelect')}
              <div className="relative">
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-surface-200 bg-surface-50 px-3 pe-10 text-sm font-medium text-surface-800 outline-none focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100"
                >
                  {organizations.map((o) => (
                    <option key={o.organization_id} value={o.organization_id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              </div>
            </label>
          ) : null}
        </div>

        <div className="px-6 py-5">
          {!selectedOrgId ? (
            <p className="text-sm text-surface-500">{t('organizations.team.noOrganizations')}</p>
          ) : membersQ.isLoading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-surface-500">
              <Loader2 className="h-5 w-5 animate-spin text-genesis-600" />
              {t('organizations.team.loadingMembers')}
            </div>
          ) : membersQ.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {isGenesisApiError(membersQ.error)
                ? membersQ.error.userFacingMessage(t('organizations.team.loadFailed'), t)
                : t('organizations.team.loadFailed')}
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                {canManageSelected ? (
                  <button
                    type="button"
                    onClick={() => setInviteOpen(true)}
                    className="btn-authora-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
                  >
                    <Plus className="h-4 w-4" />
                    {t('organizations.team.addMember')}
                  </button>
                ) : (
                  <p className="text-xs text-surface-500">{t('organizations.team.readOnlyHint')}</p>
                )}
              </div>

              <div className="overflow-x-auto rounded-lg border border-surface-200">
                <table className="min-w-full divide-y divide-surface-200 text-sm">
                  <thead className="bg-surface-50">
                    <tr>
                      <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wide text-surface-400">
                        {t('organizations.team.colEmail')}
                      </th>
                      <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wide text-surface-400">
                        {t('organizations.team.colRole')}
                      </th>
                      <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wide text-surface-400">
                        {t('organizations.team.colStatus')}
                      </th>
                      <th className="px-4 py-3 text-end text-[11px] font-semibold uppercase tracking-wide text-surface-400">
                        {t('organizations.team.colActions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 bg-white">
                    {rows.map((row) => {
                      const pending = isPendingRow(row)
                      const roleLower = String(row.role).toLowerCase()
                      const soleOwnerLocked =
                        !pending && roleLower === 'owner' && acceptedOwners.length === 1
                      return (
                        <tr key={row.user_id}>
                          <td className="max-w-[14rem] truncate px-4 py-3 font-medium text-surface-800" title={displayEmail(row)}>
                            {pending ? (
                              <span className="text-surface-600">{displayEmail(row)}</span>
                            ) : (
                              displayEmail(row)
                            )}
                          </td>
                          <td className="px-4 py-3 text-surface-600">
                            {roleLower === 'owner' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-genesis-50 px-2 py-0.5 text-xs font-semibold text-genesis-800 ring-1 ring-genesis-200">
                                <Shield className="h-3 w-3" />
                                {t('organizations.team.roleOwner')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2 py-0.5 text-xs font-semibold text-surface-700">
                                <UserCircle className="h-3 w-3" />
                                {t('organizations.team.roleMember')}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-surface-600">
                            {pending ? t('organizations.team.statusPending') : t('organizations.team.statusActive')}
                          </td>
                          <td className="px-4 py-3 text-end">
                            {canManageSelected ? (
                              <div className="flex flex-wrap justify-end gap-2">
                                {!pending && roleLower === 'member' ? (
                                  <button
                                    type="button"
                                    disabled={roleMutation.isPending}
                                    onClick={() =>
                                      roleMutation.mutate({ userId: row.user_id, role: 'owner' })
                                    }
                                    className="rounded-lg border border-surface-200 px-2 py-1 text-xs font-semibold text-surface-700 hover:bg-surface-50 disabled:opacity-50"
                                  >
                                    {t('organizations.team.makeOwner')}
                                  </button>
                                ) : null}
                                {!pending && roleLower === 'owner' && acceptedOwners.length > 1 ? (
                                  <button
                                    type="button"
                                    disabled={roleMutation.isPending}
                                    onClick={() =>
                                      roleMutation.mutate({ userId: row.user_id, role: 'member' })
                                    }
                                    className="rounded-lg border border-surface-200 px-2 py-1 text-xs font-semibold text-surface-700 hover:bg-surface-50 disabled:opacity-50"
                                  >
                                    {t('organizations.team.makeMember')}
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  disabled={removeMutation.isPending || soleOwnerLocked}
                                  title={soleOwnerLocked ? t('organizations.team.lastOwnerHint') : undefined}
                                  onClick={() => {
                                    if (window.confirm(t('organizations.team.removeConfirm'))) {
                                      removeMutation.mutate(row.user_id)
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:pointer-events-none disabled:opacity-40"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  {pending ? t('organizations.team.cancelInvite') : t('organizations.team.remove')}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-surface-400">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-surface-400">{t('organizations.team.inviteFootnote')}</p>
            </>
          )}
        </div>
      </div>

      {inviteOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" role="dialog">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-surface-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-surface-900">{t('organizations.team.inviteTitle')}</h2>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-lg p-1 text-surface-400 hover:bg-surface-100"
                aria-label={t('common.close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <label className="block text-xs font-semibold text-surface-600">
                {t('organizations.team.inviteEmail')}
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-surface-200 px-3 text-sm outline-none focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100"
                  placeholder="name@company.com"
                  autoComplete="email"
                />
              </label>
              <label className="block text-xs font-semibold text-surface-600">
                {t('organizations.team.inviteRole')}
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-surface-200 bg-white px-3 text-sm outline-none focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100"
                >
                  <option value="member">{t('organizations.team.roleMember')}</option>
                  <option value="owner">{t('organizations.team.roleOwner')}</option>
                </select>
              </label>
              {inviteErrorText ? (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {inviteErrorText}
                </div>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteOpen(false)}
                  className="rounded-xl border border-surface-200 px-4 py-2 text-sm font-semibold text-surface-700 hover:bg-surface-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  disabled={inviteMutation.isPending || !inviteEmail.trim()}
                  onClick={handleInvite}
                  className="btn-authora-gradient rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  {inviteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('organizations.team.sendInvite')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
