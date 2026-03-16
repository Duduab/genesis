import {
  Building2,
  Search,
  SlidersHorizontal,
  Plus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Bot,
  MoreHorizontal,
  Wallet,
  Flame,
  MessageSquareText,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

const statusStyles = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20', dot: 'bg-emerald-500' },
  pendingVat: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20', dot: 'bg-amber-500' },
  underReview: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-600/20', dot: 'bg-blue-500' },
  hibernating: { bg: 'bg-surface-100', text: 'text-surface-500', ring: 'ring-surface-400/20', dot: 'bg-surface-400' },
}

const typeMap = {
  privateCompany: 'entities.typePrivateCompany',
  llc: 'entities.typeLLC',
  corporation: 'entities.typeCorporation',
}

const statusMap = {
  active: 'entities.statusActive',
  pendingVat: 'entities.statusPendingVat',
  underReview: 'entities.statusUnderReview',
  hibernating: 'entities.statusHibernating',
}

const agentAvatars = [
  { name: 'GovReg', color: 'from-genesis-600 to-genesis-400', seed: 'GovReg' },
  { name: 'TaxFin', color: 'from-amber-600 to-orange-400', seed: 'TaxFin' },
  { name: 'OpsHR', color: 'from-blue-600 to-cyan-400', seed: 'OpsHR' },
]

const entities = [
  {
    id: 1,
    name: 'Alpha Tech Ltd.',
    legalId: '512345678',
    status: 'active',
    type: 'privateCompany',
    balance: '₪248,500',
    balanceTrend: 'up',
    burnRate: '₪32,100/mo',
    burnTrend: 'down',
    agents: [0, 1, 2],
    registered: 'Jan 2024',
  },
  {
    id: 2,
    name: 'Nova Digital Solutions',
    legalId: '523456789',
    status: 'pendingVat',
    type: 'privateCompany',
    balance: '₪85,200',
    balanceTrend: 'up',
    burnRate: '₪18,400/mo',
    burnTrend: 'up',
    agents: [0, 1],
    registered: 'Mar 2025',
  },
  {
    id: 3,
    name: 'Meridian Consulting LLC',
    legalId: '534567890',
    status: 'active',
    type: 'llc',
    balance: '₪412,000',
    balanceTrend: 'up',
    burnRate: '₪45,800/mo',
    burnTrend: 'down',
    agents: [0, 1, 2],
    registered: 'Aug 2023',
  },
  {
    id: 4,
    name: 'Quantum Ventures Inc.',
    legalId: '545678901',
    status: 'underReview',
    type: 'corporation',
    balance: '₪15,000',
    balanceTrend: 'down',
    burnRate: '₪6,200/mo',
    burnTrend: 'up',
    agents: [0],
    registered: 'Dec 2025',
  },
  {
    id: 5,
    name: 'Apex Dynamics Ltd.',
    legalId: '556789012',
    status: 'pendingVat',
    type: 'privateCompany',
    balance: '₪50,000',
    balanceTrend: 'up',
    burnRate: '₪0/mo',
    burnTrend: 'down',
    agents: [0, 1],
    registered: 'Mar 2026',
  },
  {
    id: 6,
    name: 'Silver Lining Corp.',
    legalId: '567890123',
    status: 'hibernating',
    type: 'corporation',
    balance: '₪3,400',
    balanceTrend: 'down',
    burnRate: '₪800/mo',
    burnTrend: 'down',
    agents: [],
    registered: 'Jun 2022',
  },
]

