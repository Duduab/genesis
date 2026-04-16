import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { exportAuditTrailCsv, fetchAuditTrail, fetchAuditTrailById } from '../api/genesis/auditTrailApi'
import { isGenesisApiError } from '../api/genesis/errors'
import { useI18n } from '../i18n/I18nContext'

const defaultLimit = 25

function labelFromKey(key) {
  return String(key || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function AuditValueView({ value, depth = 0, t }) {
  if (value == null) return <span className="text-surface-500">—</span>
  if (typeof value === 'string') {
    return <span className="break-words font-mono text-xs text-surface-800 dark:text-surface-200">{value}</span>
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return <span className="font-mono text-xs text-surface-800 dark:text-surface-200">{String(value)}</span>
  }
  if (Array.isArray(value)) {
    if (depth >= 5) {
      return (
        <span className="text-xs text-surface-500">
          {t('admin.auditValue.arrayItems').replaceAll('{{count}}', String(value.length))}
        </span>
      )
    }
    if (value.length === 0) return <span className="text-xs text-surface-500">{t('admin.auditValue.emptyList')}</span>
    return (
      <ul className="list-inside list-disc space-y-1 text-xs text-surface-800 dark:text-surface-200">
        {value.slice(0, 40).map((item, i) => (
          <li key={i}>
            <AuditValueView value={item} depth={depth + 1} t={t} />
          </li>
        ))}
        {value.length > 40 ? (
          <li className="text-surface-500">{t('admin.auditValue.more').replaceAll('{{count}}', String(value.length - 40))}</li>
        ) : null}
      </ul>
    )
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value)
    if (depth >= 5) {
      return (
        <span className="text-xs text-surface-500">
          {t('admin.auditValue.objectKeys').replaceAll('{{count}}', String(entries.length))}
        </span>
      )
    }
    if (entries.length === 0) return <span className="text-xs text-surface-500">{t('admin.auditValue.emptyObject')}</span>
    return (
      <dl className="space-y-2 border-l-2 border-surface-200 pl-3 dark:border-surface-700">
        {entries.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs font-medium text-surface-500">{k}</dt>
            <dd className="mt-0.5">
              <AuditValueView value={v} depth={depth + 1} t={t} />
            </dd>
          </div>
        ))}
      </dl>
    )
  }
  return <span className="text-xs text-surface-500">—</span>
}

const AUDIT_DETAIL_ORDERED_KEYS = [
  'audit_id',
  'request_id',
  'created_at',
  'user_id',
  'user_email',
  'user_role',
  'method',
  'path',
  'action',
  'resource_type',
  'resource_id',
  'response_status',
  'ip_address',
]

