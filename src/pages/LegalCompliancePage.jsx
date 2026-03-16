import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
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
  Home,
  Receipt,
  FolderOpen,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  File,
} from 'lucide-react'

const categories = [
  { key: 'all', tKey: 'legal.allDocs', icon: FolderOpen, count: 14 },
  { key: 'incorporation', tKey: 'legal.incorporation', icon: Landmark, count: 4 },
  { key: 'employment', tKey: 'legal.employment', icon: Briefcase, count: 3 },
  { key: 'leases', tKey: 'legal.leases', icon: Home, count: 3 },
  { key: 'tax', tKey: 'legal.taxFilings', icon: Receipt, count: 4 },
]

const statusConfig = {
  Signed: {
    style: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    icon: CheckCircle2,
    tKey: 'legal.statusSigned',
  },
  'Awaiting Signature': {
    style: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    icon: AlertCircle,
    tKey: 'legal.statusAwaiting',
  },
  Draft: {
    style: 'bg-surface-100 text-surface-500 ring-surface-400/20',
    icon: Clock,
    tKey: 'legal.statusDraft',
  },
}

const fileIcons = {
  pdf: { icon: FileText, color: 'text-red-500 bg-red-50 ring-red-200/60' },
  docx: { icon: FileType2, color: 'text-blue-500 bg-blue-50 ring-blue-200/60' },
  generic: { icon: File, color: 'text-surface-400 bg-surface-100 ring-surface-200/60' },
}

const documents = [
  {
    id: 1,
    title: 'Articles of Association — Alpha Tech Ltd.',
    category: 'incorporation',
    fileType: 'pdf',
    date: 'Jan 15, 2024',
    entity: 'Alpha Tech Ltd.',
    status: 'Signed',
    agent: 'GovReg-Agent',
    size: '2.4 MB',
  },
  {
    id: 2,
    title: 'Certificate of Incorporation — Alpha Tech Ltd.',
    category: 'incorporation',
    fileType: 'pdf',
    date: 'Jan 18, 2024',
    entity: 'Alpha Tech Ltd.',
    status: 'Signed',
    agent: 'GovReg-Agent',
    size: '1.1 MB',
  },
  {
    id: 3,
    title: 'Employment Contract — Daniel Cohen (Chef)',
    category: 'employment',
    fileType: 'docx',
    date: 'Mar 14, 2026',
    entity: 'Apex Dynamics Ltd.',
    status: 'Awaiting Signature',
    agent: 'OpsHR-Agent',
    size: '340 KB',
  },
  {
    id: 4,
    title: 'Lease Agreement — Rothschild 45, Tel Aviv',
    category: 'leases',
    fileType: 'pdf',
    date: 'Feb 28, 2026',
    entity: 'Meridian Consulting LLC',
    status: 'Signed',
    agent: 'TaxFin-Agent',
    size: '5.8 MB',
  },
  {
    id: 5,
    title: 'VAT Registration Form — Apex Dynamics Ltd.',
    category: 'tax',
    fileType: 'pdf',
    date: 'Mar 16, 2026',
    entity: 'Apex Dynamics Ltd.',
    status: 'Awaiting Signature',
    agent: 'TaxFin-Agent',
    size: '890 KB',
  },
  {
    id: 6,
    title: 'Annual Tax Return 2025 — Alpha Tech Ltd.',
    category: 'tax',
    fileType: 'pdf',
    date: 'Mar 01, 2026',
    entity: 'Alpha Tech Ltd.',
    status: 'Signed',
    agent: 'TaxFin-Agent',
    size: '1.7 MB',
  },
  {
    id: 7,
    title: 'Shareholder Agreement — Nova Digital Solutions',
    category: 'incorporation',
    fileType: 'docx',
    date: 'Mar 10, 2025',
    entity: 'Nova Digital Solutions',
    status: 'Signed',
    agent: 'GovReg-Agent',
    size: '410 KB',
  },
  {
    id: 8,
    title: 'NDA Template — Meridian Consulting LLC',
    category: 'employment',
    fileType: 'docx',
    date: 'Sep 05, 2023',
    entity: 'Meridian Consulting LLC',
    status: 'Draft',
    agent: 'OpsHR-Agent',
    size: '180 KB',
  },
  {
    id: 9,
    title: 'Office Lease — Herzl 12, Haifa',
    category: 'leases',
    fileType: 'pdf',
    date: 'Aug 20, 2023',
    entity: 'Alpha Tech Ltd.',
    status: 'Signed',
    agent: 'TaxFin-Agent',
    size: '4.2 MB',
  },
  {
    id: 10,
    title: 'Employee Handbook — Alpha Tech Ltd.',
    category: 'employment',
    fileType: 'docx',
    date: 'Feb 12, 2024',
    entity: 'Alpha Tech Ltd.',
    status: 'Draft',
    agent: 'OpsHR-Agent',
    size: '950 KB',
  },
  {
    id: 11,
    title: 'Articles of Association — Apex Dynamics Ltd.',
    category: 'incorporation',
    fileType: 'pdf',
    date: 'Mar 12, 2026',
    entity: 'Apex Dynamics Ltd.',
    status: 'Signed',
    agent: 'GovReg-Agent',
    size: '2.1 MB',
  },
  {
    id: 12,
    title: 'Sublease Agreement — Allenby 88, Tel Aviv',
    category: 'leases',
    fileType: 'pdf',
    date: 'Nov 03, 2025',
    entity: 'Nova Digital Solutions',
    status: 'Signed',
    agent: 'TaxFin-Agent',
    size: '3.6 MB',
  },
  {
    id: 13,
    title: 'Quarterly VAT Report Q4 2025 — Meridian',
    category: 'tax',
    fileType: 'pdf',
    date: 'Jan 15, 2026',
    entity: 'Meridian Consulting LLC',
    status: 'Signed',
    agent: 'TaxFin-Agent',
    size: '1.3 MB',
  },
  {
    id: 14,
    title: 'Tax Advance Payment Receipt — Alpha Tech',
    category: 'tax',
    fileType: 'pdf',
    date: 'Mar 10, 2026',
    entity: 'Alpha Tech Ltd.',
    status: 'Draft',
    agent: 'TaxFin-Agent',
    size: '220 KB',
  },
]

