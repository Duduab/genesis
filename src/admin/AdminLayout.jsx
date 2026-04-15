import { useState } from 'react'
import {
  Activity,
  ClipboardList,
  LogOut,
  Users,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ArrowLeft,
} from 'lucide-react'
import { Link, useRouter } from '../router'
import { useI18n } from '../i18n/I18nContext'
import { useTheme } from '../theme/ThemeContext'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminLayout({ active, children }) {
  const { t, locale, toggleLocale } = useI18n()
  const { dark, toggleTheme } = useTheme()
  const { navigate } = useRouter()
  const { logout } = useAdminAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { id: 'monitoring', href: '/admin/monitoring', labelKey: 'admin.navMonitoring', icon: Activity },
    { id: 'audit', href: '/admin/audit', labelKey: 'admin.navAudit', icon: ClipboardList },
    { id: 'users', href: '/admin/users', labelKey: 'admin.navUsers', icon: Users },
  ]

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={`
          fixed top-0 start-0 z-50 flex h-screen flex-col border-e border-surface-200 bg-white transition-all duration-300 ease-in-out
          lg:relative
          ${sidebarCollapsed ? 'w-[72px]' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full lg:ltr:translate-x-0 lg:rtl:translate-x-0'}
        `}
      >
        <div
          className={`flex h-16 shrink-0 items-center border-b border-surface-200 px-4 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}
        >
          <div className="flex min-w-0 items-center overflow-hidden">
            {sidebarCollapsed ? (
              <img
                src="/logos/logo-icon.png"
                alt=""
                className="h-9 w-auto shrink-0 object-contain dark:brightness-0 dark:invert"
                style={{ aspectRatio: 'auto' }}
              />
            ) : (
              <img
                src="/logos/logo-primary.png"
                alt=""
                className="h-10 w-auto max-w-[11rem] object-contain dark:brightness-0 dark:invert"
                style={{ aspectRatio: 'auto' }}
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-200 lg:hidden"
            aria-label={t('admin.closeMenu')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p
          className={`border-b border-surface-200 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 ${sidebarCollapsed ? 'sr-only' : ''}`}
        >
          {t('admin.sidebarTitle')}
        </p>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = active === item.id
              return (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    title={sidebarCollapsed ? t(item.labelKey) : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-genesis-50 text-genesis-700 shadow-sm ring-1 ring-genesis-200 dark:bg-genesis-950/40 dark:text-genesis-300 dark:ring-genesis-800'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-300 dark:hover:bg-surface-800 dark:hover:text-surface-50'
                      }
                      ${sidebarCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-colors ${
                        isActive ? 'text-genesis-600 dark:text-genesis-400' : 'text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-300'
                      }`}
                    />
                    {!sidebarCollapsed ? <span>{t(item.labelKey)}</span> : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="px-3 pb-2 lg:hidden">
          <Link
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 rounded-lg border border-surface-200 py-2.5 text-xs font-semibold text-surface-700 transition-colors hover:bg-genesis-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-genesis-950/30"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
            {t('admin.backToApp')}
          </Link>
        </div>

        <div className={`mt-auto border-t border-surface-200 p-3 ${sidebarCollapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!sidebarCollapsed ? (
            <button
              type="button"
              onClick={handleLogout}
              className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-surface-200 px-3 py-2.5 text-sm font-semibold text-surface-700 transition-colors hover:bg-red-50 hover:text-red-800 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-red-950/30 dark:hover:text-red-200"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              {t('admin.logout')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              title={t('admin.logout')}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-surface-200 text-surface-600 transition-colors hover:bg-red-50 hover:text-red-800 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            className="hidden h-9 w-full items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-200 lg:flex"
            aria-label={sidebarCollapsed ? t('admin.expandSidebar') : t('admin.collapseSidebar')}
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5 rtl:rotate-180" /> : <ChevronLeft className="h-5 w-5 rtl:rotate-180" />}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-surface-50">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-surface-200 bg-white/4 px-4 backdrop-blur-md dark:border-surface-100 dark:!bg-surface-50 dark:backdrop-blur-none sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-800 dark:hover:bg-surface-800 dark:hover:text-surface-100 lg:hidden"
            aria-label={t('admin.openMenu')}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="min-w-0 truncate text-lg font-bold text-surface-900 dark:text-surface-50 lg:text-xl">
            {t('admin.sidebarTitle')}
          </h1>
          <div className="ms-auto flex shrink-0 items-center gap-2">
            <Link
              to="/dashboard"
              className="hidden items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-2 text-xs font-semibold text-surface-700 transition-colors hover:border-genesis-300 hover:bg-genesis-50/50 hover:text-genesis-800 dark:border-surface-600 dark:text-surface-200 dark:hover:border-genesis-700 dark:hover:bg-genesis-950/30 dark:hover:text-genesis-200 sm:inline-flex"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
              {t('admin.backToApp')}
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 text-surface-600 transition-colors hover:bg-surface-100 dark:border-surface-600 dark:text-surface-300 dark:hover:bg-surface-800"
              aria-label={dark ? t('admin.themeLight') : t('admin.themeDark')}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={toggleLocale}
              className="rounded-lg border border-surface-200 px-2.5 py-1.5 text-xs font-semibold text-surface-600 transition-colors hover:bg-surface-100 dark:border-surface-600 dark:text-surface-300 dark:hover:bg-surface-800"
            >
              {locale === 'en' ? 'עברית' : 'English'}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
          <footer className="mx-auto mt-12 flex max-w-7xl items-center justify-center gap-2 border-t border-surface-200 pb-6 pt-8 dark:border-surface-800">
            <span className="text-[11px] text-surface-400">{t('footer.poweredBy')}</span>
            <img
              src="/logos/logo-specialty.png"
              alt=""
              className="h-5 w-auto object-contain opacity-40 grayscale transition-all hover:opacity-70 hover:grayscale-0 dark:opacity-50"
              style={{ aspectRatio: 'auto' }}
            />
          </footer>
        </main>
      </div>
    </div>
  )
}
