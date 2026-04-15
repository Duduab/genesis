import { useState, useMemo, useCallback } from 'react'
import DashboardLayout from './layouts/DashboardLayout'
import ActiveEntities from './components/ActiveEntities'
import RecentAgentActivity from './components/RecentAgentActivity'
import AgentActionCenter from './components/AgentActionCenter'
import WeeklyTasksChart from './components/WeeklyTasksChart'
import EntityStatusChart from './components/EntityStatusChart'
import OrchestratorChat from './components/OrchestratorChat'
import AddBusinessWizardModal from './components/AddBusinessWizardModal'
import MyEntitiesPage from './pages/MyEntitiesPage'
import LegalCompliancePage from './pages/LegalCompliancePage'
import SettingsPage from './pages/SettingsPage'
import AgentActivityPage from './pages/AgentActivityPage'
import AgentApprovalsPage from './pages/AgentApprovalsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RegisterStep2 from './pages/RegisterStep2'
import RegisterStep3 from './pages/RegisterStep3'
import RegisterStep4 from './pages/RegisterStep4'
import RegisterStep5 from './pages/RegisterStep5'
import LandingPage from './pages/LandingPage'
import DashboardHeader from './components/DashboardHeader'
import LiveRevenueFlowChart from './components/LiveRevenueFlowChart'
import BusinessMilestonesSection from './components/BusinessMilestonesSection'
import BusinessStagesSection from './components/BusinessStagesSection'
import { Activity, Building2, ShieldCheck, TrendingUp, Trophy, Clock, DollarSign, CheckCircle2, AlertTriangle, ArrowDownRight } from 'lucide-react'
import { useI18n } from './i18n/I18nContext'
import { useRouter } from './router'
import { useAuth } from './auth/AuthContext'
import { useActiveBusiness } from './context/ActiveBusinessContext'
import { useDashboardOverviewQuery } from './hooks/useDashboardOverviewQuery'
import { usePendingAgentApprovalsQuery } from './hooks/usePendingAgentApprovalsQuery'
import { useNotifications } from './hooks/useNotifications'
import ApprovalBanner from './components/ApprovalBanner'
import { useTheme } from './theme/ThemeContext'
import { formatNisFull } from './utils/formatNis'
import { AdminAuthProvider } from './context/AdminAuthContext'
import AdminApp from './admin/AdminApp.jsx'

