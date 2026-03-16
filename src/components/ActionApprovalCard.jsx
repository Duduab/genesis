import { useState } from 'react'
import {
  FileCheck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Briefcase,
  Calendar,
  Banknote,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

const statusConfig = {
  pending: {
    tKey: 'chat.pendingApproval',
    style: 'bg-amber-50 text-amber-700 ring-amber-500/20',
    icon: Clock,
  },
  approved: {
    tKey: 'chat.approvedSigned',
    style: 'bg-emerald-50 text-emerald-700 ring-emerald-500/20',
    icon: CheckCircle2,
  },
  rejected: {
    tKey: 'chat.rejected',
    style: 'bg-red-50 text-red-700 ring-red-500/20',
    icon: XCircle,
  },
}

const categoryIcons = {
  contract: FileCheck,
  compliance: ShieldCheck,
  document: FileText,
  alert: AlertTriangle,
}

export default function ActionApprovalCard({ data, onAction }) {
  const { t } = useI18n()
  const [status, setStatus] = useState(data.status || 'pending')
  const isPending = status === 'pending'
  const statusInfo = statusConfig[status]
  const StatusIcon = statusInfo.icon
  const CategoryIcon = categoryIcons[data.category] || FileCheck

  const handleApprove = () => {
    setStatus('approved')
    onAction?.('approved', data.id)
  }

  const handleReject = () => {
    setStatus('rejected')
    onAction?.('rejected', data.id)
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${isPending ? 'bg-gradient-to-r from-amber-400 to-amber-500' : status === 'approved' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-genesis-50 ring-1 ring-genesis-200/60">
              <CategoryIcon className="h-[18px] w-[18px] text-genesis-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold leading-snug text-surface-900">
                {data.title}
              </h3>
              <p className="mt-0.5 text-[11px] text-surface-400">{data.agent} · {data.entity}</p>
            </div>
          </div>
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusInfo.style}`}>
            <StatusIcon className="h-3 w-3" />
            {t(statusInfo.tKey)}
          </span>
        </div>

        {/* Document details */}
        <div className="mt-3.5 rounded-lg border border-surface-100 bg-surface-50/70 p-3">
          <div className="grid grid-cols-2 gap-2.5">
            {data.details.map((detail) => {
              const DIcon = detail.icon
              return (
                <div key={detail.label} className="flex items-start gap-2">
                  <DIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-surface-400" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-surface-400">{detail.label}</p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-surface-700">{detail.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
          {data.summary && (
            <p className="mt-2.5 border-t border-surface-200 pt-2.5 text-xs leading-relaxed text-surface-500">
              {data.summary}
            </p>
          )}
        </div>

        {/* Action buttons */}
        {isPending ? (
          <div className="mt-3.5 flex gap-2">
            <button
              onClick={handleApprove}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t('chat.approveSign')}
            </button>
            <button
              onClick={handleReject}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98]"
            >
              <XCircle className="h-3.5 w-3.5" />
              {t('chat.rejectModify')}
            </button>
          </div>
        ) : (
          <div className={`mt-3.5 flex items-center gap-2 rounded-lg px-3 py-2 ${status === 'approved' ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <StatusIcon className={`h-4 w-4 ${status === 'approved' ? 'text-emerald-600' : 'text-red-500'}`} />
            <p className={`text-xs font-medium ${status === 'approved' ? 'text-emerald-700' : 'text-red-700'}`}>
              {status === 'approved'
                ? t('chat.approvedMessage')
                : t('chat.rejectedMessage')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export const mockActionCards = [
  {
    id: 'ac-1',
    category: 'contract',
    title: 'Approval Required: Employment Contract',
    agent: 'OpsHR-Agent',
    entity: 'Apex Dynamics Ltd.',
    status: 'pending',
    summary: 'Standard employment agreement generated from template. Includes 30-day probation clause, IP assignment, and non-compete for 12 months.',
    details: [
      { label: 'Role', value: 'Head Chef', icon: Briefcase },
      { label: 'Salary', value: '9,000 ILS net/mo', icon: Banknote },
      { label: 'Start Date', value: '01/04/2026', icon: Calendar },
      { label: 'Employee', value: 'Daniel Cohen', icon: User },
    ],
  },
  {
    id: 'ac-2',
    category: 'compliance',
    title: 'Approval Required: VAT Registration Filing',
    agent: 'TaxFin-Agent',
    entity: 'Apex Dynamics Ltd.',
    status: 'pending',
    summary: 'VAT registration form prepared for submission to the Tax Authority. Projected annual turnover exceeds reporting threshold.',
    details: [
      { label: 'Filing Type', value: 'VAT Registration', icon: FileText },
      { label: 'Authority', value: 'Israel Tax Authority', icon: ShieldCheck },
      { label: 'Est. Turnover', value: '₪1,200,000/yr', icon: Banknote },
      { label: 'Due By', value: '15/04/2026', icon: Calendar },
    ],
  },
]
