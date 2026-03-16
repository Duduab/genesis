import { ArrowRight, Building2, MoreHorizontal } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { Link } from '../router'

const statusConfig = {
  active: { style: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', tKey: 'entities.statusActive' },
  pendingVat: { style: 'bg-amber-50 text-amber-700 ring-amber-600/20', tKey: 'entities.statusPendingVat' },
  underReview: { style: 'bg-blue-50 text-blue-700 ring-blue-600/20', tKey: 'entities.statusUnderReview' },
  dormant: { style: 'bg-surface-100 text-surface-500 ring-surface-400/20', tKey: 'entities.statusDormant' },
}

const typeMap = {
  privateCompany: 'entities.typePrivateCompany',
  llc: 'entities.typeLLC',
  corporation: 'entities.typeCorporation',
}

const gradients = [
  'from-genesis-700 via-genesis-600 to-genesis-500',
  'from-slate-800 via-slate-700 to-slate-600',
  'from-indigo-700 via-indigo-600 to-blue-500',
  'from-violet-800 via-purple-700 to-fuchsia-600',
]

const entities = [
  {
    name: 'Acme Technologies Ltd.',
    legalId: 'HP 512345678',
    status: 'active',
    type: 'privateCompany',
    agents: 2,
  },
  {
    name: 'Nova Digital Solutions',
    legalId: 'HP 523456789',
    status: 'pendingVat',
    type: 'privateCompany',
    agents: 1,
  },
  {
    name: 'Meridian Consulting LLC',
    legalId: 'HP 534567890',
    status: 'active',
    type: 'llc',
    agents: 3,
  },
  {
    name: 'Quantum Ventures Inc.',
    legalId: 'HP 545678901',
    status: 'underReview',
    type: 'corporation',
    agents: 1,
  },
]

export default function ActiveEntities() {
  const { t } = useI18n()
  return (
    <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-surface-100 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-surface-900">{t('dashboard.activeEntities')}</h2>
          <p className="mt-0.5 text-sm text-surface-400">{entities.length} {t('entities.registered')}</p>
        </div>
        <Link
          to="/entities"
          className="group flex items-center gap-1 text-sm font-medium text-genesis-600 transition-colors hover:text-genesis-700"
        >
          {t('entities.manageEntity')}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        {entities.map((entity, idx) => (
          <div
            key={entity.legalId}
            className="group relative overflow-hidden rounded-xl transition-shadow hover:shadow-lg"
          >
            {/* Card face */}
            <div className={`relative bg-gradient-to-br ${gradients[idx % gradients.length]} p-5`}>
              {/* Decorative pattern */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id={`grid-${idx}`} width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="1" cy="1" r="1" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#grid-${idx})`} />
                </svg>
              </div>

              {/* Top row */}
              <div className="relative flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <Building2 className="h-[18px] w-[18px] text-white" />
                </div>
                <button className="flex h-7 w-7 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Business name */}
              <h3 className="relative mt-4 text-[15px] font-semibold leading-tight text-white">
                {entity.name}
              </h3>

              {/* Bottom row */}
              <div className="relative mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-white/50">{t('entities.legalId')}</p>
                  <p className="mt-0.5 font-mono text-sm tracking-wide text-white/90">{entity.legalId}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${statusConfig[entity.status].style}`}
                >
                  {t(statusConfig[entity.status].tKey)}
                </span>
              </div>

              {/* Subtle bottom info bar */}
              <div className="relative mt-3.5 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-[11px] text-white/45">{t(typeMap[entity.type])}</span>
                <span className="text-[11px] text-white/45">
                  {entity.agents} {t('entities.agentsAssigned')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
