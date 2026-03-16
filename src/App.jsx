import { useState } from 'react'
import DashboardLayout from './layouts/DashboardLayout'
import ActiveEntities from './components/ActiveEntities'
import RecentAgentActivity from './components/RecentAgentActivity'
import AgentActionCenter from './components/AgentActionCenter'
import WeeklyTasksChart from './components/WeeklyTasksChart'
import EntityStatusChart from './components/EntityStatusChart'
import OrchestratorChat from './components/OrchestratorChat'
import MyEntitiesPage from './pages/MyEntitiesPage'
import LegalCompliancePage from './pages/LegalCompliancePage'
import SettingsPage from './pages/SettingsPage'
import AgentActivityPage from './pages/AgentActivityPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LandingPage from './pages/LandingPage'
import { Activity, Building2, ShieldCheck, TrendingUp, MessageSquareText } from 'lucide-react'
import { useI18n } from './i18n/I18nContext'
import { useRouter } from './router'

const statsMeta = [
  { tKey: 'dashboard.statAgents', value: '3', changeTKey: 'dashboard.statChangeWeek', icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
  { tKey: 'dashboard.statEntities', value: '12', changeTKey: 'dashboard.statChangeMonth', icon: Building2, color: 'text-genesis-600 bg-genesis-50' },
  { tKey: 'dashboard.statCompliance', value: '98%', changeTKey: 'dashboard.statChangeExcellent', icon: ShieldCheck, color: 'text-amber-600 bg-amber-50' },
  { tKey: 'dashboard.statRevenue', value: '+24%', changeTKey: 'dashboard.statChangeVsQuarter', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
]

function DashboardPage() {
  const { t } = useI18n()
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-surface-900">{t('dashboard.welcome')}</h1>
        <p className="mt-1 text-sm text-surface-500">{t('dashboard.welcomeSub')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
    </div>
  )
}

export default function App() {
  const { page } = useRouter()
  const [chatOpen, setChatOpen] = useState(false)

  const openChat = () => setChatOpen(true)

  if (page === 'landing') return <LandingPage />
  if (page === 'login') return <LoginPage />
  if (page === 'register') return <RegisterPage />

  const renderPage = () => {
    switch (page) {
      case 'entities':
        return <MyEntitiesPage onOpenChat={openChat} />
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

      <button
        onClick={openChat}
        className={`fixed bottom-6 end-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-genesis-600 to-genesis-500 text-white shadow-xl shadow-genesis-600/30 transition-all hover:scale-105 hover:shadow-genesis-600/40 active:scale-95 animate-glow-pulse ${
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
