import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Search,
  Settings,
  Bell,
  Menu,
  CheckCircle2,
  PenLine,
  Receipt,
  X,
  Building2,
  Info,
  Loader2,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useRouter, Link } from '../router'
import { useActiveBusiness } from '../context/ActiveBusinessContext'
import { useNotifications } from '../hooks/useNotifications'

const mockUser = {
  name: 'David Abrahams',
  role: 'Administrator',
  avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=David&backgroundColor=c4b8f6',
}

function notifVisual(type) {
  switch (type) {
    case 'approval_required':
      return { Icon: PenLine, iconBg: 'bg-amber-50 text-amber-600' }
    case 'stage_completed':
      return { Icon: CheckCircle2, iconBg: 'bg-emerald-50 text-emerald-600' }
    case 'document_ready':
      return { Icon: Receipt, iconBg: 'bg-genesis-50 text-genesis-600' }
    case 'system':
      return { Icon: Info, iconBg: 'bg-blue-50 text-blue-600' }
    default:
      return { Icon: Bell, iconBg: 'bg-surface-100 text-surface-500' }
  }
}

function formatNotifTime(iso, locale, t) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diffMs = Date.now() - d.getTime()
  if (diffMs < 60_000) return t('topHeader.justNow')
  if (diffMs < 3_600_000) {
    const m = Math.max(1, Math.floor(diffMs / 60_000))
    return t('topHeader.minutesAgo').replaceAll('{{n}}', String(m))
  }
  const tag = locale === 'he' ? 'he-IL' : 'en-US'
  return d.toLocaleString(tag, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function NotificationPanel({
  open,
  onClose,
  t,
  locale,
  items,
  loading,
  error,
  effectiveUnread,
  isItemUnread,
  markRead,
  markAllRead,
}) {
  const panelRef = useRef(null)

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [items])

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="animate-slide-up-fade absolute end-0 top-full z-50 mt-2 w-[380px] overflow-hidden rounded-xl border border-surface-200 bg-surface-100 shadow-xl shadow-surface-900/8 dark:shadow-black/40"
    >
      <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-surface-900">{t('topHeader.notifications')}</h3>
          {effectiveUnread > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {effectiveUnread > 99 ? '99+' : effectiveUnread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {effectiveUnread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-genesis-600 transition-colors hover:bg-genesis-50"
            >
              {t('topHeader.markAllRead')}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {loading && sorted.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-surface-500">
            <Loader2 className="h-5 w-5 animate-spin text-genesis-600" aria-hidden />
          </div>
        ) : null}

        {error ? (
          <p className="px-4 py-6 text-center text-sm text-amber-800" role="alert">
            {t(error)}
          </p>
        ) : null}

        {!loading && !error && sorted.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-surface-500">{t('topHeader.notificationsEmpty')}</p>
        ) : null}

        {sorted.map((notif, i) => {
          const { Icon, iconBg } = notifVisual(notif.type)
          const unread = isItemUnread(notif)
          return (
            <button
              key={notif.notification_id}
              type="button"
              onClick={() => markRead(notif.notification_id)}
              className={`flex w-full gap-3 px-4 py-3.5 text-start transition-colors hover:bg-surface-50 ${
                unread ? 'bg-genesis-50/30' : ''
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-[13px] leading-snug ${unread ? 'font-semibold text-surface-900' : 'font-medium text-surface-600'}`}
                  >
                    {notif.title}
                  </p>
                  {unread ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-genesis-500" /> : null}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{notif.body}</p>
                <p className="mt-1 text-[11px] text-surface-400/70">{formatNotifTime(notif.created_at, locale, t)}</p>
              </div>
            </button>
          )
        })}
      </div>

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
  const { t, locale } = useI18n()
  const { navigate } = useRouter()
  const { activeViewModel } = useActiveBusiness()
  const [notifOpen, setNotifOpen] = useState(false)

  const {
    items: notifItems,
    loading: notifLoading,
    error: notifError,
    effectiveUnread,
    isItemUnread,
    markRead,
    markAllRead,
  } = useNotifications(notifOpen)

  const handleSettingsClick = () => {
    navigate('/settings')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-surface-200 bg-surface-50/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
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

        {activeViewModel ? (
          <div
            className="hidden max-w-[min(14rem,28vw)] items-center gap-2 truncate rounded-lg border border-genesis-200/80 bg-genesis-50/80 px-3 py-1.5 text-xs font-semibold text-genesis-800 md:flex"
            title={activeViewModel.name}
          >
            <Building2 className="h-3.5 w-3.5 shrink-0 text-genesis-600" aria-hidden />
            <span className="truncate">
              {t('topHeader.activeBusinessChip').replaceAll('{{name}}', activeViewModel.name)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 sm:hidden"
        >
          <Search className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={handleSettingsClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
        >
          <Settings className="h-[18px] w-[18px]" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 ${notifOpen ? 'bg-surface-100 text-surface-700' : ''}`}
            aria-expanded={notifOpen}
            aria-haspopup="true"
          >
            <Bell className="h-[18px] w-[18px]" />
            {effectiveUnread > 0 ? (
              <span className="absolute end-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-surface-50 bg-red-500 px-0.5 text-[9px] font-bold text-white dark:border-surface-100">
                {effectiveUnread > 99 ? '99+' : effectiveUnread}
              </span>
            ) : null}
          </button>

          <NotificationPanel
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
            t={t}
            locale={locale}
            items={notifItems}
            loading={notifLoading}
            error={notifError}
            effectiveUnread={effectiveUnread}
            isItemUnread={isItemUnread}
            markRead={markRead}
            markAllRead={markAllRead}
          />
        </div>

        <div className="mx-2 hidden h-8 w-px bg-surface-200 sm:block" />

        <button type="button" className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-100">
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
