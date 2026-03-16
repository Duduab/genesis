import { useState, useRef, useEffect } from 'react'
import { Search, Settings, Bell, Menu, CheckCircle2, PenLine, FileWarning, Receipt, X } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useRouter, Link } from '../router'

const mockUser = {
  name: 'David Abrahams',
  role: 'Administrator',
  avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=David&backgroundColor=c4b8f6',
}

const notifMeta = [
  { key: '1', icon: CheckCircle2, iconBg: 'bg-emerald-50 text-emerald-600', type: 'success' },
  { key: '2', icon: PenLine, iconBg: 'bg-amber-50 text-amber-600', type: 'action' },
  { key: '3', icon: FileWarning, iconBg: 'bg-red-50 text-red-500', type: 'warning' },
  { key: '4', icon: Receipt, iconBg: 'bg-genesis-50 text-genesis-600', type: 'info' },
]

function NotificationPanel({ open, onClose, t }) {
  const panelRef = useRef(null)
  const [readIds, setReadIds] = useState(new Set())

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  if (!open) return null

  const unreadCount = notifMeta.length - readIds.size

  const markAllRead = () => setReadIds(new Set(notifMeta.map((n) => n.key)))

  return (
    <div
      ref={panelRef}
      className="animate-slide-up-fade absolute end-0 top-full z-50 mt-2 w-[380px] overflow-hidden rounded-xl border border-surface-200 bg-white shadow-xl shadow-surface-900/8"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-surface-900">{t('topHeader.notifications')}</h3>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-genesis-600 transition-colors hover:bg-genesis-50"
            >
              {t('topHeader.markAllRead')}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="max-h-[360px] overflow-y-auto">
        {notifMeta.map((notif, i) => {
          const Icon = notif.icon
          const isRead = readIds.has(notif.key)
          return (
            <button
              key={notif.key}
              onClick={() => setReadIds((prev) => new Set([...prev, notif.key]))}
              className={`flex w-full gap-3 px-4 py-3.5 text-start transition-colors hover:bg-surface-50 ${
                !isRead ? 'bg-genesis-50/30' : ''
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${notif.iconBg}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[13px] leading-snug ${!isRead ? 'font-semibold text-surface-900' : 'font-medium text-surface-600'}`}>
                    {t(`topHeader.notif${notif.key}Title`)}
                  </p>
                  {!isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-genesis-500" />}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-surface-400">
                  {t(`topHeader.notif${notif.key}Desc`)}
                </p>
                <p className="mt-1 text-[11px] text-surface-400/70">
                  {t(`topHeader.notif${notif.key}Time`)}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-surface-100 px-4 py-2.5">
        <Link
          to="/settings"
          onClick={onClose}
          className="block w-full rounded-md py-1.5 text-center text-xs font-semibold text-genesis-600 transition-colors hover:bg-genesis-50"
        >
          {t('topHeader.viewAll')}
        </Link>
      </div>
    </div>
  )
}

export default function TopHeader({ onMenuClick }) {
  const { t } = useI18n()
  const { navigate } = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)

  const handleSettingsClick = () => {
    navigate('/settings')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-surface-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder={t('topHeader.searchPlaceholder')}
            className="h-10 w-72 rounded-lg border border-surface-200 bg-surface-50 ps-10 pe-4 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100 lg:w-96"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 sm:hidden">
          <Search className="h-5 w-5" />
        </button>

        {/* Settings */}
        <button
          onClick={handleSettingsClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
        >
          <Settings className="h-[18px] w-[18px]" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 ${notifOpen ? 'bg-surface-100 text-surface-700' : ''}`}
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute end-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
          </button>

          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} t={t} />
        </div>

        <div className="mx-2 hidden h-8 w-px bg-surface-200 sm:block" />

        <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-100">
          <img
            src={mockUser.avatar}
            alt={mockUser.name}
            className="h-8 w-8 rounded-full bg-genesis-100 object-cover ring-2 ring-genesis-200"
          />
          <div className="hidden text-start sm:block">
            <p className="text-sm font-semibold leading-tight text-surface-800">{mockUser.name}</p>
            <p className="text-xs text-surface-400">{t('topHeader.roleAdministrator')}</p>
          </div>
        </button>
      </div>
    </header>
  )
}
