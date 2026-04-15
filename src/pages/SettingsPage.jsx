import { useState, useRef, useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useI18n } from '../i18n/I18nContext'
import { useTheme } from '../theme/ThemeContext'
import {
  User,
  ShieldAlert,
  AlertCircle,
  Bell,
  CreditCard,
  Wallet,
  Mail,
  PenLine,
  Lock,
  Save,
  CheckCircle2,
  ChevronDown,
  Camera,
  Phone,
  Globe,
  Sparkles,
  MessageCircle,
  BellRing,
  Smartphone,
  FileCheck,
  Receipt,
  Download,
  CreditCard as CardIcon,
  Zap,
  Crown,
  ArrowRight,
  X,
  Moon,
  Sun,
  Loader2,
} from 'lucide-react'
import {
  fetchSettingsBilling,
  fetchBillingPlan,
  postBillingUpgrade,
  fetchNotificationPrefs,
  putNotificationPrefs,
  fetchSettingsGuardrails,
  putSettingsGuardrails,
} from '../api/genesis/settingsApi'
import { fetchMyProfile, updateMyProfile, uploadMyAvatar, putMy2fa, putMyPassword } from '../api/genesis/usersMeApi'
import { isGenesisApiError } from '../api/genesis/errors'
import { formatNisFull } from '../utils/formatNis'

/* ─── Shared primitives ─── */

function Toggle({ enabled, onChange, id }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      id={id}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genesis-400 focus-visible:ring-offset-2 ${
        enabled ? 'bg-genesis-600' : 'bg-surface-300'
      }`}
    >
      <span
        className={`pointer-events-none absolute top-[3px] h-[18px] w-[18px] rounded-full shadow-sm transition-[inset] duration-200 ${
          enabled ? 'start-[23px]' : 'start-[3px]'
        }`}
        style={{ backgroundColor: '#fff' }}
      />
    </button>
  )
}

function Checkbox({ checked, onChange, id }) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
        checked
          ? 'border-genesis-600 bg-genesis-600 text-white'
          : 'border-surface-300 bg-white hover:border-genesis-400'
      }`}
    >
      {checked && (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}

function SectionCard({ icon: Icon, title, description, badge, badgeColor, children }) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-surface-100 px-6 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-genesis-50 ring-1 ring-genesis-200/60">
          <Icon className="h-[18px] w-[18px] text-genesis-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-surface-900">{title}</h3>
            {badge && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-surface-400">{description}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function InputField({ label, id, type = 'text', value, onChange, placeholder, icon: Icon, helper, readOnly }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-surface-600">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`h-10 w-full rounded-lg border border-surface-200 bg-white text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100 ${
            readOnly ? 'cursor-default bg-surface-50 text-surface-500' : ''
          } ${Icon ? 'ps-10 pe-3' : 'px-3'}`}
        />
      </div>
      {helper && <p className="mt-1 text-[11px] text-surface-400">{helper}</p>}
    </div>
  )
}

/* ─── User Profile Tab ─── */

