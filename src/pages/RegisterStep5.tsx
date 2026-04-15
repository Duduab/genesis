import { useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { Link, useRouter } from '../router'
import AuthHeroPanel from '../components/AuthHeroPanel'
import { submitBusinessRegistration } from '../api/submitBusinessRegistration'
import { isGenesisApiError } from '../api/genesis/errors'
import { getBusinessAnalysisProfile } from '../config/businessAnalysisProfiles'
import { getLocationInsightBundlePrefix } from '../config/locationInsightBundles'
import { saveDashboardBusinessProfile } from '../dashboard/dashboardBusinessProfileStorage'
import { upsertPersistedGenesisBusiness } from '../dashboard/genesisBusinessStorage'
import { clearWizardStorage, loadWizardStep1 } from '../wizard/createBusinessWizardStorage'
import type { BusinessRegistrationPayload, LicenseTypeId, WizardStep1Persisted } from '../types/business'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldKey = 'fullName' | 'email' | 'username' | 'phone' | 'password' | 'confirmPassword'

function buildPayload(
  step1: WizardStep1Persisted,
  user: BusinessRegistrationPayload['user'],
  t: (k: string) => string,
): BusinessRegistrationPayload {
  const profile = getBusinessAnalysisProfile(step1.categoryId, step1.subTypeId)
  const prefix = getLocationInsightBundlePrefix(step1.cityId, step1.categoryId)
  return {
    user,
    business: {
      categoryId: step1.categoryId,
      subTypeId: step1.subTypeId,
      cityId: step1.cityId,
      budgetNis: step1.budgetNis,
      licenseType: step1.licenseType,
      recommendedEmployees: profile.recommendedEmployees,
      expectedMonthlyRevenueNis: profile.expectedMonthlyRevenueNis,
      recommendedLocation: t(`${prefix}.primary_location`),
      alternativeLocation: t(`${prefix}.alternative_location`),
    },
  }
}

export default function RegisterStep5() {
  const { t, locale, toggleLocale } = useI18n()
  const { navigate } = useRouter()

  const step1 = useMemo(() => loadWizardStep1(), [])

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const inputClass =
    'h-11 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 text-sm text-white placeholder:text-white/35 outline-none transition-all focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20'
  const inputClassWithStart = `${inputClass} ps-10`

  const validate = (): boolean => {
    const next: Partial<Record<FieldKey, string>> = {}
    const req = t('createBusiness.step5.error_required')

    if (!fullName.trim()) next.fullName = req
    if (!email.trim()) next.email = req
    else if (!EMAIL_RE.test(email.trim())) next.email = t('createBusiness.step5.error_email_invalid')
    if (!username.trim()) next.username = req
    if (!phone.trim()) next.phone = req
    if (!password) next.password = req
    if (!confirmPassword) next.confirmPassword = req
    else if (password !== confirmPassword) {
      next.confirmPassword = t('createBusiness.step5.error_password_mismatch')
    }

    setFieldErrors(next)
    setSubmitError('')
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setSubmitError('')

    const userPayload = {
      fullName: fullName.trim(),
      email: email.trim(),
      username: username.trim(),
      phone: phone.trim(),
      password,
    }

    const payload = buildPayload(step1, userPayload, t)

    try {
      const created = await submitBusinessRegistration(payload)
      upsertPersistedGenesisBusiness(created.data, payload.business.licenseType as LicenseTypeId)
      saveDashboardBusinessProfile(payload.business)
      clearWizardStorage()
      try {
        sessionStorage.setItem('genesis-reg-success', '1')
      } catch {
        /* ignore */
      }
      navigate('/login')
    } catch (e) {
      const msg = isGenesisApiError(e)
        ? e.userFacingMessage(t('createBusiness.step5.error_registration_failed'), t)
        : e instanceof Error
          ? e.message
          : t('createBusiness.step5.error_registration_failed')
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#0f0618]">
      <div className="hidden lg:block lg:w-1/2">
        <AuthHeroPanel />
      </div>

      <div className="relative flex min-h-0 w-full flex-1 flex-col bg-gradient-to-br from-[#1a0a2e] via-[#12081f] to-[#050208] lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.18),transparent)]" />

        <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-5 sm:px-10">
          <Link to="/register" className="flex items-center">
            <img
              src="/logos/logo-primary.png"
              alt={t('createBusiness.logoAlt')}
              className="h-11 w-auto max-w-[200px] object-contain opacity-95"
            />
          </Link>
          <button
            type="button"
            onClick={toggleLocale}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            {locale === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}
          </button>
        </header>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 sm:px-8 sm:pb-6">
          <div className="mx-auto w-full max-w-lg sm:max-w-xl">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200/70">
              {t('createBusiness.step5.stepProgress')}
            </p>
            <div className="mt-3 flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-1 flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" />
              ))}
            </div>
            <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">
              {t('createBusiness.step5.title')}
            </h1>
            <p className="mt-2 text-center text-sm text-white/55">{t('createBusiness.step5.subtitle')}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex min-h-0 w-full max-w-lg flex-1 flex-col overflow-y-auto sm:max-w-xl"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-6">
              {submitError ? (
                <p className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-100" role="alert">
                  {submitError}
                </p>
              ) : null}

              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="reg5-name" className="mb-1.5 block text-xs font-semibold text-white/70">
                    {t('createBusiness.step5.label_full_name')}
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="reg5-name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value)
                        setFieldErrors((p) => ({ ...p, fullName: undefined }))
                      }}
                      className={inputClassWithStart}
                    />
                  </div>
                  {fieldErrors.fullName ? <p className="mt-1 text-xs text-red-300">{fieldErrors.fullName}</p> : null}
                </div>

                <div>
                  <label htmlFor="reg5-email" className="mb-1.5 block text-xs font-semibold text-white/70">
                    {t('createBusiness.step5.label_email')}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="reg5-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setFieldErrors((p) => ({ ...p, email: undefined }))
                      }}
                      className={inputClassWithStart}
                    />
                  </div>
                  {fieldErrors.email ? <p className="mt-1 text-xs text-red-300">{fieldErrors.email}</p> : null}
                </div>

                <div>
                  <label htmlFor="reg5-user" className="mb-1.5 block text-xs font-semibold text-white/70">
                    {t('createBusiness.step5.label_username')}
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="reg5-user"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value)
                        setFieldErrors((p) => ({ ...p, username: undefined }))
                      }}
                      className={inputClassWithStart}
                    />
                  </div>
                  {fieldErrors.username ? <p className="mt-1 text-xs text-red-300">{fieldErrors.username}</p> : null}
                </div>

                <div>
                  <label htmlFor="reg5-phone" className="mb-1.5 block text-xs font-semibold text-white/70">
                    {t('createBusiness.step5.label_phone')}
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="reg5-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value)
                        setFieldErrors((p) => ({ ...p, phone: undefined }))
                      }}
                      className={inputClassWithStart}
                    />
                  </div>
                  {fieldErrors.phone ? <p className="mt-1 text-xs text-red-300">{fieldErrors.phone}</p> : null}
                </div>

                <div>
                  <label htmlFor="reg5-pw" className="mb-1.5 block text-xs font-semibold text-white/70">
                    {t('createBusiness.step5.label_password')}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="reg5-pw"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setFieldErrors((p) => ({ ...p, password: undefined, confirmPassword: undefined }))
                      }}
                      className={`${inputClassWithStart} pe-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password ? <p className="mt-1 text-xs text-red-300">{fieldErrors.password}</p> : null}
                </div>

                <div>
                  <label htmlFor="reg5-pw2" className="mb-1.5 block text-xs font-semibold text-white/70">
                    {t('createBusiness.step5.label_confirm_password')}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      id="reg5-pw2"
                      type={showPw2 ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        setFieldErrors((p) => ({ ...p, confirmPassword: undefined }))
                      }}
                      className={`${inputClassWithStart} pe-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw2(!showPw2)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                    >
                      {showPw2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword ? (
                    <p className="mt-1 text-xs text-red-300">{fieldErrors.confirmPassword}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <footer className="mt-4 flex w-full shrink-0 gap-3">
              <button
                type="button"
                onClick={() => navigate('/register/step4')}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/70 bg-transparent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                {t('createBusiness.step5.btn_back')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-authora-gradient flex flex-[2] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#020617] transition-all active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : null}
                {submitting ? t('createBusiness.step5.btn_submitting') : t('createBusiness.step5.btn_finish_register')}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  )
}
