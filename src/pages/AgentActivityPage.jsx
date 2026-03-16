import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Activity,
  Filter,
  Code2,
  Copy,
  Check,
} from 'lucide-react'

const agents = {
  all: { tKey: 'activity.allAgents', color: '' },
  orchestrator: { tKey: 'activity.agentOrchestrator', gradient: 'from-genesis-600 to-genesis-400', avatar: 'Orchestrator' },
  govreg: { tKey: 'activity.agentGovReg', gradient: 'from-genesis-600 to-genesis-400', avatar: 'GovReg' },
  taxfin: { tKey: 'activity.agentTaxFin', gradient: 'from-amber-600 to-orange-400', avatar: 'TaxFin' },
  opshr: { tKey: 'activity.agentOpsHR', gradient: 'from-blue-600 to-cyan-400', avatar: 'OpsHR' },
}

const ENTITY_ALL = '__all__'
const entities = [ENTITY_ALL, 'Alpha Tech Ltd.', 'Nova Digital Solutions', 'Meridian Consulting LLC', 'Apex Dynamics Ltd.', 'Quantum Ventures Inc.']

const statusConfig = {
  Completed: { style: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', icon: CheckCircle2, tKey: 'activity.statusSuccess' },
  'Awaiting Action': { style: 'bg-amber-50 text-amber-700 ring-amber-600/20', icon: AlertCircle, tKey: 'activity.statusPending' },
  Failed: { style: 'bg-red-50 text-red-700 ring-red-600/20', icon: XCircle, tKey: 'activity.statusError' },
  'In Progress': { style: 'bg-blue-50 text-blue-700 ring-blue-600/20', icon: Clock, tKey: 'activity.statusInProgress' },
}

const activityData = [
  {
    id: 1, time: '10:42 AM', dateKey: 'today', agent: 'opshr', entity: 'Apex Dynamics Ltd.',
    action: 'Drafted Employment Contract for Daniel Cohen',
    status: 'Completed',
    payload: { type: 'employment_contract', employee: 'Daniel Cohen', role: 'Head Chef', salary: '9,000 ILS net/mo', start_date: '2026-04-01', template: 'standard_v3', clauses: ['probation_30d', 'ip_assignment', 'non_compete_12m'], generated_at: '2026-03-16T10:42:18Z', doc_id: 'DOC-2026-0341' },
  },
  {
    id: 2, time: '10:38 AM', dateKey: 'today', agent: 'taxfin', entity: 'Apex Dynamics Ltd.',
    action: 'Paused VAT registration — missing lease agreement',
    status: 'Awaiting Action',
    payload: { type: 'vat_registration', status: 'paused', reason: 'missing_document', required_doc: 'lease_agreement', entity_id: 'ENT-556789012', authority: 'Israel Tax Authority', filed_at: null, blocked_since: '2026-03-16T10:38:00Z' },
  },
  {
    id: 3, time: '10:35 AM', dateKey: 'today', agent: 'govreg', entity: 'Apex Dynamics Ltd.',
    action: 'Submitted Articles of Association to Companies Registrar',
    status: 'Completed',
    payload: { type: 'company_registration', step: 'articles_of_association', registrar: 'Israel Companies Authority', submission_id: 'REG-2026-8845', directors: ['David Abrahams'], share_capital: '10,000 ILS', submitted_at: '2026-03-16T10:35:22Z' },
  },
  {
    id: 4, time: '10:31 AM', dateKey: 'today', agent: 'orchestrator', entity: 'Apex Dynamics Ltd.',
    action: 'Dispatched GovReg-Agent and TaxFin-Agent for new company setup',
    status: 'Completed',
    payload: { type: 'orchestration', action: 'parallel_dispatch', agents_dispatched: ['GovReg-Agent', 'TaxFin-Agent'], tasks: ['company_registration', 'vat_registration'], entity: 'Apex Dynamics Ltd.', triggered_by: 'user_chat', session_id: 'SESS-2026-0316-1030' },
  },
  {
    id: 5, time: '09:15 AM', dateKey: 'today', agent: 'taxfin', entity: 'Alpha Tech Ltd.',
    action: 'Generated quarterly VAT report Q1 2026',
    status: 'Completed',
    payload: { type: 'vat_report', quarter: 'Q1-2026', total_revenue: '₪312,000', total_vat: '₪53,040', net_payable: '₪18,200', filing_deadline: '2026-04-15', status: 'draft_ready', doc_id: 'DOC-2026-0339' },
  },
  {
    id: 6, time: '09:02 AM', dateKey: 'today', agent: 'opshr', entity: 'Meridian Consulting LLC',
    action: 'Sourced 3 candidate profiles for Senior Developer role',
    status: 'Completed',
    payload: { type: 'recruitment_search', role: 'Senior Developer', candidates_found: 3, sources: ['LinkedIn', 'Indeed'], filters: { experience: '5+ years', stack: ['React', 'Node.js', 'TypeScript'], location: 'Tel Aviv' }, search_duration_ms: 4200 },
  },
  {
    id: 7, time: '08:45 AM', dateKey: 'today', agent: 'govreg', entity: 'Nova Digital Solutions',
    action: 'Annual report submission failed — registrar API timeout',
    status: 'Failed',
    payload: { type: 'annual_report', entity_id: 'ENT-523456789', error: 'REGISTRAR_API_TIMEOUT', error_code: 502, retry_count: 3, max_retries: 5, next_retry: '2026-03-16T09:15:00Z', endpoint: 'https://api.companies.gov.il/v2/annual-reports' },
  },
  {
    id: 8, time: '08:30 AM', dateKey: 'today', agent: 'taxfin', entity: 'Alpha Tech Ltd.',
    action: 'Auto-approved vendor payment to CloudHost IL (₪320)',
    status: 'Completed',
    payload: { type: 'payment_approval', vendor: 'CloudHost IL', amount: '₪320', currency: 'ILS', auto_approved: true, threshold: '₪500', category: 'hosting', recurring: true, invoice_id: 'INV-CH-2026-0316' },
  },
  {
    id: 9, time: '07:55 AM', dateKey: 'today', agent: 'orchestrator', entity: 'Alpha Tech Ltd.',
    action: 'Morning compliance check — all entities passed',
    status: 'Completed',
    payload: { type: 'compliance_sweep', entities_checked: 6, passed: 6, failed: 0, warnings: 1, warning_details: [{ entity: 'Nova Digital Solutions', issue: 'VAT registration pending > 30 days' }], duration_ms: 1850, next_scheduled: '2026-03-17T07:55:00Z' },
  },
  {
    id: 10, time: '11:30 PM', dateKey: 'yesterday', agent: 'opshr', entity: 'Alpha Tech Ltd.',
    action: 'Published job post for Marketing Manager on LinkedIn',
    status: 'Awaiting Action',
    payload: { type: 'job_posting', role: 'Marketing Manager', platform: 'LinkedIn', status: 'pending_review', draft_url: 'https://linkedin.com/jobs/draft/12345', salary_range: '₪18,000-₪25,000', location: 'Tel Aviv (Hybrid)', auto_publish: false },
  },
]

function SelectDropdown({ value, onChange, options, label, t }) {
  return (
    <div className="relative">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-surface-400">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-surface-200 bg-white ps-3 pe-8 text-sm font-medium text-surface-700 outline-none transition-all focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100"
        >
          {options.map((opt) => {
            const optValue = typeof opt === 'string' ? opt : opt.value
            const optLabel = typeof opt === 'string' ? opt : (opt.tKey ? t(opt.tKey) : opt.label)
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            )
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute end-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-surface-400" />
      </div>
    </div>
  )
}

function TimelineItem({ item, t }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const st = statusConfig[item.status]
  const StatusIcon = st.icon
  const agentInfo = agents[item.agent]

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(item.payload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group relative flex gap-4 pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="absolute start-[19px] top-10 bottom-0 w-px bg-surface-200 group-last:hidden" />

      {/* Agent avatar */}
      <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${agentInfo.gradient} ring-4 ring-surface-50`}>
        <img
          src={`https://api.dicebear.com/9.x/bottts/svg?seed=${agentInfo.avatar}&backgroundColor=transparent&size=24`}
          alt={t(agentInfo.tKey)}
          className="h-5 w-5"
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="rounded-xl border border-surface-200 bg-white shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-surface-900">{t(agentInfo.tKey)}</span>
                <span className="text-surface-300">·</span>
                <span className="text-xs text-surface-400">{item.entity}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-surface-600">{item.action}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${st.style}`}>
                <StatusIcon className="h-3 w-3" />
                {t(st.tKey)}
              </span>
              <span className="hidden whitespace-nowrap text-xs text-surface-400 sm:inline">{item.time}</span>
            </div>
          </div>

          {/* Expand toggle */}
          <div className="border-t border-surface-100">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center gap-2 px-5 py-2 text-xs font-medium text-surface-400 transition-colors hover:text-genesis-600"
            >
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              <Code2 className="h-3.5 w-3.5" />
              {expanded ? t('activity.hideDetails') : t('activity.expandDetails')}
              <span className="ms-auto text-xs text-surface-400 sm:hidden">{item.time}</span>
            </button>

            {expanded && (
              <div className="border-t border-surface-100 bg-surface-50/70 px-5 py-4">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">{t('activity.rawPayload')}</p>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-600"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copied ? t('activity.copied') : t('activity.copy')}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-lg border border-surface-200 bg-white p-3.5 font-mono text-xs leading-relaxed text-surface-600">
                  {JSON.stringify(item.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgentActivityPage() {
  const { t } = useI18n()
  const [agentFilter, setAgentFilter] = useState('all')
  const [entityFilter, setEntityFilter] = useState(ENTITY_ALL)
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = activityData.filter((item) => {
    const matchAgent = agentFilter === 'all' || item.agent === agentFilter
    const matchEntity = entityFilter === ENTITY_ALL || item.entity === entityFilter
    const matchStatus = statusFilter === 'All' || item.status === statusFilter
    return matchAgent && matchEntity && matchStatus
  })

  const grouped = filtered.reduce((acc, item) => {
    const key = item.dateKey
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const totalActions = activityData.length
  const completedCount = activityData.filter((d) => d.status === 'Completed').length
  const pendingCount = activityData.filter((d) => d.status === 'Awaiting Action').length
  const failedCount = activityData.filter((d) => d.status === 'Failed').length

  return (
    <div className="mx-auto max-w-5xl">
      {/* Page header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-surface-900">{t('activity.title')}</h1>
        <p className="mt-1 text-sm text-surface-500">{t('activity.subtitle')}</p>
      </div>

      {/* Summary counters */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { tKey: 'activity.totalActions', value: totalActions, color: 'text-genesis-600', bg: 'bg-genesis-50', icon: Activity },
          { tKey: 'activity.statusSuccess', value: completedCount, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { tKey: 'activity.statusPending', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle },
          { tKey: 'activity.statusError', value: failedCount, color: 'text-red-500', bg: 'bg-red-50', icon: XCircle },
        ].map((s) => {
          const SIcon = s.icon
          return (
            <div key={s.tKey} className="rounded-xl border border-surface-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.bg}`}>
                  <SIcon className={`h-3.5 w-3.5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-surface-400">{t(s.tKey)}</p>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="mt-6 rounded-xl border border-surface-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-end gap-1.5 pb-3">
          <Filter className="h-4 w-4 text-surface-400" />
          <span className="text-xs font-semibold text-surface-500">{t('activity.filters')}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectDropdown
            label={t('activity.filterAgent')}
            value={agentFilter}
            onChange={setAgentFilter}
            options={[
              { value: 'all', tKey: 'activity.allAgents' },
              { value: 'orchestrator', tKey: 'activity.agentOrchestrator' },
              { value: 'govreg', tKey: 'activity.agentGovReg' },
              { value: 'taxfin', tKey: 'activity.agentTaxFin' },
              { value: 'opshr', tKey: 'activity.agentOpsHR' },
            ]}
            t={t}
          />
          <SelectDropdown
            label={t('activity.filterEntity')}
            value={entityFilter}
            onChange={setEntityFilter}
            options={[
              { value: ENTITY_ALL, tKey: 'activity.allEntities' },
              ...entities.slice(1).map((e) => ({ value: e, label: e })),
            ]}
            t={t}
          />
          <SelectDropdown
            label={t('activity.filterStatus')}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'All', tKey: 'activity.all' },
              { value: 'Completed', tKey: 'activity.statusSuccess' },
              { value: 'Awaiting Action', tKey: 'activity.statusPending' },
              { value: 'Failed', tKey: 'activity.statusError' },
              { value: 'In Progress', tKey: 'activity.statusInProgress' },
            ]}
            t={t}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6">
        {Object.keys(grouped).length > 0 ? (
          Object.entries(grouped).map(([dateKey, items]) => (
            <div key={dateKey} className="mb-8 last:mb-0">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-surface-500">{t(`activity.${dateKey}`)}</span>
                <div className="h-px flex-1 bg-surface-200" />
                <span className="rounded-full bg-surface-100 px-2.5 py-0.5 text-[10px] font-bold text-surface-400">
                  {items.length} {items.length === 1 ? t('activity.event') : t('activity.events')}
                </span>
              </div>
              <div className="ps-0">
                {items.map((item) => (
                  <TimelineItem key={item.id} item={item} t={t} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-300 bg-white/50 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-100">
              <Activity className="h-6 w-6 text-surface-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-surface-500">{t('activity.noActivity')}</p>
            <p className="mt-0.5 text-xs text-surface-400">{t('activity.noActivitySub')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