function AuditEntryDetailPanel({ detail, t }) {
  if (!detail || typeof detail !== 'object') return null
  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {AUDIT_DETAIL_ORDERED_KEYS.map((key) => {
          const val = detail[key]
          if (val == null || val === '') return null
          const fieldLabel = t(`admin.auditFields.${key}`)
          return (
            <div key={key}>
              <dt className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-surface-400">
                {fieldLabel.startsWith('admin.') ? labelFromKey(key) : fieldLabel}
              </dt>
              <dd className="mt-0.5 break-all text-sm text-surface-900 dark:text-surface-100">{String(val)}</dd>
            </div>
          )
        })}
      </dl>
      {detail.request_body != null ? (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400">{t('admin.auditDetail.requestBody')}</h3>
          <div className="mt-2 rounded-lg border border-surface-200 p-3 dark:border-surface-700">
            <AuditValueView value={detail.request_body} t={t} />
          </div>
        </div>
      ) : null}
      {detail.response_body != null ? (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400">{t('admin.auditDetail.responseBody')}</h3>
          <div className="mt-2 rounded-lg border border-surface-200 p-3 dark:border-surface-700">
            <AuditValueView value={detail.response_body} t={t} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function AdminAuditTrailPage() {
  const { t } = useI18n()
  const [userId, setUserId] = useState('')
  const [action, setAction] = useState('')
  const [resourceType, setResourceType] = useState('')
  const [resourceId, setResourceId] = useState('')
  const [method, setMethod] = useState('')
  const [statusCode, setStatusCode] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [offset, setOffset] = useState(0)
  const [detailId, setDetailId] = useState(null)

  const params = useMemo(
    () => ({
      user_id: userId.trim() || undefined,
      action: action.trim() || undefined,
      resource_type: resourceType.trim() || undefined,
      resource_id: resourceId.trim() || undefined,
      method: method.trim().toUpperCase() || undefined,
      status_code: statusCode.trim() ? Number(statusCode) : undefined,
      from: from.trim() || undefined,
      to: to.trim() || undefined,
      limit: defaultLimit,
      offset,
    }),
    [userId, action, resourceType, resourceId, method, statusCode, from, to, offset],
  )

  const listQ = useQuery({
    queryKey: ['admin', 'audit-trail', params],
    queryFn: () => fetchAuditTrail(params),
    refetchInterval: 15_000,
  })

  const detailQ = useQuery({
    queryKey: ['admin', 'audit-trail', 'detail', detailId],
    queryFn: () => fetchAuditTrailById(detailId),
    enabled: Boolean(detailId),
  })

  const items = listQ.data?.data?.items ?? []
  const applyFilters = useCallback(() => {
    setOffset(0)
  }, [])

  const onExport = async () => {
    try {
      const blob = await exportAuditTrailCsv({
        user_id: params.user_id,
        action: params.action,
        resource_type: params.resource_type,
        resource_id: params.resource_id,
        method: params.method,
        status_code: params.status_code,
        from: params.from,
        to: params.to,
        limit: params.limit,
        offset: params.offset,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'audit_trail.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      window.alert(isGenesisApiError(e) ? e.message : String(e))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">{t('admin.auditPage.title')}</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{t('admin.auditPage.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="rounded-lg border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-800 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100 dark:hover:bg-surface-800"
        >
          {t('admin.auditPage.exportCsv')}
        </button>
      </div>

      <form
        className="grid gap-3 rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-800 dark:bg-surface-900 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault()
          applyFilters()
        }}
      >
        <Field label={t('admin.auditPage.filterUserId')} value={userId} onChange={setUserId} />
        <Field label={t('admin.auditPage.filterAction')} value={action} onChange={setAction} />
        <Field label={t('admin.auditPage.filterResourceType')} value={resourceType} onChange={setResourceType} />
        <Field label={t('admin.auditPage.filterResourceId')} value={resourceId} onChange={setResourceId} />
        <Field
          label={t('admin.auditPage.filterHttpMethod')}
          value={method}
          onChange={setMethod}
          placeholder={t('admin.auditPage.filterHttpMethodPlaceholder')}
        />
        <Field
          label={t('admin.auditPage.filterStatusCode')}
          value={statusCode}
          onChange={setStatusCode}
          placeholder={t('admin.auditPage.filterStatusPlaceholder')}
        />
        <Field label={t('admin.auditPage.filterFromIso')} value={from} onChange={setFrom} />
        <Field label={t('admin.auditPage.filterToIso')} value={to} onChange={setTo} />
        <div className="flex items-end sm:col-span-2 lg:col-span-4">
          <button type="submit" className="rounded-lg bg-genesis-600 px-4 py-2 text-sm font-semibold text-white hover:bg-genesis-700">
            {t('admin.auditPage.applyFilters')}
          </button>
        </div>
      </form>

      {listQ.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {isGenesisApiError(listQ.error) ? listQ.error.message : String(listQ.error)}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
        <table className="min-w-full text-start text-sm">
          <thead className="border-b border-surface-200 bg-surface-50 text-xs uppercase text-surface-500 dark:border-surface-800 dark:bg-surface-800/50 dark:text-surface-400">
            <tr>
              <th className="px-3 py-2">{t('admin.auditPage.colWhen')}</th>
              <th className="px-3 py-2">{t('admin.auditPage.colUser')}</th>
              <th className="px-3 py-2">{t('admin.auditPage.colAction')}</th>
              <th className="px-3 py-2">{t('admin.auditPage.colMethod')}</th>
              <th className="px-3 py-2">{t('admin.auditPage.colStatus')}</th>
              <th className="px-3 py-2">{t('admin.auditPage.colResource')}</th>
              <th className="px-3 py-2">{t('admin.auditPage.colIp')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {items.map((row) => (
              <tr
                key={row.audit_id}
                className="cursor-pointer text-surface-800 hover:bg-surface-50 dark:text-surface-200 dark:hover:bg-surface-800/50"
                onClick={() => setDetailId(row.audit_id)}
              >
                <td className="whitespace-nowrap px-3 py-2 text-xs text-surface-600 dark:text-surface-400">{row.created_at ?? '—'}</td>
                <td className="max-w-[140px] truncate px-3 py-2 text-xs" title={row.user_email}>
                  {row.user_email ?? row.user_id ?? '—'}
                </td>
                <td className="px-3 py-2 text-xs font-medium">{row.action ?? '—'}</td>
                <td className="px-3 py-2 font-mono text-xs">{row.method ?? '—'}</td>
                <td className="px-3 py-2 tabular-nums">{row.response_status ?? '—'}</td>
                <td className="max-w-[180px] truncate px-3 py-2 text-xs" title={row.path}>
                  {row.resource_type ?? '—'} {row.resource_id ? `· ${row.resource_id}` : ''}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{row.ip_address ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {listQ.isLoading ? <p className="px-3 py-4 text-sm text-surface-500">{t('common.loading')}</p> : null}
        {!listQ.isLoading && items.length === 0 ? <p className="px-3 py-4 text-sm text-surface-500">{t('admin.auditPage.noRows')}</p> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={offset < defaultLimit}
          onClick={() => setOffset((o) => Math.max(0, o - defaultLimit))}
          className="rounded-lg border border-surface-200 px-3 py-2 text-sm disabled:opacity-40 dark:border-surface-700"
        >
          {t('common.previous')}
        </button>
        <span className="text-xs text-surface-500">
          {t('admin.paginationMeta').replaceAll('{{offset}}', String(offset)).replaceAll('{{limit}}', String(defaultLimit))}
        </span>
        <button
          type="button"
          disabled={items.length < defaultLimit}
          onClick={() => setOffset((o) => o + defaultLimit)}
          className="rounded-lg border border-surface-200 px-3 py-2 text-sm disabled:opacity-40 dark:border-surface-700"
        >
          {t('common.next')}
        </button>
      </div>

      {detailId ? (
        <div
          className="fixed inset-0 z-[2147483646] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailId(null)
          }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-xl dark:border-surface-800 dark:bg-surface-900">
            <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3 dark:border-surface-800">
              <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50">{t('admin.auditPage.auditEntry')}</h2>
              <button
                type="button"
                onClick={() => setDetailId(null)}
                className="rounded-lg px-2 py-1 text-sm text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
              >
                {t('common.close')}
              </button>
            </div>
            <div className="max-h-[calc(90vh-52px)] overflow-auto p-4">
              {detailQ.isLoading ? <p className="text-sm text-surface-500">Loading…</p> : null}
              {detailQ.data?.data ? <AuditEntryDetailPanel detail={detailQ.data.data} /> : null}
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

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-surface-600 dark:text-surface-400">{label}</label>
      <input
        className="mt-1 w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-950"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
