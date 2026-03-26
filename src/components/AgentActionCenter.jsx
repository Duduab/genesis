import { Bot, CheckCircle2, Loader, AlertCircle, ArrowRight } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

const agents = [
  {
    name: 'GovReg-Agent',
    roleTKey: 'agents.roleGovReg',
    statusKey: 'working',
    statusTKey: 'agents.statusWorking',
    statusStyle: 'text-emerald-700 bg-emerald-50 ring-emerald-600/20',
    dotColor: 'bg-emerald-500',
    StatusIcon: Loader,
    iconAnim: 'animate-spin',
    gradient: 'from-genesis-600 to-genesis-400',
    tasks: 2,
    avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=GovReg&backgroundColor=4a30a8',
  },
  {
    name: 'TaxFin-Agent',
    roleTKey: 'agents.roleTaxFin',
    statusKey: 'needsApproval',
    statusTKey: 'agents.statusNeedsApproval',
    statusStyle: 'text-amber-700 bg-amber-50 ring-amber-600/20',
    dotColor: 'bg-amber-500',
    StatusIcon: AlertCircle,
    iconAnim: '',
    gradient: 'from-amber-600 to-orange-400',
    tasks: 1,
    avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=TaxFin&backgroundColor=d97706',
  },
  {
    name: 'OpsHR-Agent',
    roleTKey: 'agents.roleOpsHR',
    statusKey: 'idle',
    statusTKey: 'agents.statusIdle',
    statusStyle: 'text-surface-500 bg-surface-100 ring-surface-300/40',
    dotColor: 'bg-surface-400',
    StatusIcon: CheckCircle2,
    iconAnim: '',
    gradient: 'from-blue-600 to-cyan-400',
    tasks: 0,
    avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=OpsHR&backgroundColor=2563eb',
  },
]

export default function AgentActionCenter() {
  const { t } = useI18n()
  const pendingCount = agents.filter((a) => a.statusKey === 'needsApproval').length

  return (
    <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-surface-100 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-surface-900">{t('dashboard.actionCenter')}</h2>
          <p className="mt-0.5 text-sm text-surface-400">{t('dashboard.humanLoopPanel')}</p>
        </div>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            {pendingCount} {t('activity.pendingApprovalCount')}
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {agents.map((agent) => {
            const SIcon = agent.StatusIcon
            return (
              <div
                key={agent.name}
                className="group relative overflow-hidden rounded-xl border border-surface-200 bg-surface-50/50 p-5 transition-all hover:border-genesis-200 hover:shadow-md"
              >
                {/* Status pulse in corner */}
                <div className="absolute end-3 top-3">
                  <span className="relative flex h-3 w-3">
                    {agent.statusKey === 'working' && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span className={`relative inline-flex h-3 w-3 rounded-full ${agent.dotColor}`} />
                  </span>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center text-center">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${agent.gradient} p-0.5 shadow-lg`}>
                    <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="h-10 w-10"
                      />
                    </div>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-surface-800">{agent.name}</h3>
                  <p className="text-xs text-surface-400">{t(agent.roleTKey)}</p>

                  {/* Status pill */}
                  <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${agent.statusStyle}`}>
                    <SIcon className={`h-3 w-3 ${agent.iconAnim}`} />
                    {t(agent.statusTKey)}
                  </div>

                  {/* Task count */}
                  {agent.tasks > 0 && (
                    <p className="mt-2 text-xs text-surface-400">
                      {agent.tasks} {t('agents.tasksInQueue')}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Review Actions button */}
        <button className="btn-authora-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all active:scale-[0.98]">
          <Bot className="h-[18px] w-[18px] text-[#020617]" />
          {t('chat.reviewActions')}
          <ArrowRight className="h-4 w-4 text-[#020617]" />
        </button>
      </div>
    </div>
  )
}