function defaultAvatarUrl(seed) {
  const s = encodeURIComponent(String(seed || 'genesis').slice(0, 64))
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${s}&backgroundColor=c4b8f6`
}

function ProfileContent() {
  const { t, locale, toggleLocale, setLocale } = useI18n()
  const { dark, setDarkMode } = useTheme()
  const qc = useQueryClient()
  const fileInputRef = useRef(null)

  const profileQ = useQuery({
    queryKey: ['users-me'],
    queryFn: fetchMyProfile,
    staleTime: 60_000,
  })

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [twoFA, setTwoFA] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [formError, setFormError] = useState('')
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const profileFingerprint = useMemo(() => {
    const p = profileQ.data
    if (!p) return ''
    return JSON.stringify({
      user_id: p.user_id,
      display_name: p.display_name ?? '',
      phone: p.phone ?? '',
      avatar_url: p.avatar_url ?? '',
      language: p.language ?? '',
      dark_mode: Boolean(p.dark_mode),
      two_factor_enabled: Boolean(p.two_factor_enabled),
    })
  }, [profileQ.data])

  useEffect(() => {
    const p = profileQ.data
    if (!p) return
    setName(p.display_name ?? '')
    setEmail(p.email ?? '')
    setPhone(p.phone ?? '')
    setAvatar(p.avatar_url && String(p.avatar_url).trim() ? String(p.avatar_url) : defaultAvatarUrl(p.user_id || p.email))
    setTwoFA(Boolean(p.two_factor_enabled))
    if (p.language === 'he' || p.language === 'en') setLocale(p.language)
    setDarkMode(p.dark_mode === true)
  }, [profileFingerprint, setLocale, setDarkMode])

  const saveMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users-me'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      setFormError('')
    },
    onError: (e) => {
      setFormError(isGenesisApiError(e) ? e.userFacingMessage(t('profile.saveError')) : t('profile.saveError'))
    },
  })

  const twoFaMutation = useMutation({
    mutationFn: (enabled) => putMy2fa(enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users-me'] }),
    onError: () => qc.invalidateQueries({ queryKey: ['users-me'] }),
  })

  const passwordMutation = useMutation({
    mutationFn: (pw) => putMyPassword(pw),
    onSuccess: () => {
      setPasswordSuccess(true)
      setPasswordError('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setPasswordSuccess(false)
        setPasswordOpen(false)
      }, 1600)
      qc.invalidateQueries({ queryKey: ['users-me'] })
    },
    onError: (e) => {
      setPasswordError(isGenesisApiError(e) ? e.userFacingMessage(t('profile.passwordError')) : t('profile.passwordError'))
    },
  })

  const handleSave = () => {
    setFormError('')
    const p = profileQ.data
    if (!p) return
    const body = {}
    if (name !== (p.display_name ?? '')) body.display_name = name
    if (phone !== (p.phone ?? '')) body.phone = phone
    const lang = locale === 'he' ? 'he' : 'en'
    const serverLang = p.language === 'en' ? 'en' : 'he'
    if (lang !== serverLang) body.language = lang
    if (Boolean(p.dark_mode) !== dark) body.dark_mode = dark
    if (Object.keys(body).length === 0) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      return
    }
    saveMutation.mutate(body)
  }

  const handleAvatarPick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setAvatarBusy(true)
    setFormError('')
    try {
      const url = await uploadMyAvatar(file)
      setAvatar(url)
      await qc.invalidateQueries({ queryKey: ['users-me'] })
    } catch (err) {
      setFormError(isGenesisApiError(err) ? err.userFacingMessage(t('profile.avatarUploadError')) : t('profile.avatarUploadError'))
    } finally {
      setAvatarBusy(false)
    }
  }

  const handleRemoveAvatar = () => {
    const p = profileQ.data
    setAvatar(defaultAvatarUrl(p?.user_id || p?.email || 'user'))
  }

  const onTwoFaToggle = (next) => {
    const prev = twoFA
    setTwoFA(next)
    twoFaMutation.mutate(next, {
      onError: () => setTwoFA(prev),
    })
  }

  const submitPassword = (e) => {
    e.preventDefault()
    setPasswordError('')
    if (newPassword.length < 12) {
      setPasswordError(t('profile.passwordShort'))
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('profile.passwordMismatch'))
      return
    }
    passwordMutation.mutate(newPassword)
  }

  if (profileQ.isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-surface-500">
        <Loader2 className="h-8 w-8 animate-spin text-genesis-600" aria-hidden />
        <p className="text-sm">{t('profile.loading')}</p>
      </div>
    )
  }

  if (profileQ.isError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-6 text-sm text-amber-900">
        <p className="font-semibold">{t('profile.loadError')}</p>
        <p className="mt-1 text-xs text-amber-800/90">
          {isGenesisApiError(profileQ.error) ? profileQ.error.userFacingMessage(t('profile.loadError')) : String(profileQ.error)}
        </p>
        <button
          type="button"
          onClick={() => profileQ.refetch()}
          className="mt-4 rounded-lg bg-amber-800 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-900"
        >
          {t('profile.retry')}
        </button>
      </div>
    )
  }

  const roleLabel =
    profileQ.data?.role === 'admin'
      ? t('profile.personal.roleAdministrator')
      : profileQ.data?.role
        ? String(profileQ.data.role)
        : '—'

  return (
    <div className="flex flex-col gap-5">
      {formError ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {formError}
        </div>
      ) : null}

      <SectionCard icon={Camera} title={t('profile.avatar.title')} description={t('profile.avatar.desc')}>
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={avatar}
              alt=""
              className="h-20 w-20 rounded-2xl bg-genesis-100 object-cover ring-4 ring-genesis-100"
            />
            <button
              type="button"
              disabled={avatarBusy}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -end-1 flex h-7 w-7 items-center justify-center rounded-full bg-genesis-600 text-white ring-2 ring-white transition-colors hover:bg-genesis-700 disabled:opacity-50"
            >
              {avatarBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarPick} className="hidden" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={avatarBusy}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-genesis-200 bg-genesis-50 px-4 py-2 text-xs font-semibold text-genesis-700 transition-colors hover:bg-genesis-100 disabled:opacity-50"
            >
              {t('profile.avatar.change')}
            </button>
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="rounded-lg border border-surface-200 px-4 py-2 text-xs font-semibold text-surface-500 transition-colors hover:bg-surface-50"
            >
              {t('profile.avatar.remove')}
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={User} title={t('profile.personal.title')} description={t('profile.personal.desc')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label={t('profile.personal.fullName')}
            id="fullName"
            value={name}
            onChange={setName}
            placeholder={t('profile.personal.fullNamePlaceholder')}
            icon={User}
          />
          <InputField
            label={t('profile.personal.email')}
            id="email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder={t('profile.personal.emailPlaceholder')}
            icon={Mail}
            readOnly
            helper={t('profile.emailReadOnly')}
          />
          <InputField
            label={t('profile.personal.phone')}
            id="phone"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder={t('profile.personal.phonePlaceholder')}
            icon={Phone}
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-surface-600">{t('profile.personal.role')}</label>
            <div className="flex h-10 items-center rounded-lg border border-surface-200 bg-surface-50 px-3 text-sm text-surface-600">{roleLabel}</div>
          </div>
        </div>
        <div className="mt-4 border-t border-surface-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-surface-400" />
              <div>
                <p className="text-xs font-semibold text-surface-600">{t('profile.personal.language')}</p>
                <p className="text-[11px] text-surface-400">{t('profile.personal.languageHelper')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleLocale}
              className="flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-surface-700 transition-colors hover:bg-surface-50"
            >
              {locale === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-surface-100 pt-4">
            <div className="flex items-center gap-2">
              {dark ? <Moon className="h-4 w-4 text-surface-400" /> : <Sun className="h-4 w-4 text-surface-400" />}
              <div>
                <p className="text-xs font-semibold text-surface-600">{t('profile.personal.darkMode')}</p>
                <p className="text-[11px] text-surface-400">{t('profile.personal.darkModeHelper')}</p>
              </div>
            </div>
            <Toggle enabled={dark} onChange={(next) => setDarkMode(next)} id="dark-mode-toggle" />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Lock} title={t('profile.security.title')} description={t('profile.security.desc')}>
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-surface-800">{t('profile.security.changePassword')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{t('profile.security.changePasswordDesc')}</p>
              <p className="mt-1.5 text-[11px] text-surface-400">{t('profile.security.lastChanged')}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPasswordOpen(true)
                setPasswordError('')
                setPasswordSuccess(false)
                setNewPassword('')
                setConfirmPassword('')
              }}
              className="shrink-0 rounded-lg border border-surface-200 bg-white px-4 py-2 text-xs font-semibold text-surface-700 transition-colors hover:bg-surface-50"
            >
              {t('profile.security.changePasswordBtn')}
            </button>
          </div>

          <div className="border-t border-surface-100 pt-5">
            <div className="flex items-start justify-between gap-4">
              <label htmlFor="2fa-toggle" className="cursor-pointer">
                <p className="text-sm font-medium text-surface-800">{t('profile.security.twoFactor')}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{t('profile.security.twoFactorDesc')}</p>
                <p className={`mt-1.5 text-[11px] font-medium ${twoFA ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {twoFA ? t('profile.security.twoFactorEnabled') : t('profile.security.twoFactorDisabled')}
                </p>
              </label>
              <Toggle
                enabled={twoFA}
                onChange={onTwoFaToggle}
                id="2fa-toggle"
              />
            </div>
            {twoFaMutation.isPending ? <p className="mt-2 text-[11px] text-surface-400">{t('profile.twoFaSaving')}</p> : null}
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {t('settings.saved')}
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="btn-authora-gradient flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin text-[#020617]" /> : <Save className="h-4 w-4 text-[#020617]" />}
          {t('settings.saveChanges')}
        </button>
      </div>

      {passwordOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={(ev) => {
            if (ev.target === ev.currentTarget) setPasswordOpen(false)
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-surface-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-surface-900">{t('profile.passwordModalTitle')}</h3>
              <button type="button" onClick={() => setPasswordOpen(false)} className="rounded-lg p-1 text-surface-400 hover:bg-surface-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="mt-4 space-y-4" onSubmit={submitPassword}>
              {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
              {passwordSuccess ? <p className="text-sm text-emerald-600">{t('profile.passwordSuccess')}</p> : null}
              <InputField
                label={t('profile.passwordNew')}
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="••••••••••••"
              />
              <InputField
                label={t('profile.passwordConfirm')}
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="••••••••••••"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setPasswordOpen(false)} className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50">
                  {t('profile.passwordCancel')}
                </button>
                <button
                  type="submit"
                  disabled={passwordMutation.isPending}
                  className="rounded-lg bg-genesis-600 px-4 py-2 text-sm font-semibold text-white hover:bg-genesis-700 disabled:opacity-50"
                >
                  {passwordMutation.isPending ? t('profile.passwordSaving') : t('profile.passwordSave')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ─── Notifications Tab ─── */

const LS_NOTIFY_WHATSAPP = 'genesis-settings-notify-whatsapp'

function readWhatsappPref() {
  try {
    const v = localStorage.getItem(LS_NOTIFY_WHATSAPP)
    if (v === '0') return false
    if (v === '1') return true
  } catch {
    /* ignore */
  }
  return true
}

function writeWhatsappPref(next) {
  try {
    localStorage.setItem(LS_NOTIFY_WHATSAPP, next ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function NotificationsContent() {
  const { t } = useI18n()
  const qc = useQueryClient()
  const [whatsapp, setWhatsapp] = useState(readWhatsappPref)
  const [push, setPush] = useState(false)
  const [approval, setApproval] = useState(true)
  const [legalDoc, setLegalDoc] = useState(true)
  const [billingSummary, setBillingSummary] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const prefsQ = useQuery({
    queryKey: ['notification-prefs'],
    queryFn: fetchNotificationPrefs,
    staleTime: 30_000,
  })

  const prefsFingerprint = useMemo(() => JSON.stringify(prefsQ.data ?? null), [prefsQ.data])

  useEffect(() => {
    const p = prefsQ.data
    if (!p) return
    setPush(Boolean(p.push_enabled))
    setApproval(Boolean(p.email_on_approval))
    setLegalDoc(Boolean(p.email_on_completion))
    setBillingSummary(Boolean(p.email_on_error))
  }, [prefsFingerprint])

  const emailChannelOn = approval || legalDoc || billingSummary

  const saveMutation = useMutation({
    mutationFn: putNotificationPrefs,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-prefs'] })
      setSaveError('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
    onError: (e) => {
      setSaveError(isGenesisApiError(e) ? e.userFacingMessage(t('notifications.prefsSaveError')) : t('notifications.prefsSaveError'))
    },
  })

  const persist = (body) => {
    setSaveError('')
    saveMutation.mutate(body)
  }

  const setWhatsappWrapped = (next) => {
    setWhatsapp(next)
    writeWhatsappPref(next)
  }

  const setEmailChannel = (on) => {
    if (on) {
      setApproval(true)
      setLegalDoc(true)
      setBillingSummary(true)
      persist({
        email_on_approval: true,
        email_on_completion: true,
        email_on_error: true,
        push_enabled: push,
      })
    } else {
      setApproval(false)
      setLegalDoc(false)
      setBillingSummary(false)
      persist({
        email_on_approval: false,
        email_on_completion: false,
        email_on_error: false,
        push_enabled: push,
      })
    }
  }

  const setPushWrapped = (next) => {
    setPush(next)
    persist({
      email_on_approval: approval,
      email_on_completion: legalDoc,
      email_on_error: billingSummary,
      push_enabled: next,
    })
  }

  const setApprovalWrapped = (next) => {
    setApproval(next)
    persist({
      email_on_approval: next,
      email_on_completion: legalDoc,
      email_on_error: billingSummary,
      push_enabled: push,
    })
  }

  const setLegalWrapped = (next) => {
    setLegalDoc(next)
    persist({
      email_on_approval: approval,
      email_on_completion: next,
      email_on_error: billingSummary,
      push_enabled: push,
    })
  }

  const setBillingWrapped = (next) => {
    setBillingSummary(next)
    persist({
      email_on_approval: approval,
      email_on_completion: legalDoc,
      email_on_error: next,
      push_enabled: push,
    })
  }

  const handleSaveClick = () => {
    persist({
      email_on_approval: approval,
      email_on_completion: legalDoc,
      email_on_error: billingSummary,
      push_enabled: push,
    })
  }

  if (prefsQ.isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-surface-200 bg-white py-16">
        <Loader2 className="h-8 w-8 animate-spin text-genesis-500" />
        <p className="text-sm text-surface-500">{t('notifications.loadingPrefs')}</p>
      </div>
    )
  }

  if (prefsQ.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">{t('notifications.loadPrefsError')}</p>
            <p className="mt-1 text-sm text-red-800/90">
              {isGenesisApiError(prefsQ.error) ? prefsQ.error.userFacingMessage(t('notifications.loadPrefsError')) : String(prefsQ.error)}
            </p>
            <button
              type="button"
              onClick={() => prefsQ.refetch()}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-800 ring-1 ring-red-200 hover:bg-red-50"
            >
              {t('notifications.retryPrefs')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {saveError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      ) : null}
      {saveMutation.isPending ? (
        <p className="text-xs text-surface-400">{t('notifications.prefsSaving')}</p>
      ) : null}

      {/* Channels */}
      <SectionCard icon={BellRing} title={t('notifications.channels.title')} description={t('notifications.channels.desc')}>
        <div className="space-y-0 divide-y divide-surface-100">
          {/* WhatsApp — client-only (not in API) */}
          <div className="flex items-start justify-between gap-4 pb-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-200/60">
                <MessageCircle className="h-[18px] w-[18px] text-emerald-600" />
              </div>
              <label htmlFor="whatsapp-toggle" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-surface-800">{t('notifications.channels.whatsapp')}</p>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    {t('notifications.channels.whatsappBadge')}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{t('notifications.channels.whatsappDesc')}</p>
                <p className="mt-1 text-[11px] text-surface-400">{t('notifications.whatsappLocalHint')}</p>
              </label>
            </div>
            <Toggle enabled={whatsapp} onChange={setWhatsappWrapped} id="whatsapp-toggle" />
          </div>

          {/* Email — maps to all email_on_* when used as master */}
          <div className="flex items-start justify-between gap-4 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-200/60">
                <Mail className="h-[18px] w-[18px] text-blue-600" />
              </div>
              <label htmlFor="email-toggle" className="cursor-pointer">
                <p className="text-sm font-medium text-surface-800">{t('notifications.channels.email')}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{t('notifications.channels.emailDesc')}</p>
              </label>
            </div>
            <Toggle enabled={emailChannelOn} onChange={setEmailChannel} id="email-toggle" />
          </div>

          {/* Push */}
          <div className="flex items-start justify-between gap-4 pt-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-genesis-50 ring-1 ring-genesis-200/60">
                <Smartphone className="h-[18px] w-[18px] text-genesis-600" />
              </div>
              <label htmlFor="push-toggle" className="cursor-pointer">
                <p className="text-sm font-medium text-surface-800">{t('notifications.channels.push')}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{t('notifications.channels.pushDesc')}</p>
              </label>
            </div>
            <Toggle enabled={push} onChange={setPushWrapped} id="push-toggle" />
          </div>
        </div>
      </SectionCard>

      {/* Alert Types — map to email_on_approval / completion / error */}
      <SectionCard icon={Bell} title={t('notifications.alerts.title')} description={t('notifications.alerts.desc')}>
        <div className="space-y-0 divide-y divide-surface-100">
          <div className="flex items-start justify-between gap-4 pb-5">
            <label htmlFor="approval-alert" className={`cursor-pointer ${!emailChannelOn ? 'opacity-50' : ''}`}>
              <p className="text-sm font-medium text-surface-800">{t('notifications.alerts.approval')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{t('notifications.alerts.approvalDesc')}</p>
            </label>
            <Toggle enabled={approval} onChange={setApprovalWrapped} id="approval-alert" />
          </div>
          <div className="flex items-start justify-between gap-4 py-5">
            <label htmlFor="legal-alert" className={`cursor-pointer ${!emailChannelOn ? 'opacity-50' : ''}`}>
              <p className="text-sm font-medium text-surface-800">{t('notifications.alerts.legalDoc')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{t('notifications.alerts.legalDocDesc')}</p>
            </label>
            <Toggle enabled={legalDoc} onChange={setLegalWrapped} id="legal-alert" />
          </div>
          <div className="flex items-start justify-between gap-4 pt-5">
            <label htmlFor="billing-alert" className={`cursor-pointer ${!emailChannelOn ? 'opacity-50' : ''}`}>
              <p className="text-sm font-medium text-surface-800">{t('notifications.alerts.billing')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{t('notifications.alerts.billingDesc')}</p>
            </label>
            <Toggle enabled={billingSummary} onChange={setBillingWrapped} id="billing-alert" />
          </div>
        </div>
      </SectionCard>

      {/* Save — syncs current toggles (same as auto-save) */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {t('settings.saved')}
          </div>
        )}
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={saveMutation.isPending}
          className="btn-authora-gradient flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Save className="h-4 w-4 text-[#020617]" />
          {t('settings.saveChanges')}
        </button>
      </div>
    </div>
  )
}

/* ─── Billing Tab ─── */

function pickBillingInvoices(api, locale) {
  if (!api || typeof api !== 'object') return []
  const raw =
    api.invoice_history ??
    api.invoices ??
    api.recent_invoices ??
    api.billing_history ??
    api.history
  if (!Array.isArray(raw)) return []
  return raw.map((row, i) => {
    const o = row && typeof row === 'object' ? row : {}
    const date = String(o.date ?? o.invoice_date ?? o.created_at ?? '')
    const desc = String(o.description ?? o.desc ?? o.title ?? '')
    const amt = o.amount_ils ?? o.amount ?? o.total_ils ?? o.total
    const amount =
      typeof amt === 'number' && Number.isFinite(amt)
        ? formatNisFull(amt, locale)
        : String(amt ?? '')
    const pdfUrl = typeof o.pdf_url === 'string' ? o.pdf_url : typeof o.receipt_url === 'string' ? o.receipt_url : ''
    return { key: i, date, desc, amount, pdfUrl }
  })
}

function BillingContent() {
  const { t, locale } = useI18n()
  const qc = useQueryClient()
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradePlan, setUpgradePlan] = useState('pro')
  const [upgradeError, setUpgradeError] = useState('')

  const bundleQ = useQuery({
    queryKey: ['settings-billing-bundle'],
    queryFn: async () => {
      const billing = await fetchSettingsBilling()
      let plan = null
      try {
        plan = await fetchBillingPlan()
      } catch {
        plan = null
      }
      return { billing, plan }
    },
    staleTime: 60_000,
  })

  const api = bundleQ.data?.billing
  const planApi = bundleQ.data?.plan

  const upgradeMutation = useMutation({
    mutationFn: postBillingUpgrade,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings-billing-bundle'] })
      setUpgradeOpen(false)
      setUpgradeError('')
    },
    onError: (e) => {
      setUpgradeError(isGenesisApiError(e) ? e.userFacingMessage(t('billing.upgradeError')) : t('billing.upgradeError'))
    },
  })

  const planName =
    (api && typeof api.plan === 'string' && api.plan) ||
    (api && typeof api.plan_name === 'string' && api.plan_name) ||
    (planApi && typeof planApi.plan === 'string' && planApi.plan) ||
    (planApi && typeof planApi.tier === 'string' && planApi.tier) ||
    null

  const features =
    (planApi && Array.isArray(planApi.features) && planApi.features) ||
    (api && Array.isArray(api.plan_features) && api.plan_features) ||
    t('billing.plan.features')

  const invoicesFromApi = pickBillingInvoices(api, locale)
  const invoicesFallback = t('billing.history.invoices')
  const invoices =
    api != null
      ? invoicesFromApi
      : Array.isArray(invoicesFallback)
        ? invoicesFallback
        : []

  const activeAgents =
    typeof api?.active_agents === 'number'
      ? api.active_agents
      : typeof api?.agents_used === 'number'
        ? api.agents_used
        : null
  const maxAgents =
    typeof api?.max_agents === 'number'
      ? api.max_agents
      : typeof planApi?.max_agents === 'number'
        ? planApi.max_agents
        : null

  const usedLabel =
    activeAgents != null ? String(activeAgents) : typeof api?.token_used === 'number' ? String(api.token_used) : t('billing.usage.used')
  const limitLabel =
    maxAgents != null
      ? String(maxAgents)
      : typeof api?.token_limit === 'number'
        ? String(api.token_limit)
        : t('billing.usage.limit')

  let pct =
    typeof api?.usage_percent === 'number' && Number.isFinite(api.usage_percent)
      ? Math.min(100, Math.max(0, Math.round(api.usage_percent)))
      : null
  if (pct == null && activeAgents != null && maxAgents != null && maxAgents > 0) {
    pct = Math.min(100, Math.max(0, Math.round((activeAgents / maxAgents) * 100)))
  }
  if (pct == null && typeof api?.token_used === 'number' && typeof api?.token_limit === 'number' && api.token_limit > 0) {
    pct = Math.min(100, Math.max(0, Math.round((api.token_used / api.token_limit) * 100)))
  }
  if (pct == null) pct = 0

  const renews =
    (api && typeof api.renews_at === 'string' && api.renews_at) ||
    (api && typeof api.renewal_date === 'string' && api.renewal_date) ||
    null

  const cardLast4 =
    (api && typeof api.card_last4 === 'string' && api.card_last4) ||
    (api?.payment && typeof api.payment === 'object' && typeof api.payment.last4 === 'string' && api.payment.last4) ||
    t('billing.payment.cardLast4')
  const cardBrand =
    (api && typeof api.card_brand === 'string' && api.card_brand) ||
    (api?.payment && typeof api.payment === 'object' && typeof api.payment.brand === 'string' && api.payment.brand) ||
    t('billing.payment.cardType')
  const cardExp =
    (api && typeof api.card_exp === 'string' && api.card_exp) ||
    (api?.payment && typeof api.payment === 'object' && typeof api.payment.exp === 'string' && api.payment.exp) ||
    t('billing.payment.cardExpiry')

  if (bundleQ.isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-surface-200 bg-white py-16">
        <Loader2 className="h-8 w-8 animate-spin text-genesis-500" />
        <p className="text-sm text-surface-500">{t('billing.loading')}</p>
      </div>
    )
  }

  if (bundleQ.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">{t('billing.loadError')}</p>
            <p className="mt-1 text-sm text-red-800/90">
              {isGenesisApiError(bundleQ.error) ? bundleQ.error.userFacingMessage(t('billing.loadError')) : String(bundleQ.error)}
            </p>
            <button
              type="button"
              onClick={() => bundleQ.refetch()}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-800 ring-1 ring-red-200 hover:bg-red-50"
            >
              {t('billing.retry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Current Plan */}
      <div className="overflow-hidden rounded-xl border border-genesis-200/60 shadow-sm">
        <div className="bg-[linear-gradient(135deg,#0e7490_0%,#2563eb_45%,#6d28d9_100%)] px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-genesis-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-genesis-200">{t('billing.plan.title')}</span>
              </div>
              <h3 className="mt-2 text-2xl font-bold">
                {planName ? String(planName).toUpperCase() : t('billing.plan.name')}
              </h3>
              <p className="mt-1 text-genesis-200">
                {api && typeof api.total_cost_this_month_ils === 'number'
                  ? formatNisFull(api.total_cost_this_month_ils, locale)
                  : t('billing.plan.price')}
              </p>
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {(api && typeof api.subscription_status === 'string' && api.subscription_status) || t('billing.plan.status')}
            </span>
          </div>
          <p className="mt-3 text-xs text-genesis-200">{renews || t('billing.plan.renews')}</p>
        </div>

        <div className="bg-white px-6 py-4">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Array.isArray(features) &&
              features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-surface-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-genesis-500" />
                  {typeof f === 'string' ? f : String(f)}
                </li>
              ))}
          </ul>
          <div className="mt-4 flex gap-3 border-t border-surface-100 pt-4">
            <button
              type="button"
              onClick={() => {
                setUpgradeError('')
                setUpgradeOpen(true)
              }}
              className="flex items-center gap-2 rounded-lg bg-genesis-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-genesis-700"
            >
              <Zap className="h-3.5 w-3.5" />
              {t('billing.plan.upgrade')}
            </button>
            <button
              type="button"
              className="rounded-lg border border-surface-200 px-4 py-2 text-xs font-semibold text-surface-600 transition-colors hover:bg-surface-50"
            >
              {t('billing.plan.manage')}
            </button>
          </div>
        </div>
      </div>

      {/* Token Usage */}
      <SectionCard icon={Zap} title={t('billing.usage.title')} description={t('billing.usage.desc')}>
        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-surface-900">{usedLabel}</p>
              <p className="mt-0.5 text-xs text-surface-400">
                / {limitLabel} {t('billing.usage.unit')}
              </p>
            </div>
            <div className="text-end">
              <span className="text-lg font-bold text-genesis-600">{pct}%</span>
              <p className="text-[11px] text-surface-400">{t('billing.usage.period')}</p>
            </div>
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-surface-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-genesis-600 to-genesis-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="mt-2 text-[11px] text-surface-400">{t('billing.usage.resetDate')}</p>
        </div>
      </SectionCard>

      {/* Payment Method */}
      <SectionCard icon={CardIcon} title={t('billing.payment.title')} description={t('billing.payment.desc')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-18 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 px-3 shadow-sm">
              <span className="text-xs font-bold tracking-wider text-white">{String(cardBrand).slice(0, 4).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-800">
                {cardBrand} •••• {cardLast4}
              </p>
              <p className="text-xs text-surface-400">
                Exp. {cardExp}
                <span className="ms-2 rounded bg-surface-100 px-1.5 py-0.5 text-[10px] font-semibold text-surface-500">
                  {t('billing.payment.default')}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg border border-surface-200 px-4 py-2 text-xs font-semibold text-surface-600 transition-colors hover:bg-surface-50"
          >
            {t('billing.payment.update')}
          </button>
        </div>
      </SectionCard>

      {/* Billing History */}
      <SectionCard icon={Receipt} title={t('billing.history.title')} description={t('billing.history.desc')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="pb-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-surface-400">{t('billing.history.date')}</th>
                <th className="pb-2.5 text-start text-[10px] font-semibold uppercase tracking-wider text-surface-400">{t('billing.history.description')}</th>
                <th className="pb-2.5 text-end text-[10px] font-semibold uppercase tracking-wider text-surface-400">{t('billing.history.amount')}</th>
                <th className="pb-2.5 text-end text-[10px] font-semibold uppercase tracking-wider text-surface-400">{t('billing.history.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {invoices.map((inv, i) => (
                <tr key={inv.key ?? inv.date ?? i} className="group">
                  <td className="py-3 text-xs text-surface-500">{inv.date}</td>
                  <td className="py-3 text-xs font-medium text-surface-700">{inv.desc}</td>
                  <td className="py-3 text-end text-xs font-semibold text-surface-800">{inv.amount}</td>
                  <td className="py-3 text-end">
                    {inv.pdfUrl ? (
                      <a
                        href={inv.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-genesis-600 transition-colors hover:bg-genesis-50"
                      >
                        <Download className="h-3 w-3" />
                        PDF
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-surface-400"
                        disabled
                      >
                        <Download className="h-3 w-3" />
                        PDF
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {upgradeOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl border border-surface-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-surface-900">{t('billing.upgradeTitle')}</h3>
              <button
                type="button"
                onClick={() => setUpgradeOpen(false)}
                className="rounded-lg p-1 text-surface-500 hover:bg-surface-100"
                aria-label={t('billing.upgradeClose')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-surface-500">{t('billing.upgradeDesc')}</p>
            {upgradeError ? <p className="mt-2 text-sm text-red-600">{upgradeError}</p> : null}
            <label className="mt-4 block text-xs font-semibold text-surface-600" htmlFor="upgrade-plan">
              {t('billing.upgradePlanLabel')}
            </label>
            <select
              id="upgrade-plan"
              value={upgradePlan}
              onChange={(e) => setUpgradePlan(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-surface-200 bg-white px-3 text-sm text-surface-800"
            >
              <option value="starter">starter</option>
              <option value="pro">pro</option>
              <option value="enterprise">enterprise</option>
            </select>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUpgradeOpen(false)}
                className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50"
              >
                {t('billing.upgradeCancel')}
              </button>
              <button
                type="button"
                disabled={upgradeMutation.isPending}
                onClick={() => upgradeMutation.mutate({ plan: upgradePlan })}
                className="rounded-lg bg-genesis-600 px-4 py-2 text-sm font-semibold text-white hover:bg-genesis-700 disabled:opacity-50"
              >
                {upgradeMutation.isPending ? t('billing.upgradeSubmitting') : t('billing.upgradeConfirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ─── Guardrails Tab ─── */

const LS_GUARD_UI = 'genesis-settings-guardrails-ui-v1'

function readGuardLocalUi() {
  try {
    const raw = localStorage.getItem(LS_GUARD_UI)
    if (raw) {
      const o = JSON.parse(raw)
      return {
        sendEmails: Boolean(o.sendEmails),
        publishJobs: Boolean(o.publishJobs),
        manualSign: o.manualSign !== false,
      }
    }
  } catch {
    /* ignore */
  }
  return { sendEmails: false, publishJobs: false, manualSign: true }
}

function writeGuardLocalUi(o) {
  try {
    localStorage.setItem(LS_GUARD_UI, JSON.stringify(o))
  } catch {
    /* ignore */
  }
}

function approxToIls(amount, currency) {
  const n = Number(amount)
  if (!Number.isFinite(n) || n < 0) return 0
  if (currency === 'USD') return Math.round(n * 3.65)
  if (currency === 'EUR') return Math.round(n * 4)
  return Math.round(n)
}

function GuardrailsContent() {
  const { t } = useI18n()
  const qc = useQueryClient()
  const loadedRef = useRef(null)

  const grQ = useQuery({
    queryKey: ['settings-guardrails'],
    queryFn: fetchSettingsGuardrails,
    staleTime: 30_000,
  })

  const fingerprint = useMemo(() => JSON.stringify(grQ.data ?? null), [grQ.data])

  const [autoApprove, setAutoApprove] = useState(true)
  const [expenseLimit, setExpenseLimit] = useState('500')
  const [expenseCurrency, setExpenseCurrency] = useState('ILS')
  const [maxBudgetStage, setMaxBudgetStage] = useState('0')
  const [maxMessagesDefault, setMaxMessagesDefault] = useState('100')
  const [sendEmails, setSendEmails] = useState(false)
  const [publishJobs, setPublishJobs] = useState(false)
  const [manualSign, setManualSign] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    const local = readGuardLocalUi()
    setSendEmails(local.sendEmails)
    setPublishJobs(local.publishJobs)
    setManualSign(local.manualSign)
  }, [])

  useEffect(() => {
    const g = grQ.data
    if (!g) return
    loadedRef.current = g
    const threshold = g.require_approval_above_ils
    setAutoApprove(threshold > 0)
    setExpenseLimit(threshold > 0 ? String(Math.max(0, Math.round(threshold))) : '500')
    setExpenseCurrency('ILS')
    setMaxBudgetStage(String(Math.max(0, Math.round(g.max_budget_per_stage_ils ?? 0))))
    const def = g.max_messages_per_agent?.default
    setMaxMessagesDefault(String(typeof def === 'number' && Number.isFinite(def) ? def : 100))
  }, [fingerprint])

  const saveMutation = useMutation({
    mutationFn: putSettingsGuardrails,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings-guardrails'] })
      setSaveError('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (e) => {
      setSaveError(
        isGenesisApiError(e) ? e.userFacingMessage(t('settings.guardrailsSaveError')) : t('settings.guardrailsSaveError'),
      )
    },
  })

  const handleSave = () => {
    const base = loadedRef.current || grQ.data
    if (!base) return
    const reqIls = autoApprove ? approxToIls(parseFloat(String(expenseLimit)) || 0, expenseCurrency) : 0
    const budgetIls = approxToIls(parseFloat(String(maxBudgetStage)) || 0, expenseCurrency)
    const msgCap = parseInt(String(maxMessagesDefault), 10)
    const mergedMessages = {
      ...base.max_messages_per_agent,
      default: Number.isFinite(msgCap) && msgCap > 0 ? msgCap : 100,
    }
    writeGuardLocalUi({ sendEmails, publishJobs, manualSign })
    saveMutation.mutate({
      max_messages_per_agent: mergedMessages,
      max_budget_per_stage_ils: budgetIls,
      require_approval_above_ils: reqIls,
      blocked_agents: [...(base.blocked_agents || [])],
    })
  }

  if (grQ.isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-surface-200 bg-white py-16">
        <Loader2 className="h-8 w-8 animate-spin text-genesis-500" />
        <p className="text-sm text-surface-500">{t('settings.guardrailsLoading')}</p>
      </div>
    )
  }

  if (grQ.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">{t('settings.guardrailsLoadError')}</p>
            <p className="mt-1 text-sm text-red-800/90">
              {isGenesisApiError(grQ.error) ? grQ.error.userFacingMessage(t('settings.guardrailsLoadError')) : String(grQ.error)}
            </p>
            <button
              type="button"
              onClick={() => grQ.refetch()}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-800 ring-1 ring-red-200 hover:bg-red-50"
            >
              {t('settings.guardrailsRetry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {saveError ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      ) : null}
      <div className="flex items-start gap-3 rounded-xl border border-genesis-200/60 bg-gradient-to-r from-genesis-50 to-white px-5 py-4">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-genesis-600" />
        <div>
          <p className="text-sm font-semibold text-genesis-800">{t('settings.aiControls')}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-genesis-600/80">
            {t('settings.aiControlsDesc')}
          </p>
        </div>
      </div>

      <SectionCard
        icon={Wallet}
        title={t('settings.financialAutonomy')}
        description={t('settings.financialDesc')}
        badge={t('settings.mediumRisk')}
        badgeColor="bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
      >
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <label htmlFor="auto-approve-toggle" className="cursor-pointer">
              <p className="text-sm font-medium text-surface-800">{t('settings.autoApprove')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-surface-400">
                {t('settings.autoApproveDesc')}
              </p>
            </label>
            <Toggle enabled={autoApprove} onChange={setAutoApprove} id="auto-approve-toggle" />
          </div>

          {autoApprove && (
            <div className="rounded-lg border border-surface-100 bg-surface-50/70 p-4">
              <p className="mb-2.5 text-xs font-semibold text-surface-500">{t('settings.maxAmount')}</p>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <select
                    value={expenseCurrency}
                    onChange={(e) => setExpenseCurrency(e.target.value)}
                    className="h-10 appearance-none rounded-lg border border-surface-200 bg-white ps-3 pe-8 text-sm font-medium text-surface-700 outline-none transition-all focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100"
                  >
                    <option value="ILS">₪ ILS</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-2 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                </div>
                <input
                  type="number"
                  value={expenseLimit}
                  onChange={(e) => setExpenseLimit(e.target.value)}
                  className="h-10 w-32 rounded-lg border border-surface-200 bg-white px-3 text-sm font-medium text-surface-700 outline-none transition-all focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100"
                  min={0}
                  step={50}
                />
                <span className="text-xs text-surface-400">{t('settings.perTransaction')}</span>
              </div>
              <p className="mt-2 text-[11px] text-surface-400">
                {t('settings.anythingAbove')} {expenseCurrency === 'ILS' ? '₪' : expenseCurrency === 'USD' ? '$' : '€'}
                {expenseLimit} {t('settings.aboveThreshold')}
              </p>
              <p className="mt-2 text-[11px] text-surface-400">{t('settings.guardrailsIlsHint')}</p>
            </div>
          )}

          <p className="mb-2.5 text-xs font-semibold text-surface-500">{t('settings.maxBudgetPerStage')}</p>
          <input
            type="number"
            value={maxBudgetStage}
            onChange={(e) => setMaxBudgetStage(e.target.value)}
            className="h-10 w-full max-w-xs rounded-lg border border-surface-200 bg-white px-3 text-sm font-medium text-surface-700 outline-none transition-all focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100 sm:w-40"
            min={0}
            step={100}
          />

          <p className="mb-2.5 mt-4 text-xs font-semibold text-surface-500">{t('settings.maxMessagesDefault')}</p>
          <input
            type="number"
            value={maxMessagesDefault}
            onChange={(e) => setMaxMessagesDefault(e.target.value)}
            className="h-10 w-full max-w-xs rounded-lg border border-surface-200 bg-white px-3 text-sm font-medium text-surface-700 outline-none transition-all focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100 sm:w-32"
            min={1}
            step={10}
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={Mail}
        title={t('settings.commPermissions')}
        description={t('settings.commDesc')}
        badge={t('settings.lowRisk')}
        badgeColor="bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="pt-0.5"><Checkbox checked={sendEmails} onChange={setSendEmails} id="send-emails" /></div>
            <label htmlFor="send-emails" className="cursor-pointer">
              <p className="text-sm font-medium text-surface-800">{t('settings.sendEmails')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-surface-400">
                {t('settings.sendEmailsDesc')}
              </p>
            </label>
          </div>
          <div className="border-t border-surface-100 pt-4">
            <div className="flex items-start gap-3">
              <div className="pt-0.5"><Checkbox checked={publishJobs} onChange={setPublishJobs} id="publish-jobs" /></div>
              <label htmlFor="publish-jobs" className="cursor-pointer">
                <p className="text-sm font-medium text-surface-800">{t('settings.publishJobs')}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-surface-400">
                  {t('settings.publishJobsDesc')}
                </p>
              </label>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={PenLine}
        title={t('settings.legalActions')}
        description={t('settings.legalDesc')}
        badge={t('settings.highRisk')}
        badgeColor="bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
      >
        <div className="flex items-start justify-between gap-4">
          <label htmlFor="manual-sign-toggle" className="cursor-pointer">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-surface-800">{t('settings.requireSignature')}</p>
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                {t('settings.recommended')}
              </span>
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-surface-400">
              {t('settings.requireSignatureDesc')}
            </p>
          </label>
          <Toggle enabled={manualSign} onChange={setManualSign} id="manual-sign-toggle" />
        </div>
        {!manualSign && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div>
              <p className="text-xs font-semibold text-red-800">{t('settings.warningTitle')}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-red-600">
                {t('settings.warningDesc')}
              </p>
            </div>
          </div>
        )}
      </SectionCard>

      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {t('settings.saved')}
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="btn-authora-gradient flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Save className="h-4 w-4 text-[#020617]" />
          {saveMutation.isPending ? t('settings.guardrailsSaving') : t('settings.saveChanges')}
        </button>
      </div>
    </div>
  )
}

/* ─── Page Shell ─── */

const tabsMeta = [
  { key: 'profile', tKey: 'settings.tabsProfile', icon: User },
  { key: 'guardrails', tKey: 'settings.tabsGuardrails', icon: ShieldAlert },
  { key: 'notifications', tKey: 'settings.tabsNotifications', icon: Bell },
  { key: 'billing', tKey: 'settings.tabsBilling', icon: CreditCard },
]

export default function SettingsPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState('profile')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileContent />
      case 'guardrails':
        return <GuardrailsContent />
      case 'notifications':
        return <NotificationsContent />
      case 'billing':
        return <BillingContent />
      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-surface-900">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-surface-500">{t('settings.subtitle')}</p>
      </div>

      <div className="mt-6 flex flex-col gap-5 lg:flex-row">
        <div className="w-full shrink-0 lg:w-56">
          <div className="rounded-xl border border-surface-200 bg-white shadow-sm">
            <nav className="p-2">
              <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
                {tabsMeta.map((tab) => {
                  const TabIcon = tab.icon
                  const isActive = activeTab === tab.key
                  const label = t(tab.tKey)
                  return (
                    <li key={tab.key}>
                      <button
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-genesis-50 text-genesis-700 shadow-sm ring-1 ring-genesis-200'
                            : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'
                        }`}
                      >
                        <TabIcon className={`h-4 w-4 shrink-0 ${isActive ? 'text-genesis-600' : 'text-surface-400'}`} />
                        <span>{label}</span>
                        {tab.key === 'guardrails' && (
                          <span className="ms-auto flex h-2 w-2 rounded-full bg-genesis-500" />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
