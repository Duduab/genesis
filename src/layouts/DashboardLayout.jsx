import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import TopHeader from '../components/TopHeader'
import { useI18n } from '../i18n/I18nContext'

export default function DashboardLayout({ children, activePage, topSlot = null, floatingActions = null }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useI18n()

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        activePage={activePage}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {topSlot}
          {children}

          <footer className="mt-12 flex items-center justify-center gap-2 border-t border-surface-200 pb-4 pt-6">
            <span className="text-[11px] text-surface-400">{t('footer.poweredBy')}</span>
            <img
              src="/logos/logo-specialty.png"
              alt="Genesis Technologies"
              className="h-5 w-auto object-contain opacity-40 grayscale transition-all hover:opacity-70 hover:grayscale-0"
              style={{ aspectRatio: 'auto' }}
            />
          </footer>
        </main>
        {floatingActions}
      </div>
    </div>
  )
}
