import {
  LayoutDashboard,
  Building2,
  Activity,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ClipboardCheck,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { Link } from '../router'

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose, activePage }) {
  const { t } = useI18n()
  const navItems = [
    { label: t('sidebar.dashboard'), icon: LayoutDashboard, href: '/dashboard', key: 'dashboard' },
    { label: t('sidebar.myEntities'), icon: Building2, href: '/businesses', key: 'entities' },
    { label: t('sidebar.approvals'), icon: ClipboardCheck, href: '/approvals', key: 'approvals' },
    { label: t('sidebar.agentActivity'), icon: Activity, href: '/activity', key: 'activity' },
    { label: t('sidebar.legalCompliance'), icon: ShieldCheck, href: '/legal', key: 'legal' },
    { label: t('sidebar.settings'), icon: Settings, href: '/settings', key: 'settings' },
  ]
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed top-0 start-0 z-50 flex h-screen flex-col border-e border-surface-200 bg-white
          transition-all duration-300 ease-in-out
          lg:relative
          ${collapsed ? 'w-[72px]' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full lg:ltr:translate-x-0 lg:rtl:translate-x-0'}
        `}
      >
        <div className={`flex h-16 items-center border-b border-surface-200 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center overflow-hidden">
            {collapsed ? (
              <img
                src="/logos/logo-icon.png"
                alt="Genesis Technologies"
                className="h-9 w-auto shrink-0 object-contain"
                style={{ aspectRatio: 'auto' }}
              />
            ) : (
              <img
                src="/logos/logo-primary.png"
                alt="Genesis Technologies"
                className="h-10 w-auto object-contain"
                style={{ aspectRatio: 'auto' }}
              />
            )}
          </div>

          <button
            onClick={onMobileClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-surface-400 hover:bg-surface-100 hover:text-surface-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.key
              return (
                <li key={item.key}>
                  <Link
                    to={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`
                      group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-genesis-50 text-genesis-700 shadow-sm ring-1 ring-genesis-200'
                        : 'text-surface-500 hover:bg-surface-100 hover:text-surface-800'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        isActive ? 'text-genesis-600' : 'text-surface-400 group-hover:text-surface-600'
                      }`}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className={`border-t border-surface-200 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed && (
            <div className="mb-3 rounded-lg bg-[linear-gradient(135deg,#0891b2_0%,#2563eb_50%,#7c3aed_100%)] p-3.5 text-white shadow-lg shadow-cyan-900/20">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{t('sidebar.proPlan')}</p>
              <p className="mt-1 text-sm font-medium">{`3 ${t('sidebar.agentsUsedOf')} 5 ${t('sidebar.agentsUsedLabel')}`}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
                <div className="h-full w-3/5 rounded-full bg-white" />
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="hidden h-9 w-full items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors lg:flex"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </aside>
    </>
  )
}
