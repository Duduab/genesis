import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
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
  FileText,
  Sparkles,
  LogOut,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useRouter, Link } from '../router'
import { useActiveBusiness } from '../context/ActiveBusinessContext'
import { useAuth } from '../auth/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import { usePendingAgentApprovalsQuery } from '../hooks/usePendingAgentApprovalsQuery'
import { fetchGlobalSearch } from '../api/genesis/searchApi'
import { isGenesisApiError } from '../api/genesis/errors'
import { genesisBusinessStatusTranslationKey } from '../constants/genesisApiEnums'

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

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(id)
  }, [value, delayMs])
  return debounced
}

function activityOrDocTitle(row) {
  if (!row || typeof row !== 'object') return '—'
  return (
    row.title ||
    row.name ||
    row.summary ||
    row.description ||
    row.activity_type ||
    row.agent_id ||
    String(row.document_id || row.activity_id || row.business_id || '') ||
    '—'
  )
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

function GlobalSearchResults({ payload, loading, errorText, t, onNavigate }) {
  const groups = useMemo(
    () => [
      { key: 'businesses', label: t('topHeader.searchGroupBusinesses'), Icon: Building2, items: payload?.businesses ?? [] },
      { key: 'documents', label: t('topHeader.searchGroupDocuments'), Icon: FileText, items: payload?.documents ?? [] },
      { key: 'activity', label: t('topHeader.searchGroupActivity'), Icon: Sparkles, items: payload?.activity ?? [] },
    ],
    [payload, t],
  )

  const total = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-surface-500">
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-genesis-600" aria-hidden />
        <span>{t('topHeader.searchLoading')}</span>
      </div>
    )
  }

  if (errorText) {
    return <p className="px-3 py-4 text-sm text-amber-800 dark:text-amber-200">{errorText}</p>
  }

  if (total === 0) {
    return <p className="px-3 py-6 text-center text-sm text-surface-500">{t('topHeader.searchEmpty')}</p>
  }

  return (
    <div className="max-h-[min(70vh,28rem)] overflow-y-auto py-1">
      {groups.map(({ key, label, Icon, items }) => {
        if (!items.length) return null
        return (
          <div key={key} className="border-b border-surface-100 last:border-0 dark:border-surface-800">
            <div className="sticky top-0 z-10 flex items-center gap-2 bg-surface-50/95 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-surface-500 backdrop-blur-sm dark:bg-surface-900/95 dark:text-surface-400">
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {label}
            </div>
            <ul className="py-0.5" role="list">
              {items.map((row, idx) => (
                <li key={`${key}-${row.business_id || row.document_id || row.activity_id || idx}`}>
                  <button
                    type="button"
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-start text-sm transition-colors hover:bg-genesis-50/80 dark:hover:bg-surface-800/80"
                    onClick={() => onNavigate(key, row)}
                  >
                    {key === 'businesses' ? (
                      <>
                        <span className="font-medium text-surface-900 dark:text-surface-100">
                          {row.entrepreneur_name || row.company_name || row.business_id}
                        </span>
                        <span className="text-xs text-surface-500">
                          {(() => {
                            const gsk = genesisBusinessStatusTranslationKey(row.global_status)
                            const gLabel = gsk ? t(gsk) : row.global_status
                            return [row.business_type, gLabel].filter(Boolean).join(' · ') || '—'
                          })()}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-surface-900 dark:text-surface-100">{activityOrDocTitle(row)}</span>
                        {row.business_id ? (
                          <span className="font-mono text-[11px] text-surface-400">business · {String(row.business_id).slice(0, 10)}…</span>
                        ) : null}
                      </>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
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
  const { activeViewModel, enterBusiness } = useActiveBusiness()
  const [notifOpen, setNotifOpen] = useState(false)
  const [globalSearchInput, setGlobalSearchInput] = useState('')
  const [searchDismissed, setSearchDismissed] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const searchWrapRef = useRef(null)
  const debouncedSearch = useDebouncedValue(globalSearchInput, 320)

  const {
    items: notifItems,
    loading: notifLoading,
    error: notifError,
    effectiveUnread,
    isItemUnread,
    markRead,
    markAllRead,
  } = useNotifications(notifOpen)

  const { isAuthenticated, logout } = useAuth()
  const { data: pendingApprovalsPayload } = usePendingAgentApprovalsQuery({ enabled: isAuthenticated })
  const pendingApprovalCount = pendingApprovalsPayload?.items?.length ?? 0
  const bellBadgeCount = effectiveUnread + pendingApprovalCount

  const searchEnabled = debouncedSearch.trim().length >= 1
  const globalSearchQ = useQuery({
    queryKey: ['globalSearch', debouncedSearch.trim()],
    queryFn: () => fetchGlobalSearch({ q: debouncedSearch.trim() }),
    enabled: searchEnabled,
    staleTime: 30_000,
  })

  const showDesktopPanel = globalSearchInput.trim().length >= 1 && !searchDismissed

  useEffect(() => {
    if (globalSearchInput.trim()) setSearchDismissed(false)
  }, [globalSearchInput])

  useEffect(() => {
    if (!showDesktopPanel) return
    function onDoc(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchDismissed(true)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [showDesktopPanel])

  useEffect(() => {
    if (!showDesktopPanel && !mobileSearchOpen) return
    function onKey(e) {
      if (e.key === 'Escape') {
        setSearchDismissed(true)
        setMobileSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showDesktopPanel, mobileSearchOpen])

  const handleSearchNavigate = useCallback(
    (groupKey, row) => {
      setSearchDismissed(true)
      setGlobalSearchInput('')
      setMobileSearchOpen(false)
      if (groupKey === 'businesses' && row?.business_id) {
        enterBusiness(row.business_id)
        navigate(`/businesses/${row.business_id}`)
        return
      }
      if (groupKey === 'documents') {
        if (row?.business_id) enterBusiness(row.business_id)
        navigate('/legal')
        return
      }
      if (groupKey === 'activity') {
        if (row?.business_id) enterBusiness(row.business_id)
        navigate('/activity')
      }
    },
    [enterBusiness, navigate],
  )

  const searchErrorText = globalSearchQ.isError
    ? isGenesisApiError(globalSearchQ.error)
      ? globalSearchQ.error.userFacingMessage(t('topHeader.searchError'), t)
      : t('topHeader.searchError')
    : null

  const searchDebouncePending =
    globalSearchInput.trim().length >= 1 && debouncedSearch.trim() !== globalSearchInput.trim()
  const searchLoading =
    searchDebouncePending || globalSearchQ.isPending || (globalSearchQ.isFetching && !globalSearchQ.data)

  const handleSettingsClick = () => {
    navigate('/settings')
  }

  const handleLogout = useCallback(async () => {
    setNotifOpen(false)
    setMobileSearchOpen(false)
    await logout()
    navigate('/login')
  }, [logout, navigate])

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-surface-200 bg-surface-50/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden sm:block" ref={searchWrapRef}>
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder={t('topHeader.searchPlaceholder')}
            autoComplete="off"
            value={globalSearchInput}
            onChange={(e) => setGlobalSearchInput(e.target.value)}
            onFocus={() => setSearchDismissed(false)}
            aria-expanded={showDesktopPanel}
            aria-haspopup="listbox"
            aria-controls="global-search-results"
            className="h-10 w-72 rounded-lg border border-surface-200 bg-surface-50 ps-10 pe-4 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100 lg:w-96 dark:bg-surface-900 dark:text-surface-100 dark:border-surface-700"
          />
          {showDesktopPanel ? (
            <div
              id="global-search-results"
              role="listbox"
              className="animate-slide-up-fade absolute start-0 top-full z-50 mt-1 w-[min(100vw-2rem,28rem)] overflow-hidden rounded-xl border border-surface-200 bg-white shadow-xl dark:border-surface-800 dark:bg-surface-900"
            >
              <GlobalSearchResults
                payload={globalSearchQ.data?.data}
                loading={searchLoading}
                errorText={searchErrorText}
                t={t}
                onNavigate={handleSearchNavigate}
              />
            </div>
          ) : null}
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
          onClick={() => {
            setMobileSearchOpen(true)
            setSearchDismissed(false)
          }}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 sm:hidden"
          aria-label={t('topHeader.searchPlaceholder')}
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

        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
            aria-label={t('topHeader.logout')}
            title={t('topHeader.logout')}
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden />
          </button>
        ) : null}

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 ${notifOpen ? 'bg-surface-100 text-surface-700' : ''}`}
            aria-expanded={notifOpen}
            aria-haspopup="true"
          >
            <Bell className="h-[18px] w-[18px]" />
            {bellBadgeCount > 0 ? (
              <span className="absolute end-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-surface-50 bg-red-500 px-0.5 text-[9px] font-bold text-white dark:border-surface-100">
                {bellBadgeCount > 99 ? '99+' : bellBadgeCount}
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

      {mobileSearchOpen ? (
        <div
          className="fixed inset-0 z-[2147483646] flex flex-col bg-white sm:hidden dark:bg-surface-950"
          role="dialog"
          aria-modal="true"
          aria-label={t('topHeader.searchMobileTitle')}
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-surface-200 px-3 py-3 dark:border-surface-800">
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(false)
                setGlobalSearchInput('')
                setSearchDismissed(true)
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
              aria-label={t('topHeader.searchMobileClose')}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              <input
                type="search"
                placeholder={t('topHeader.searchPlaceholder')}
                autoComplete="off"
                value={globalSearchInput}
                onChange={(e) => setGlobalSearchInput(e.target.value)}
                autoFocus
                className="h-10 w-full rounded-lg border border-surface-200 bg-surface-50 ps-10 pe-3 text-sm text-surface-700 outline-none focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto border-t border-surface-100 dark:border-surface-800">
            {globalSearchInput.trim().length >= 1 ? (
              <GlobalSearchResults
                payload={globalSearchQ.data?.data}
                loading={searchLoading}
                errorText={searchErrorText}
                t={t}
                onNavigate={handleSearchNavigate}
              />
            ) : (
              <p className="px-4 py-8 text-center text-sm text-surface-500">{t('topHeader.searchMobileHint')}</p>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