function DashboardPage() {
  const { t, locale } = useI18n()
  const { activeViewModel, activeBusinessId } = useActiveBusiness()
  const { data: overview } = useDashboardOverviewQuery(activeBusinessId, { enabled: Boolean(activeBusinessId) })

  const statsMeta = useMemo(() => {
    const fmt = (n) => (n == null || Number.isNaN(Number(n)) ? '—' : String(n))
    return [
      {
        tKey: 'dashboard.statAgents',
        value: fmt(overview?.active_agents),
        changeTKey: 'dashboard.statChangeWeek',
        icon: Activity,
        color: 'text-emerald-600 bg-emerald-50',
      },
      {
        tKey: 'dashboard.statEntities',
        value: fmt(overview?.total_businesses),
        changeTKey: 'dashboard.statChangeMonth',
        icon: Building2,
        color: 'text-genesis-600 bg-genesis-50',
      },
      {
        tKey: 'dashboard.statCompliance',
        value: overview?.progress_percent != null ? `${Math.round(overview.progress_percent)}%` : '—',
        changeTKey: 'dashboard.statChangeExcellent',
        icon: ShieldCheck,
        color: 'text-amber-600 bg-amber-50',
      },
      {
        tKey: 'dashboard.statRevenue',
        value: overview?.monthly_cost_ils != null ? formatNisFull(overview.monthly_cost_ils, locale) : '—',
        changeTKey: 'dashboard.statChangeVsQuarter',
        icon: TrendingUp,
        color: 'text-blue-600 bg-blue-50',
      },
    ]
  }, [overview, locale])
  const welcomeTitle =
    activeViewModel != null
      ? t('dashboard.welcomeManaged').replaceAll('{{name}}', activeViewModel.name)
      : t('dashboard.welcome')
  const welcomeSub =
    activeViewModel != null
      ? t('dashboard.welcomeSubManaged').replaceAll('{{name}}', activeViewModel.name)
      : t('dashboard.welcomeSub')
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">{welcomeTitle}</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{welcomeSub}</p>
      </div>

      <DashboardHeader />

      <div className="mb-2 animate-fade-in">
        <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50">{t('dashboard.liveChart.sectionTitle')}</h2>
      </div>
      <LiveRevenueFlowChart />

      <div className="mt-8 animate-slide-up-fade" style={{ animationDelay: '120ms' }}>
        <BusinessMilestonesSection />
      </div>

      <div className="mt-8 animate-slide-up-fade" style={{ animationDelay: '150ms' }}>
        <BusinessStagesSection />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsMeta.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.tKey}
              className="animate-slide-up-fade rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-surface-500">{t(stat.tKey)}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-surface-900">{stat.value}</p>
              <p className="mt-1 text-xs text-surface-400">{t(stat.changeTKey)}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-6 grid animate-slide-up-fade grid-cols-1 items-start gap-5 lg:grid-cols-5" style={{ animationDelay: '200ms' }}>
        <div className="lg:col-span-3">
          <ActiveEntities />
        </div>
        <div className="lg:col-span-2">
          <RecentAgentActivity feed={overview?.recent_activity ?? null} homeBusinessName={activeViewModel?.name ?? ''} />
        </div>
      </div>

      <div className="mt-6 grid animate-slide-up-fade grid-cols-1 items-start gap-5 lg:grid-cols-5" style={{ animationDelay: '350ms' }}>
        <div className="lg:col-span-2">
          <AgentActionCenter />
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <WeeklyTasksChart />
            <EntityStatusChart statusCounts={overview?.status_counts ?? null} />
          </div>
        </div>
      </div>

      {/* Impact & Performance Metrics */}
      <div className="mt-6 animate-slide-up-fade" style={{ animationDelay: '500ms' }}>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-genesis-50 ring-1 ring-genesis-200/60">
            <Trophy className="h-4 w-4 text-genesis-600" />
          </div>
          <h2 className="text-lg font-bold text-surface-900">{t('dashboard.metrics.title')}</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Achievements */}
          <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-surface-100 px-5 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-200/60">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-surface-900">{t('dashboard.metrics.achievements')}</h3>
            </div>
            <div className="px-5 py-4">
              <ul className="flex flex-col gap-3">
                {(t('dashboard.metrics.achievementItems') || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <span className="text-sm text-surface-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Time Saved */}
          <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-surface-100 px-5 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-200/60">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-surface-900">{t('dashboard.metrics.timeSaved')}</h3>
                <p className="text-[11px] text-surface-400">{t('dashboard.metrics.efficiencyNote')}</p>
              </div>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-end gap-1.5">
                <span className="text-4xl font-bold text-blue-600">{t('dashboard.metrics.timeSavedValue')}</span>
                <span className="mb-1 text-sm font-medium text-surface-500">{t('dashboard.metrics.timeSavedUnit')}</span>
              </div>
              <p className="mt-1 text-xs text-surface-400">{t('dashboard.metrics.timeSavedLabel')}</p>

              <div className="mt-5 space-y-3">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-surface-500">{t('dashboard.metrics.timeManualLabel')}</span>
                    <span className="font-bold text-surface-600">{t('dashboard.metrics.timeManualValue')}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-100">
                    <div className="h-full rounded-full bg-surface-300" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-blue-600">Genesis</span>
                    <span className="font-bold text-blue-600">{t('dashboard.metrics.timeSavedValue')} {t('dashboard.metrics.timeSavedUnit')}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2">
                <ArrowDownRight className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">40% {t('dashboard.metrics.timeSaved').toLowerCase()}</span>
              </div>
            </div>
          </div>

          {/* Money Saved */}
          <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-surface-100 px-5 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-200/60">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-surface-900">{t('dashboard.metrics.moneySaved')}</h3>
                <p className="text-[11px] text-surface-400">{t('dashboard.metrics.efficiencyNote')}</p>
              </div>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-end gap-1.5">
                <span className="text-4xl font-bold text-emerald-600">{t('dashboard.metrics.moneySavedValue')}</span>
              </div>
              <p className="mt-1 text-xs text-surface-400">{t('dashboard.metrics.moneySavedLabel')}</p>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-surface-100 px-4 py-3">
                  <div>
                    <p className="text-xs text-surface-400">{t('dashboard.metrics.moneyManualLabel')}</p>
                    <p className="mt-0.5 text-lg font-bold text-surface-600 line-through decoration-red-400/60">{t('dashboard.metrics.moneyManualValue')}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
                    <ArrowDownRight className="h-4 w-4 rotate-180 text-red-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3">
                  <div>
                    <p className="text-xs text-emerald-600">{t('dashboard.metrics.moneyGenesisLabel')}</p>
                    <p className="mt-0.5 text-lg font-bold text-emerald-700">{t('dashboard.metrics.moneyGenesisValue')}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-amber-800">{t('dashboard.metrics.disclaimer')}</p>
        </div>
      </div>
    </div>
  )
}

const ORCHESTRATOR_FAB_LIGHT = '/orchestrator-fab.png'
/** Bump `v` when replacing the file so browsers do not keep an old cached PNG. */
const ORCHESTRATOR_FAB_DARK = '/orchestrator-fab-dark.png?v=500w'

