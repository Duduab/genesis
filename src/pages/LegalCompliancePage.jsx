import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { useActiveBusiness } from '../context/ActiveBusinessContext'
import { useLegalDocumentsForBusiness } from '../hooks/useLegalDocumentsForBusiness'
import { loadPersistedGenesisBusinesses } from '../dashboard/genesisBusinessStorage'
import { mapPersistedBusinessToEntityView } from '../dashboard/mapPersistedBusinessToEntityView'
import {
  FileText,
  FileType2,
  ShieldCheck,
  PenLine,
  Download,
  Eye,
  Search,
  Landmark,
  Briefcase,
  Receipt,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  File,
  Loader2,
} from 'lucide-react'

const SIDEBAR_CATEGORIES = [
  { key: 'contract', tKey: 'legal.catContract', icon: Landmark },
  { key: 'tax', tKey: 'legal.taxFilings', icon: Receipt },
  { key: 'employment', tKey: 'legal.employment', icon: Briefcase },
  { key: 'licensing', tKey: 'legal.catLicensing', icon: ShieldCheck },
]

const statusConfig = {
  signed: {
    style: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    icon: CheckCircle2,
    tKey: 'legal.statusSigned',
  },
  approved: {
    style: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    icon: CheckCircle2,
    tKey: 'legal.statusApproved',
  },
  pending_signature: {
    style: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    icon: AlertCircle,
    tKey: 'legal.statusAwaiting',
  },
  pending: {
    style: 'bg-surface-100 text-surface-500 ring-surface-400/20',
    icon: AlertCircle,
    tKey: 'legal.statusPending',
  },
}

const fileIcons = {
  pdf: { icon: FileText, color: 'text-red-500 bg-red-50 ring-red-200/60' },
  docx: { icon: FileType2, color: 'text-blue-500 bg-blue-50 ring-blue-200/60' },
  generic: { icon: File, color: 'text-surface-400 bg-surface-100 ring-surface-200/60' },
}

function formatFileSize(bytes) {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n >= 1_048_576) return `${(n / 1_048_576).toFixed(1)} MB`
  if (n >= 1024) return `${Math.round(n / 1024)} KB`
  return `${n} B`
}