function EntityCard({ entity, t }) {
  const s = statusStyles[entity.status]
  const BalanceIcon = entity.balanceTrend === 'up' ? TrendingUp : TrendingDown
  const BurnIcon = entity.burnTrend === 'up' ? TrendingUp : TrendingDown

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm transition-all hover:border-genesis-200 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-0">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-genesis-50 ring-1 ring-genesis-200/60">
            <Building2 className="h-5 w-5 text-genesis-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold leading-snug text-surface-900">{entity.name}</h3>
            <p className="mt-0.5 font-mono text-xs text-surface-400">{t('entities.id')}: {entity.legalId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${s.bg} ${s.text} ${s.ring}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {t(statusMap[entity.status])}
          </span>
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-surface-400 opacity-0 transition-all hover:bg-surface-100 hover:text-surface-600 group-hover:opacity-100">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Type + registered */}
      <div className="mt-1 flex items-center gap-2 px-5">
        <span className="text-[11px] text-surface-400">{t(typeMap[entity.type])}</span>
        <span className="text-surface-300">·</span>
        <span className="text-[11px] text-surface-400">{t('entities.since')} {entity.registered}</span>
      </div>

      {/* Metrics */}
      <div className="mx-5 mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface-50 p-3">
          <div className="flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-surface-400" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-surface-400">{t('entities.balance')}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-base font-bold text-surface-900">{entity.balance}</span>
            <BalanceIcon className={`h-3.5 w-3.5 ${entity.balanceTrend === 'up' ? 'text-emerald-500' : 'text-red-400'}`} />
          </div>
        </div>
        <div className="rounded-lg bg-surface-50 p-3">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-surface-400" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-surface-400">{t('entities.burnRate')}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-base font-bold text-surface-900">{entity.burnRate}</span>
            <BurnIcon className={`h-3.5 w-3.5 ${entity.burnTrend === 'down' ? 'text-emerald-500' : 'text-red-400'}`} />
          </div>
        </div>
      </div>

      {/* Active Agents */}
      <div className="mx-5 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-3.5 w-3.5 text-surface-400" />
          <span className="text-[11px] font-medium text-surface-500">{t('entities.activeAgents')}</span>
        </div>
        {entity.agents.length > 0 ? (
          <div className="flex -space-x-2">
            {entity.agents.map((agentIdx) => {
              const agent = agentAvatars[agentIdx]
              return (
                <div
                  key={agent.name}
                  title={agent.name + '-Agent'}
                  className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${agent.color} ring-2 ring-white`}
                >
                  <img
                    src={`https://api.dicebear.com/9.x/bottts/svg?seed=${agent.seed}&backgroundColor=transparent&size=20`}
                    alt={agent.name}
                    className="h-4 w-4"
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <span className="text-[11px] italic text-surface-400">{t('entities.noneAssigned')}</span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-surface-100 px-5 py-3.5 mt-4">
        <button className="group/btn flex w-full items-center justify-center gap-2 rounded-lg border border-genesis-200 bg-genesis-50/50 px-4 py-2 text-xs font-semibold text-genesis-700 transition-all hover:bg-genesis-100 hover:shadow-sm active:scale-[0.98]">
          {t('entities.manageEntity')}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}

function CreateEntityCard({ onCreateClick, t }) {
  return (
    <button
      onClick={onCreateClick}
      className="group flex min-h-[340px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-300 bg-white/50 p-8 transition-all hover:border-genesis-400 hover:bg-genesis-50/30 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-surface-300 transition-all group-hover:border-genesis-400 group-hover:bg-genesis-100">
        <Plus className="h-7 w-7 text-surface-400 transition-colors group-hover:text-genesis-600" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-surface-600 transition-colors group-hover:text-genesis-700">
        {t('entities.createNew')}
      </h3>
      <p className="mt-1 text-xs text-surface-400 transition-colors group-hover:text-genesis-500">
        {t('entities.createNewSub')}
      </p>
      <div className="mt-4 flex items-center gap-1.5 rounded-full bg-genesis-50 px-3 py-1.5 text-[11px] font-medium text-genesis-600 opacity-0 transition-all group-hover:opacity-100">
        <MessageSquareText className="h-3.5 w-3.5" />
        {t('entities.openChat')}
      </div>
    </button>
  )
}

export default function MyEntitiesPage({ onOpenChat }) {
  const { t } = useI18n()

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header */}
      <div className="animate-fade-in flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t('entities.title')}</h1>
          <p className="mt-1 text-sm text-surface-500">{entities.length} {t('entities.registered')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder={t('entities.searchPlaceholder')}
              className="h-9 w-56 rounded-lg border border-surface-200 bg-white ps-9 pe-3 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100"
            />
          </div>
          <button className="flex h-9 items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 text-xs font-medium text-surface-600 transition-colors hover:bg-surface-50">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t('entities.filters')}
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { tKey: 'entities.totalEntities', value: entities.length, color: 'text-genesis-600' },
          { tKey: 'entities.statusActive', value: entities.filter((e) => e.status === 'active').length, color: 'text-emerald-600' },
          { tKey: 'entities.pending', value: entities.filter((e) => e.status === 'pendingVat' || e.status === 'underReview').length, color: 'text-amber-600' },
          { tKey: 'entities.statusHibernating', value: entities.filter((e) => e.status === 'hibernating').length, color: 'text-surface-500' },
        ].map((stat) => (
          <div key={stat.tKey} className="rounded-lg border border-surface-200 bg-white px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-surface-400">{t(stat.tKey)}</p>
            <p className={`mt-1 text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Entity grid */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {entities.map((entity, i) => (
          <div key={entity.id} className="animate-slide-up-fade" style={{ animationDelay: `${i * 75}ms` }}>
            <EntityCard entity={entity} t={t} />
          </div>
        ))}
        <div className="animate-slide-up-fade" style={{ animationDelay: `${entities.length * 75}ms` }}>
          <CreateEntityCard onCreateClick={onOpenChat} t={t} />
        </div>
      </div>
    </div>
  )
}