function DocumentRow({ doc, t }) {
  const fi = fileIcons[doc.fileType] || fileIcons.generic
  const FileIcon = fi.icon
  const st = statusConfig[doc.status]
  const StatusIcon = st.icon
  const needsSignature = doc.status === 'Awaiting Signature'

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-transparent bg-white px-5 py-3.5 transition-all hover:border-surface-200 hover:shadow-md">
      {/* File icon */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${fi.color}`}>
        <FileIcon className="h-5 w-5" />
      </div>

      {/* Info */}
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

      {/* Status */}
      <span className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset sm:inline-flex ${st.style}`}>
        <StatusIcon className="h-3 w-3" />
        {t(st.tKey)}
      </span>

      {/* Actions — visible on hover */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          title={t('legal.actionView')}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          title={t('legal.actionDownload')}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
        >
          <Download className="h-4 w-4" />
        </button>
        {needsSignature ? (
          <button className="flex h-8 items-center gap-1.5 rounded-lg bg-genesis-600 px-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-genesis-700 active:scale-[0.97]">
            <PenLine className="h-3.5 w-3.5" />
            {t('legal.actionSign')}
          </button>
        ) : (
          <button
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
  const { t } = useI18n()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = documents.filter((doc) => {
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.entity.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const totalDocs = documents.length
  const sigRequired = documents.filter((d) => d.status === 'Awaiting Signature').length
  const signedDocs = documents.filter((d) => d.status === 'Signed').length
  const draftDocs = documents.filter((d) => d.status === 'Draft').length

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header */}
      <div className="animate-fade-in flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t('legal.title')}</h1>
          <p className="mt-1 text-sm text-surface-500">{t('legal.subtitle')}</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-surface-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-genesis-50">
              <FolderOpen className="h-4 w-4 text-genesis-600" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-surface-400">{t('legal.totalDocs')}</p>
              <p className="text-lg font-bold text-surface-900">{totalDocs}</p>
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
              <p className="text-lg font-bold text-amber-700">{sigRequired}</p>
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
              <p className="text-lg font-bold text-surface-900">{signedDocs}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-100">
              <Clock className="h-4 w-4 text-surface-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-surface-400">{t('legal.drafts')}</p>
              <p className="text-lg font-bold text-surface-900">{draftDocs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Split layout */}
      <div className="mt-6 flex flex-col gap-5 lg:flex-row">
        {/* Category sidebar */}
        <div className="w-full shrink-0 lg:w-56">
          <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
            <div className="border-b border-surface-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">{t('legal.categories')}</p>
            </div>
            <nav className="p-2">
              <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
                {categories.map((cat) => {
                  const CatIcon = cat.icon
                  const isActive = activeCategory === cat.key
                  return (
                    <li key={cat.key}>
                      <button
                        onClick={() => setActiveCategory(cat.key)}
                        className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-genesis-50 text-genesis-700 shadow-sm ring-1 ring-genesis-200'
                            : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'
                        }`}
                      >
                        <CatIcon className={`h-4 w-4 shrink-0 ${isActive ? 'text-genesis-600' : 'text-surface-400'}`} />
                        <span className="flex-1 text-start">{t(cat.tKey)}</span>
                        <span className={`ms-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          isActive ? 'bg-genesis-100 text-genesis-700' : 'bg-surface-100 text-surface-400'
                        }`}>
                          {cat.count}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>

        {/* Document list */}
        <div className="min-w-0 flex-1">
          <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
            {/* List header */}
            <div className="flex flex-col gap-3 border-b border-surface-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-genesis-600" />
                <h2 className="text-sm font-bold text-surface-900">
                  {t(categories.find((c) => c.key === activeCategory)?.tKey || 'legal.documents')}
                </h2>
                <span className="rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-bold text-surface-500">
                  {filtered.length}
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

            {/* Column headers */}
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

            {/* Rows */}
            <div className="divide-y divide-surface-50 p-2">
              {filtered.length > 0 ? (
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
    </div>
  )
}