export default function App() {
  const { t } = useI18n()
  const { dark } = useTheme()
  const { page, navigate } = useRouter()
  const { isAuthenticated } = useAuth()
  const { activeBusinessId } = useActiveBusiness()
  const { data: overview } = useDashboardOverviewQuery(activeBusinessId, {
    enabled: isAuthenticated && Boolean(activeBusinessId),
  })
  const { items: notifItems, isItemUnread } = useNotifications(false, { enabled: isAuthenticated })
  const pendingApprovalsQ = usePendingAgentApprovalsQuery({ enabled: isAuthenticated })
  const pendingBadge = useMemo(() => {
    if (pendingApprovalsQ.isSuccess) {
      return pendingApprovalsQ.data?.items?.length ?? 0
    }
    if (activeBusinessId && overview?.pending_approvals != null) {
      return Math.max(0, Math.floor(Number(overview.pending_approvals)))
    }
    return notifItems.filter((n) => n.type === 'approval_required' && isItemUnread(n)).length
  }, [pendingApprovalsQ.isSuccess, pendingApprovalsQ.data, activeBusinessId, overview, notifItems, isItemUnread])

  const [chatOpen, setChatOpen] = useState(false)
  const [addBusinessOpen, setAddBusinessOpen] = useState(false)

  const openChat = () => setChatOpen(true)
  const openAddBusiness = () => setAddBusinessOpen(true)

  const orchestratorFabSrc = dark ? ORCHESTRATOR_FAB_DARK : ORCHESTRATOR_FAB_LIGHT
  const onOrchestratorFabError = useCallback(
    (e) => {
      if (dark && e.currentTarget.src.includes('orchestrator-fab-dark')) {
        e.currentTarget.src = ORCHESTRATOR_FAB_LIGHT
      }
    },
    [dark],
  )

  if (page === 'admin') {
    return (
      <AdminAuthProvider>
        <AdminApp />
      </AdminAuthProvider>
    )
  }

  if (page === 'landing') return <LandingPage />
  if (page === 'login') return <LoginPage />
  if (page === 'register') return <RegisterPage />
  if (page === 'register/step2') return <RegisterStep2 />
  if (page === 'register/step3') return <RegisterStep3 />
  if (page === 'register/step4') return <RegisterStep4 />
  if (page === 'register/step5') return <RegisterStep5 />

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const renderPage = () => {
    switch (page) {
      case 'entities':
        return <MyEntitiesPage onOpenChat={openChat} onAddBusiness={openAddBusiness} />
      case 'legal':
        return <LegalCompliancePage />
      case 'activity':
        return <AgentActivityPage />
      case 'approvals':
        return <AgentApprovalsPage />
      case 'settings':
        return <SettingsPage />
      case 'dashboard':
        return <DashboardPage />
      default:
        return <DashboardPage />
    }
  }

  const orchestratorFab = (
    <button
      type="button"
      onClick={openChat}
      aria-label={t('chat.openOrchestratorFab')}
      className={`pointer-events-auto fixed bottom-0 left-2 z-50 mb-[env(safe-area-inset-bottom,0px)] flex aspect-square w-[min(200px,68vw)] max-w-[200px] shrink-0 items-end justify-center border-0 bg-transparent p-0 shadow-none outline-none transition-transform hover:scale-[1.03] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-genesis-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-50 dark:focus-visible:ring-offset-surface-950 sm:left-3 ${
        chatOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <img
        key={orchestratorFabSrc}
        src={orchestratorFabSrc}
        alt=""
        width={500}
        height={500}
        sizes="(max-width: 640px) 68vw, 200px"
        className="h-full w-full object-contain object-bottom select-none dark:drop-shadow-[0_0_22px_rgba(34,211,238,0.22)]"
        decoding="async"
        draggable={false}
        fetchPriority="high"
        onError={onOrchestratorFabError}
      />
      {pendingBadge > 0 ? (
        <span className="absolute end-0 top-0 z-10 flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white ring-2 ring-white dark:ring-surface-900">
          {pendingBadge > 9 ? '9+' : pendingBadge}
        </span>
      ) : null}
    </button>
  )

  return (
    <DashboardLayout
      activePage={page}
      topSlot={
        pendingBadge > 0 ? (
          <ApprovalBanner count={pendingBadge} onReview={() => navigate('/approvals')} />
        ) : null
      }
      floatingActions={orchestratorFab}
    >
      <div key={page} className="animate-fade-in">
        {renderPage()}
      </div>

      <OrchestratorChat open={chatOpen} onClose={() => setChatOpen(false)} />

      <AddBusinessWizardModal open={addBusinessOpen} onClose={() => setAddBusinessOpen(false)} />
    </DashboardLayout>
  )
}
