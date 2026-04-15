import { useMemo } from 'react'
import { CheckCircle2, AlertTriangle, Info, Clock, ArrowRight } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { Link } from '../router'
import { getAgentPresentation } from '../config/agentPresentation'
import { normalizeGenesisActivityStatus } from '../constants/genesisApiEnums'

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

function formatRelative(iso, locale, t) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diffMs = Date.now() - d.getTime()
  if (diffMs < 60_000) return t('topHeader.justNow')
  if (diffMs < 3_600_000) {
    const m = Math.max(1, Math.floor(diffMs / 60_000))
    return t('topHeader.minutesAgo').replaceAll('{{n}}', String(m))
  }
  const tag = locale === 'he' ? 'he-IL' : 'en-US'
  return d.toLocaleString(tag, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function mapFeedToRows(feed, homeBusinessName, locale, t) {
  return feed.slice(0, 8).map((item, idx) => {
    const norm = normalizeGenesisActivityStatus(item.status)
    let variant = 'info'
    let tag = 'inProgress'
    if (norm === 'completed') {
      variant = 'success'
      tag = 'completed'
    } else if (norm === 'error') {
      variant = 'warning'
      tag = 'actionRequired'
    } else if (norm === 'pending_approval') {
      variant = 'warning'
      tag = 'actionRequired'
    }
    const agentInfo = getAgentPresentation(item.agent_id)
    const agentLabel = agentInfo.tKey ? t(agentInfo.tKey) : item.agent_id
    return {
      key: `${item.activity_id}-${idx}`,
      agent: agentLabel,
      action: item.description || item.action,
      entity: homeBusinessName || item.business_id || '—',
      time: formatRelative(item.created_at, locale, t),
      variant,
      tag,
    }
  })
}

export default function RecentAgentActivity({ feed = null, homeBusinessName = '' }) {
  const { t, locale } = useI18n()

  const rows = useMemo(() => {
    if (Array.isArray(feed) && feed.length > 0) {
      return mapFeedToRows(feed, homeBusinessName, locale, t)
    }
    return []
  }, [feed, homeBusinessName, locale, t])

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
        {rows.length === 0 ? (
          <li className="px-5 py-8 text-center text-sm text-surface-400">{t('activity.noActivity')}</li>
        ) : (
          rows.map((item) => {
            const v = activityVariants[item.variant]
            const Icon = v.icon
            return (
              <li
                key={item.key}
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
          })
        )}
      </ul>
    </div>
  )
}
