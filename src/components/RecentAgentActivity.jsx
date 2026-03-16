import { CheckCircle2, AlertTriangle, Info, Clock, ArrowRight } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { Link } from '../router'

const activityVariants = {
  success: {
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
    iconColor: 'text-emerald-500',
    ring: 'ring-emerald-500/20',
  },
  warning: {
    icon: AlertTriangle,
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700',
    iconColor: 'text-amber-500',
    ring: 'ring-amber-500/20',
  },
  info: {
    icon: Info,
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700',
    iconColor: 'text-blue-500',
    ring: 'ring-blue-500/20',
  },
}

const tagMap = {
  completed: 'activity.tagCompleted',
  actionRequired: 'activity.tagActionRequired',
  newResults: 'activity.tagNewResults',
  inProgress: 'activity.tagInProgress',
}

const activities = [
  {
    agent: 'GovReg-Agent',
    action: 'Generated Articles of Association',
    entity: 'Acme Technologies Ltd.',
    time: '3 min ago',
    variant: 'success',
    tag: 'completed',
  },
  {
    agent: 'TaxFin-Agent',
    action: 'Awaiting your lease agreement',
    entity: 'Nova Digital Solutions',
    time: '12 min ago',
    variant: 'warning',
    tag: 'actionRequired',
  },
  {
    agent: 'OpsHR-Agent',
    action: 'Found 3 candidate profiles',
    entity: 'Meridian Consulting LLC',
    time: '28 min ago',
    variant: 'info',
    tag: 'newResults',
  },
  {
    agent: 'GovReg-Agent',
    action: 'Submitted annual report to registrar',
    entity: 'Acme Technologies Ltd.',
    time: '1 hr ago',
    variant: 'success',
    tag: 'completed',
  },
  {
    agent: 'TaxFin-Agent',
    action: 'VAT registration filed — pending approval',
    entity: 'Nova Digital Solutions',
    time: '2 hrs ago',
    variant: 'info',
    tag: 'inProgress',
  },
  {
    agent: 'OpsHR-Agent',
    action: 'Employee onboarding checklist ready',
    entity: 'Quantum Ventures Inc.',
    time: '4 hrs ago',
    variant: 'success',
    tag: 'completed',
  },
]

export default function RecentAgentActivity() {
  const { t } = useI18n()
  return (
    <div className="flex h-full flex-col rounded-xl border border-surface-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-surface-100 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-surface-900">{t('dashboard.recentActivity')}</h2>
          <p className="mt-0.5 text-sm text-surface-400">{t('activity.subtitle')}</p>
        </div>
        <Link
          to="/activity"
          className="group flex items-center gap-1 text-sm font-medium text-genesis-600 transition-colors hover:text-genesis-700"
        >
          {t('dashboard.viewAll')}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <ul className="flex-1 divide-y divide-surface-100 overflow-y-auto">
        {activities.map((item, idx) => {
          const v = activityVariants[item.variant]
          const Icon = v.icon
          return (
            <li
              key={idx}
              className="group flex gap-3.5 px-5 py-3.5 transition-colors hover:bg-surface-50/60"
            >
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ${v.ring} bg-white`}>
                <Icon className={`h-4 w-4 ${v.iconColor}`} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-snug text-surface-800">
                    <span className="font-semibold">{item.agent}:</span>{' '}
                    <span className="text-surface-600">{item.action}</span>
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${v.badge}`}
                  >
                    {t(tagMap[item.tag])}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-surface-400">
                  <span className="truncate">{item.entity}</span>
                  <span className="text-surface-300">·</span>
                  <span className="flex shrink-0 items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
