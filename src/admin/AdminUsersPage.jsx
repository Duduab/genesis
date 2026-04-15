import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  deleteUser,
  fetchUserById,
  fetchUsersList,
  inviteUser,
  putUserRole,
} from '../api/genesis/usersAdminApi'
import { isGenesisApiError } from '../api/genesis/errors'
import { useI18n } from '../i18n/I18nContext'

const pageSize = 25

const ROLES = ['admin', 'operator', 'entrepreneur']

export default function AdminUsersPage() {
  const { t } = useI18n()
  const qc = useQueryClient()
  const [offset, setOffset] = useState(0)
  const [detailId, setDetailId] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [roleDraft, setRoleDraft] = useState('entrepreneur')

  const listQ = useQuery({
    queryKey: ['admin', 'users', { limit: pageSize, offset }],
    queryFn: () => fetchUsersList({ limit: pageSize, offset }),
    refetchInterval: 20_000,
  })

  const detailQ = useQuery({
    queryKey: ['admin', 'users', 'detail', detailId],
    queryFn: () => fetchUserById(detailId),
    enabled: Boolean(detailId),
  })

  const user = detailQ.data?.data

  const inviteM = useMutation({
    mutationFn: () => inviteUser({ email: inviteEmail.trim(), display_name: inviteName.trim() || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      setInviteEmail('')
      setInviteName('')
      setInviteOpen(false)
    },
  })

  const roleM = useMutation({
    mutationFn: ({ userId, role }) => putUserRole(userId, role),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['admin', 'users', 'detail', userId] })
    },
  })

  const deleteM = useMutation({
    mutationFn: (userId) => deleteUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      setDetailId(null)
    },
  })

  const rows = listQ.data?.data ?? []
  const canPageNext = rows.length >= pageSize && listQ.data?.pagination?.has_more !== false

  useEffect(() => {
    if (!user) return
    const r = user.role && ROLES.includes(String(user.role)) ? String(user.role) : 'entrepreneur'
    setRoleDraft(r)
  }, [user?.user_id, user?.role])

  const effectiveRole = user?.role && ROLES.includes(String(user.role)) ? String(user.role) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">{t('admin.usersPage.title')}</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{t('admin.usersPage.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            inviteM.reset()
            setInviteOpen((v) => !v)
          }}
          className="rounded-lg bg-genesis-600 px-4 py-2 text-sm font-semibold text-white hover:bg-genesis-700"
        >
          {t('admin.usersPage.inviteUser')}
        </button>
      </div>

      {inviteOpen ? (
        <form
          className="grid gap-3 rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-800 dark:bg-surface-900 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault()
            inviteM.mutate()
          }}
        >
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-medium text-surface-600 dark:text-surface-400" htmlFor="inv-email">
              {t('admin.usersPage.emailRequired')}
            </label>
            <input
              id="inv-email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-950"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 dark:text-surface-400" htmlFor="inv-name">
              {t('admin.usersPage.displayNameOptional')}
            </label>
            <input
              id="inv-name"
              className="mt-1 w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-950"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" disabled={inviteM.isPending} className="rounded-lg bg-genesis-600 px-4 py-2 text-sm font-semibold text-white hover:bg-genesis-700 disabled:opacity-50">
              {t('admin.usersPage.sendInvite')}
            </button>
            <button
              type="button"
              onClick={() => {
                inviteM.reset()
                setInviteOpen(false)
              }}
              className="rounded-lg border border-surface-200 px-3 py-2 text-sm dark:border-surface-700"
            >
              {t('common.cancel')}
            </button>
          </div>
          {inviteM.error ? (
            <p className="text-sm text-red-600 sm:col-span-2 lg:col-span-3">{isGenesisApiError(inviteM.error) ? inviteM.error.message : String(inviteM.error)}</p>
          ) : null}
          {inviteM.isSuccess ? <p className="text-sm text-emerald-600 sm:col-span-2 lg:col-span-3">{t('admin.usersPage.inviteSent')}</p> : null}
        </form>
      ) : null}

      {listQ.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {isGenesisApiError(listQ.error) ? listQ.error.message : String(listQ.error)}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
        <table className="min-w-full text-start text-sm">
          <thead className="border-b border-surface-200 bg-surface-50 text-xs uppercase text-surface-500 dark:border-surface-800 dark:bg-surface-800/50 dark:text-surface-400">
            <tr>
              <th className="px-3 py-2">{t('admin.usersPage.colEmail')}</th>
              <th className="px-3 py-2">{t('admin.usersPage.colName')}</th>
              <th className="px-3 py-2">{t('admin.usersPage.colRole')}</th>
              <th className="px-3 py-2">{t('admin.usersPage.colLastLogin')}</th>
              <th className="px-3 py-2">{t('admin.usersPage.colUserId')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {rows.map((row) => (
              <tr
                key={row.user_id}
                className="cursor-pointer text-surface-800 hover:bg-surface-50 dark:text-surface-200 dark:hover:bg-surface-800/50"
                onClick={() => setDetailId(row.user_id)}
              >
                <td className="max-w-[200px] truncate px-3 py-2 text-xs" title={row.email ?? ''}>
                  {row.email ?? '—'}
                </td>
                <td className="max-w-[160px] truncate px-3 py-2">{row.display_name ?? '—'}</td>
                <td className="px-3 py-2 text-xs font-medium">{row.role ?? '—'}</td>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-surface-600 dark:text-surface-400">{row.last_login ?? '—'}</td>
                <td className="px-3 py-2 font-mono text-xs text-surface-500">{row.user_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {listQ.isLoading ? <p className="px-3 py-4 text-sm text-surface-500">{t('common.loading')}</p> : null}
        {!listQ.isLoading && rows.length === 0 ? <p className="px-3 py-4 text-sm text-surface-500">{t('admin.usersPage.noUsers')}</p> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={offset < pageSize}
          onClick={() => setOffset((o) => Math.max(0, o - pageSize))}
          className="rounded-lg border border-surface-200 px-3 py-2 text-sm disabled:opacity-40 dark:border-surface-700"
        >
          {t('common.previous')}
        </button>
        <span className="text-xs text-surface-500">
          {t('admin.paginationMeta').replaceAll('{{offset}}', String(offset)).replaceAll('{{limit}}', String(pageSize))}
          {listQ.data?.pagination?.count != null
            ? t('admin.paginationCount').replaceAll('{{count}}', String(listQ.data.pagination.count))
            : ''}
        </span>
        <button
          type="button"
          disabled={!canPageNext}
          onClick={() => setOffset((o) => o + pageSize)}
          className="rounded-lg border border-surface-200 px-3 py-2 text-sm disabled:opacity-40 dark:border-surface-700"
        >
          {t('common.next')}
        </button>
      </div>

      {detailId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              roleM.reset()
              deleteM.reset()
              setDetailId(null)
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-xl dark:border-surface-800 dark:bg-surface-900">
            <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3 dark:border-surface-800">
              <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50">{t('admin.usersPage.userDetails')}</h2>
              <button
                type="button"
                onClick={() => {
                  roleM.reset()
                  deleteM.reset()
                  setDetailId(null)
                }}
                className="rounded-lg px-2 py-1 text-sm text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
              >
                {t('common.close')}
              </button>
            </div>
            <div className="max-h-[calc(90vh-52px)] space-y-4 overflow-auto p-4">
              {detailQ.isLoading ? <p className="text-sm text-surface-500">{t('common.loading')}</p> : null}
              {user ? (
                <>
                  <dl className="grid gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-surface-500">{t('admin.usersPage.detailEmail')}</dt>
                      <dd className="font-medium text-surface-900 dark:text-surface-50">{user.email ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-surface-500">{t('admin.usersPage.detailDisplayName')}</dt>
                      <dd>{user.display_name ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-surface-500">{t('admin.usersPage.detailUserId')}</dt>
                      <dd className="font-mono text-xs">{user.user_id}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-surface-500">{t('admin.usersPage.detailPhone')}</dt>
                      <dd>{user.phone ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-surface-500">{t('admin.usersPage.detailLanguage')}</dt>
                      <dd>{user.language ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-surface-500">{t('admin.usersPage.detailRole')}</dt>
                      <dd>{user.role ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-surface-500">{t('admin.usersPage.detailLastLogin')}</dt>
                      <dd className="text-xs">{user.last_login ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-surface-500">{t('admin.usersPage.detailCreated')}</dt>
                      <dd className="text-xs">{user.created_at ?? '—'}</dd>
                    </div>
                  </dl>

                  <div className="border-t border-surface-200 pt-4 dark:border-surface-800">
                    <label className="block text-xs font-medium text-surface-600 dark:text-surface-400" htmlFor="role-select">
                      {t('admin.usersPage.changeRole')}
                    </label>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <select
                        id="role-select"
                        className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-950"
                        value={roleDraft}
                        onChange={(e) => setRoleDraft(e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={roleM.isPending || !user.user_id || (effectiveRole != null && roleDraft === effectiveRole)}
                        onClick={() => roleM.mutate({ userId: user.user_id, role: roleDraft })}
                        className="rounded-lg bg-genesis-600 px-3 py-2 text-sm font-semibold text-white hover:bg-genesis-700 disabled:opacity-40"
                      >
                        {t('admin.usersPage.saveRole')}
                      </button>
                    </div>
                    {roleM.error ? <p className="mt-2 text-sm text-red-600">{isGenesisApiError(roleM.error) ? roleM.error.message : String(roleM.error)}</p> : null}
                    {roleM.isSuccess ? <p className="mt-2 text-sm text-emerald-600">{t('admin.usersPage.roleUpdated')}</p> : null}
                  </div>

                  <div className="border-t border-surface-200 pt-4 dark:border-surface-800">
                    <button
                      type="button"
                      className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950"
                      disabled={deleteM.isPending}
                      onClick={() => {
                        if (
                          !window.confirm(
                            t('admin.usersPage.deleteConfirm').replaceAll('{{name}}', String(user.email || user.user_id)),
                          )
                        )
                          return
                        deleteM.mutate(user.user_id)
                      }}
                    >
                      {t('admin.usersPage.deleteUser')}
                    </button>
                    {deleteM.error ? (
                      <p className="mt-2 text-sm text-red-600">{isGenesisApiError(deleteM.error) ? deleteM.error.message : String(deleteM.error)}</p>
                    ) : null}
                  </div>

                </>
              ) : null}
              {detailQ.error ? (
                <p className="text-sm text-red-600">{isGenesisApiError(detailQ.error) ? detailQ.error.message : String(detailQ.error)}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