function formatDocDate(iso, locale) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const tag = locale === 'he' ? 'he-IL' : 'en-US'
  return d.toLocaleDateString(tag, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatAgentId(agentId) {
  const map = {
    agent_financial: 'TaxFin-Agent',
    agent_hr: 'OpsHR-Agent',
    agent_legal: 'GovReg-Agent',
    agent_negotiation: 'Negotiation-Agent',
  }
  if (map[agentId]) return map[agentId]
  return String(agentId || '')
    .replace(/^agent_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function mapItemToDoc(item, businessName, locale) {
  return {
    id: item.document_id,
    title: item.name,
    category: item.category,
    entity: businessName,
    date: formatDocDate(item.created_at, locale),
    size: formatFileSize(item.file_size_bytes),
    agent: formatAgentId(item.agent_id),
    fileType: 'generic',
    status: item.status,
    needsSignature: item.status === 'pending_signature',
  }
}

function DocumentRow({ doc, t }) {
  const fi = fileIcons[doc.fileType] || fileIcons.generic
  const FileIcon = fi.icon
  const st = statusConfig[doc.status] || statusConfig.pending
  const StatusIcon = st.icon

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-transparent bg-white px-5 py-3.5 transition-all hover:border-surface-200 hover:shadow-md">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${fi.color}`}>
        <FileIcon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-surface-800">{doc.title}</p>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-surface-400">
          <span>{doc.entity}</span>
          <span className="text-surface-300">·</span>
          <span>{doc.date}</span>
          <span className="text-surface-300">·</span>
          <span>{doc.size}</span>
          <span className="text-surface-300">·</span>
          <span className="italic">{doc.agent}</span>
        </div>
      </div>

      <span
        className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset sm:inline-flex ${st.style}`}
      >
        <StatusIcon className="h-3 w-3" />
        {t(st.tKey)}
      </span>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          title={t('legal.actionView')}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          type="button"
          title={t('legal.actionDownload')}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
        >
          <Download className="h-4 w-4" />
        </button>
        {doc.needsSignature ? (
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-lg bg-genesis-600 px-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-genesis-700 active:scale-[0.97]"
          >
            <PenLine className="h-3.5 w-3.5" />
            {t('legal.actionSign')}
          </button>
        ) : (
          <button
            type="button"
            title={t('legal.actionSign')}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
          >
            <PenLine className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function LegalCompliancePage() {
  const { t, locale } = useI18n()
  const { activeBusinessId, activeViewModel } = useActiveBusiness()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const { businessId, businessName } = useMemo(() => {
    const list = loadPersistedGenesisBusinesses()
    const id = activeBusinessId?.trim() || list[0]?.businessId || null
    if (!id) return { businessId: null, businessName: '' }
    let name = ''
    if (activeBusinessId === id && activeViewModel) {
      name = activeViewModel.name
    } else {
      const row = list.find((b) => b.businessId === id)
      if (row) name = mapPersistedBusinessToEntityView(row, locale).name
    }
    return { businessId: id, businessName: name }
  }, [activeBusinessId, activeViewModel, locale])

  useEffect(() => {
    setActiveCategory('all')
    setSearch('')
  }, [businessId])

  const { data, loading, error } = useLegalDocumentsForBusiness(businessId)

  const items = data?.items ?? []
  const categoryCounts = data?.category_counts ?? {}
  const statusCounts = data?.status_counts ?? {}

  const docs = useMemo(
    () => items.map((item) => mapItemToDoc(item, businessName || '—', locale)),
    [items, businessName, locale],
  )

  const categoryNav = useMemo(() => {
    const extraKeys = Object.keys(categoryCounts).filter(
      (k) => !SIDEBAR_CATEGORIES.some((c) => c.key === k),
    )
    const extras = extraKeys.sort().map((key) => ({
      key,
      tKey: null,
      icon: FileText,
      labelKey: key,
      count: categoryCounts[key] ?? items.filter((i) => i.category === key).length,
    }))
    const main = SIDEBAR_CATEGORIES.map((c) => ({
      ...c,
      labelKey: null,
      count: categoryCounts[c.key] ?? items.filter((i) => i.category === c.key).length,
    }))
    return { main, extras }
  }, [categoryCounts, items])

  const filtered = docs.filter((doc) => {
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory
    const q = search.toLowerCase()
    const matchesSearch =
      !q || doc.title.toLowerCase().includes(q) || doc.entity.toLowerCase().includes(q) || doc.agent.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  const totalDocs = items.length
  const sigRequired = Object.prototype.hasOwnProperty.call(statusCounts, 'pending_signature')
    ? statusCounts.pending_signature ?? 0
    : items.filter((i) => i.status === 'pending_signature').length
  const signedDocs =
    Object.prototype.hasOwnProperty.call(statusCounts, 'signed') ||
    Object.prototype.hasOwnProperty.call(statusCounts, 'approved')
      ? (statusCounts.signed ?? 0) + (statusCounts.approved ?? 0)
      : items.filter((i) => i.status === 'signed' || i.status === 'approved').length
  const draftDocs = Object.prototype.hasOwnProperty.call(statusCounts, 'pending')
    ? statusCounts.pending ?? 0
    : items.filter((i) => i.status === 'pending').length

  const activeCategoryLabel = useMemo(() => {
    if (activeCategory === 'all') return t('legal.allDocs')
    const found = SIDEBAR_CATEGORIES.find((c) => c.key === activeCategory)
    if (found) return t(found.tKey)
    return activeCategory.replace(/_/g, ' ')
  }, [activeCategory, t])

  return (
    <div className="mx-auto max-w-7xl">
      <div className="animate-fade-in flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t('legal.title')}</h1>
          <p className="mt-1 text-sm text-surface-500">{t('legal.subtitle')}</p>
          {businessName ? (
            <p className="mt-0.5 text-xs font-medium text-genesis-600">
              {t('legal.subtitleForBusiness').replaceAll('{{name}}', businessName)}
            </p>
          ) : null}
        </div>
      </div>

      {!businessId ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-300 bg-surface-50/50 px-6 py-16 text-center">
          <ShieldCheck className="h-10 w-10 text-surface-400" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-surface-800">{t('legal.selectBusiness')}</p>
          <p className="mt-1 max-w-md text-xs text-surface-500">{t('legal.selectBusinessSub')}</p>
        </div>
      ) : null}

      {error && businessId ? (
        <div
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          {t(error)}
        </div>
      ) : null}

      {businessId ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-surface-200 bg-white px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-genesis-50">
                  <FolderOpen className="h-4 w-4 text-genesis-600" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-surface-400">{t('legal.totalDocs')}</p>
                  <p className="text-lg font-bold text-surface-900">{loading ? '—' : totalDocs}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                  <PenLine className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-amber-600/70">{t('legal.signaturesReq')}</p>
                  <p className="text-lg font-bold text-amber-700">{loading ? '—' : sigRequired}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-surface-200 bg-white px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-surface-400">{t('legal.signed')}</p>
                  <p className="text-lg font-bold text-surface-900">{loading ? '—' : signedDocs}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-surface-200 bg-white px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-100">
                  <AlertCircle className="h-4 w-4 text-surface-500" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-surface-400">{t('legal.statPending')}</p>
                  <p className="text-lg font-bold text-surface-900">{loading ? '—' : draftDocs}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-5 lg:flex-row">
            <div className="w-full shrink-0 lg:w-56">
              <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
                <div className="border-b border-surface-100 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">{t('legal.categories')}</p>
                </div>
                <nav className="p-2">
                  <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
                    <li>
                      <button
                        type="button"
                        onClick={() => setActiveCategory('all')}
                        className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          activeCategory === 'all'
                            ? 'bg-genesis-50 text-genesis-700 shadow-sm ring-1 ring-genesis-200'
                            : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'
                        }`}
                      >
                        <FolderOpen
                          className={`h-4 w-4 shrink-0 ${activeCategory === 'all' ? 'text-genesis-600' : 'text-surface-400'}`}
                        />
                        <span className="flex-1 text-start">{t('legal.allDocs')}</span>
                        <span
                          className={`ms-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                            activeCategory === 'all' ? 'bg-genesis-100 text-genesis-700' : 'bg-surface-100 text-surface-400'
                          }`}
                        >
                          {loading ? '—' : items.length}
                        </span>
                      </button>
                    </li>
                    {categoryNav.main.map((cat) => {
                      const CatIcon = cat.icon
                      const isActive = activeCategory === cat.key
                      return (
                        <li key={cat.key}>
                          <button
                            type="button"
                            onClick={() => setActiveCategory(cat.key)}
                            className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                              isActive
                                ? 'bg-genesis-50 text-genesis-700 shadow-sm ring-1 ring-genesis-200'
                                : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'
                            }`}
                          >
                            <CatIcon className={`h-4 w-4 shrink-0 ${isActive ? 'text-genesis-600' : 'text-surface-400'}`} />
                            <span className="flex-1 text-start">{t(cat.tKey)}</span>
                            <span
                              className={`ms-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                isActive ? 'bg-genesis-100 text-genesis-700' : 'bg-surface-100 text-surface-400'
                              }`}
                            >
                              {loading ? '—' : cat.count}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                    {categoryNav.extras.map((cat) => {
                      const CatIcon = cat.icon
                      const isActive = activeCategory === cat.key
                      return (
                        <li key={cat.key}>
                          <button
                            type="button"
                            onClick={() => setActiveCategory(cat.key)}
                            className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                              isActive
                                ? 'bg-genesis-50 text-genesis-700 shadow-sm ring-1 ring-genesis-200'
                                : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'
                            }`}
                          >
                            <CatIcon className={`h-4 w-4 shrink-0 ${isActive ? 'text-genesis-600' : 'text-surface-400'}`} />
                            <span className="flex-1 text-start capitalize">{cat.labelKey.replace(/_/g, ' ')}</span>
                            <span
                              className={`ms-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                isActive ? 'bg-genesis-100 text-genesis-700' : 'bg-surface-100 text-surface-400'
                              }`}
                            >
                              {loading ? '—' : cat.count}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-surface-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-genesis-600" />
                    <h2 className="text-sm font-bold text-surface-900">{activeCategoryLabel}</h2>
                    <span className="rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-bold text-surface-500">
                      {loading ? '—' : filtered.length}
                    </span>
                  </div>
                  <div className="relative">
                    <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-surface-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t('legal.searchPlaceholder')}
                      className="h-8 w-full rounded-lg border border-surface-200 bg-surface-50 ps-8 pe-3 text-xs text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100 sm:w-52"
                    />
                  </div>
                </div>

                <div className="hidden items-center gap-4 border-b border-surface-100 px-5 py-2 sm:flex">
                  <div className="w-10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">{t('legal.document')}</p>
                  </div>
                  <div className="w-32 shrink-0 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">{t('legal.status')}</p>
                  </div>
                  <div className="w-28 shrink-0" />
                </div>

                <div className="divide-y divide-surface-50 p-2">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="h-10 w-10 animate-spin text-genesis-600" aria-hidden />
                      <p className="mt-3 text-sm font-medium text-surface-500">{t('legal.loadingDocuments')}</p>
                    </div>
                  ) : filtered.length > 0 ? (
                    filtered.map((doc) => <DocumentRow key={doc.id} doc={doc} t={t} />)
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-100">
                        <FolderOpen className="h-6 w-6 text-surface-400" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-surface-500">{t('legal.noDocuments')}</p>
                      <p className="mt-0.5 text-xs text-surface-400">{t('legal.noDocumentsSub')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
