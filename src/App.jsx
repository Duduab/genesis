import { useState } from 'react'
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
import { Activity, Building2, ShieldCheck, TrendingUp, MessageSquareText, Trophy, Clock, DollarSign, CheckCircle2, AlertTriangle, ArrowDownRight } from 'lucide-react'
import { useI18n } from './i18n/I18nContext'
import { useRouter } from './router'
import { useAuth } from './auth/AuthContext'
import { useActiveBusiness } from './context/ActiveBusinessContext'

const statsMeta = [
  { tKey: 'dashboard.statAgents', value: '3', changeTKey: 'dashboard.statChangeWeek', icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
  { tKey: 'dashboard.statEntities', value: '12', changeTKey: 'dashboard.statChangeMonth', icon: Building2, color: 'text-genesis-600 bg-genesis-50' },
  { tKey: 'dashboard.statCompliance', value: '98%', changeTKey: 'dashboard.statChangeExcellent', icon: ShieldCheck, color: 'text-amber-600 bg-amber-50' },
  { tKey: 'dashboard.statRevenue', value: '+24%', changeTKey: 'dashboard.statChangeVsQuarter', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
]

function DashboardPage() {
  const { t } = useI18n()
  const { activeViewModel } = useActiveBusiness()
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
          <RecentAgentActivity />
        </div>
      </div>

      <div className="mt-6 grid animate-slide-up-fade grid-cols-1 items-start gap-5 lg:grid-cols-5" style={{ animationDelay: '350ms' }}>
        <div className="lg:col-span-2">
          <AgentActionCenter />
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <WeeklyTasksChart />
            <EntityStatusChart />
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

export default function App() {
  const { page, navigate } = useRouter()
  const { isAuthenticated } = useAuth()
  const [chatOpen, setChatOpen] = useState(false)
  const [addBusinessOpen, setAddBusinessOpen] = useState(false)

  const openChat = () => setChatOpen(true)
  const openAddBusiness = () => setAddBusinessOpen(true)

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
      case 'settings':
        return <SettingsPage />
      case 'dashboard':
      default:
        return <DashboardPage />
    }
  }

  return (
    <DashboardLayout activePage={page}>
      <div key={page} className="animate-fade-in">
        {renderPage()}
      </div>

      <OrchestratorChat open={chatOpen} onClose={() => setChatOpen(false)} />

      <AddBusinessWizardModal open={addBusinessOpen} onClose={() => setAddBusinessOpen(false)} />

      <button
        onClick={openChat}
        className={`btn-authora-gradient btn-authora-gradient--on-dark fixed bottom-6 end-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl transition-all hover:scale-105 active:scale-95 animate-glow-pulse ${
          chatOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <MessageSquareText className="h-6 w-6" />
        <span className="absolute -end-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
          2
        </span>
      </button>
    </DashboardLayout>
  )
}
