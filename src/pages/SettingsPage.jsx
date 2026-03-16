import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import {
  User,
  ShieldAlert,
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
} from 'lucide-react'

/* ─── Shared primitives ─── */

function Toggle({ enabled, onChange, id }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      id={id}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genesis-400 focus-visible:ring-offset-2 ${
        enabled ? 'bg-genesis-600' : 'bg-surface-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? 'translate-x-[22px]' : 'translate-x-[3px]'
        }`}
        style={{ height: 18, width: 18 }}
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

function InputField({ label, id, type = 'text', value, onChange, placeholder, icon: Icon, helper }) {
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
          className={`h-10 w-full rounded-lg border border-surface-200 bg-white text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:ring-2 focus:ring-genesis-100 ${
            Icon ? 'ps-10 pe-3' : 'px-3'
          }`}
        />
      </div>
      {helper && <p className="mt-1 text-[11px] text-surface-400">{helper}</p>}
    </div>
  )
}

/* ─── User Profile Tab ─── */

function ProfileContent() {
  const { t, locale, toggleLocale } = useI18n()
  const [name, setName] = useState('David Abrahams')
  const [email, setEmail] = useState('david@genesisai.com')
  const [phone, setPhone] = useState('+972 50 123 4567')
  const [twoFA, setTwoFA] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <div className="flex flex-col gap-5">
      {/* Avatar */}
      <SectionCard icon={Camera} title={t('profile.avatar.title')} description={t('profile.avatar.desc')}>
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src="https://api.dicebear.com/9.x/notionists/svg?seed=David&backgroundColor=c4b8f6"
              alt="Avatar"
              className="h-20 w-20 rounded-2xl bg-genesis-100 object-cover ring-4 ring-genesis-100"
            />
            <div className="absolute -bottom-1 -end-1 flex h-7 w-7 items-center justify-center rounded-full bg-genesis-600 text-white ring-2 ring-white">
              <Camera className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button className="rounded-lg border border-genesis-200 bg-genesis-50 px-4 py-2 text-xs font-semibold text-genesis-700 transition-colors hover:bg-genesis-100">
              {t('profile.avatar.change')}
            </button>
            <button className="rounded-lg border border-surface-200 px-4 py-2 text-xs font-semibold text-surface-500 transition-colors hover:bg-surface-50">
              {t('profile.avatar.remove')}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Personal Info */}
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
            <div className="flex h-10 items-center rounded-lg border border-surface-200 bg-surface-50 px-3 text-sm text-surface-500">
              Administrator
            </div>
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
              onClick={toggleLocale}
              className="flex items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-surface-700 transition-colors hover:bg-surface-50"
            >
              {locale === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Security */}
      <SectionCard icon={Lock} title={t('profile.security.title')} description={t('profile.security.desc')}>
        <div className="space-y-5">
          {/* Change Password */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-surface-800">{t('profile.security.changePassword')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{t('profile.security.changePasswordDesc')}</p>
              <p className="mt-1.5 text-[11px] text-surface-400">{t('profile.security.lastChanged')}</p>
            </div>
            <button className="shrink-0 rounded-lg border border-surface-200 bg-white px-4 py-2 text-xs font-semibold text-surface-700 transition-colors hover:bg-surface-50">
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
              <Toggle enabled={twoFA} onChange={setTwoFA} id="2fa-toggle" />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {t('settings.saved')}
          </div>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-genesis-600 to-genesis-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-genesis-500/25 transition-all hover:from-genesis-700 hover:to-genesis-600 active:scale-[0.98]"
        >
          <Save className="h-4 w-4" />
          {t('settings.saveChanges')}
        </button>
      </div>
    </div>
  )
}

/* ─── Notifications Tab ─── */

function NotificationsContent() {
  const { t } = useI18n()
  const [whatsapp, setWhatsapp] = useState(true)
  const [emailNotif, setEmailNotif] = useState(true)
  const [push, setPush] = useState(false)
  const [approval, setApproval] = useState(true)
  const [legalDoc, setLegalDoc] = useState(true)
  const [billingSummary, setBillingSummary] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <div className="flex flex-col gap-5">
      {/* Channels */}
      <SectionCard icon={BellRing} title={t('notifications.channels.title')} description={t('notifications.channels.desc')}>
        <div className="space-y-0 divide-y divide-surface-100">
          {/* WhatsApp */}
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
              </label>
            </div>
            <Toggle enabled={whatsapp} onChange={setWhatsapp} id="whatsapp-toggle" />
          </div>

          {/* Email */}
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
            <Toggle enabled={emailNotif} onChange={setEmailNotif} id="email-toggle" />
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
            <Toggle enabled={push} onChange={setPush} id="push-toggle" />
          </div>
        </div>
      </SectionCard>

      {/* Alert Types */}
      <SectionCard icon={Bell} title={t('notifications.alerts.title')} description={t('notifications.alerts.desc')}>
        <div className="space-y-0 divide-y divide-surface-100">
          <div className="flex items-start justify-between gap-4 pb-5">
            <label htmlFor="approval-alert" className="cursor-pointer">
              <p className="text-sm font-medium text-surface-800">{t('notifications.alerts.approval')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{t('notifications.alerts.approvalDesc')}</p>
            </label>
            <Toggle enabled={approval} onChange={setApproval} id="approval-alert" />
          </div>
          <div className="flex items-start justify-between gap-4 py-5">
            <label htmlFor="legal-alert" className="cursor-pointer">
              <p className="text-sm font-medium text-surface-800">{t('notifications.alerts.legalDoc')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{t('notifications.alerts.legalDocDesc')}</p>
            </label>
            <Toggle enabled={legalDoc} onChange={setLegalDoc} id="legal-alert" />
          </div>
          <div className="flex items-start justify-between gap-4 pt-5">
            <label htmlFor="billing-alert" className="cursor-pointer">
              <p className="text-sm font-medium text-surface-800">{t('notifications.alerts.billing')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-surface-400">{t('notifications.alerts.billingDesc')}</p>
            </label>
            <Toggle enabled={billingSummary} onChange={setBillingSummary} id="billing-alert" />
          </div>
        </div>
      </SectionCard>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {t('settings.saved')}
          </div>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-genesis-600 to-genesis-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-genesis-500/25 transition-all hover:from-genesis-700 hover:to-genesis-600 active:scale-[0.98]"
        >
          <Save className="h-4 w-4" />
          {t('settings.saveChanges')}
        </button>
      </div>
    </div>
  )
}

/* ─── Billing Tab ─── */

function BillingContent() {
  const { t } = useI18n()

  const features = t('billing.plan.features')
  const invoices = t('billing.history.invoices')

  return (
    <div className="flex flex-col gap-5">
      {/* Current Plan */}
      <div className="overflow-hidden rounded-xl border border-genesis-200/60 shadow-sm">
        <div className="bg-gradient-to-br from-genesis-700 via-genesis-600 to-genesis-500 px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-genesis-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-genesis-200">{t('billing.plan.title')}</span>
              </div>
              <h3 className="mt-2 text-2xl font-bold">{t('billing.plan.name')}</h3>
              <p className="mt-1 text-genesis-200">{t('billing.plan.price')}</p>
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {t('billing.plan.status')}
            </span>
          </div>
          <p className="mt-3 text-xs text-genesis-200">{t('billing.plan.renews')}</p>
        </div>

        <div className="bg-white px-6 py-4">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Array.isArray(features) && features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-surface-600">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-genesis-500" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-3 border-t border-surface-100 pt-4">
            <button className="flex items-center gap-2 rounded-lg bg-genesis-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-genesis-700">
              <Zap className="h-3.5 w-3.5" />
              {t('billing.plan.upgrade')}
            </button>
            <button className="rounded-lg border border-surface-200 px-4 py-2 text-xs font-semibold text-surface-600 transition-colors hover:bg-surface-50">
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
              <p className="text-2xl font-bold text-surface-900">{t('billing.usage.used')}</p>
              <p className="mt-0.5 text-xs text-surface-400">
                / {t('billing.usage.limit')} {t('billing.usage.unit')}
              </p>
            </div>
            <div className="text-end">
              <span className="text-lg font-bold text-genesis-600">{t('billing.usage.percent')}</span>
              <p className="text-[11px] text-surface-400">{t('billing.usage.period')}</p>
            </div>
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-surface-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-genesis-600 to-genesis-400 transition-all"
              style={{ width: '68%' }}
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
              <span className="text-xs font-bold tracking-wider text-white">VISA</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-800">
                {t('billing.payment.cardType')} •••• {t('billing.payment.cardLast4')}
              </p>
              <p className="text-xs text-surface-400">
                Exp. {t('billing.payment.cardExpiry')}
                <span className="ms-2 rounded bg-surface-100 px-1.5 py-0.5 text-[10px] font-semibold text-surface-500">
                  {t('billing.payment.default')}
                </span>
              </p>
            </div>
          </div>
          <button className="rounded-lg border border-surface-200 px-4 py-2 text-xs font-semibold text-surface-600 transition-colors hover:bg-surface-50">
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
              {Array.isArray(invoices) && invoices.map((inv, i) => (
                <tr key={i} className="group">
                  <td className="py-3 text-xs text-surface-500">{inv.date}</td>
                  <td className="py-3 text-xs font-medium text-surface-700">{inv.desc}</td>
                  <td className="py-3 text-end text-xs font-semibold text-surface-800">{inv.amount}</td>
                  <td className="py-3 text-end">
                    <button className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-genesis-600 transition-colors hover:bg-genesis-50">
                      <Download className="h-3 w-3" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

/* ─── Guardrails Tab (unchanged logic) ─── */

function GuardrailsContent() {
  const { t } = useI18n()
  const [autoApprove, setAutoApprove] = useState(true)
  const [expenseLimit, setExpenseLimit] = useState('500')
  const [expenseCurrency, setExpenseCurrency] = useState('ILS')
  const [sendEmails, setSendEmails] = useState(false)
  const [publishJobs, setPublishJobs] = useState(false)
  const [manualSign, setManualSign] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <div className="flex flex-col gap-5">
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
              <div className="flex items-center gap-2">
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
                {t('settings.anythingAbove')} {expenseCurrency === 'ILS' ? '₪' : expenseCurrency === 'USD' ? '$' : '€'}{expenseLimit} {t('settings.aboveThreshold')}
              </p>
            </div>
          )}
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
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-genesis-600 to-genesis-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-genesis-500/25 transition-all hover:from-genesis-700 hover:to-genesis-600 active:scale-[0.98]"
        >
          <Save className="h-4 w-4" />
          {t('settings.saveChanges')}
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
