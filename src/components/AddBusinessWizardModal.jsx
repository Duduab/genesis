import { useEffect, useMemo, useState } from 'react'
import * as LucideIcons from 'lucide-react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Loader2,
  MapPin,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../auth/AuthContext'
import {
  BUDGET_MAX_NIS,
  BUDGET_MIN_NIS,
  BUDGET_STEP_NIS,
  BUSINESS_CATEGORIES,
  CITY_IDS,
} from '../config/businessCategories'
import { getBusinessAnalysisProfile, budgetMeetsMinimum } from '../config/businessAnalysisProfiles'
import {
  ADVANTAGE_COUNT,
  CHALLENGE_COUNT,
  getLocationInsightBundlePrefix,
  RATIONALE_COUNT,
} from '../config/locationInsightBundles'
import { submitBusinessRegistration } from '../api/submitBusinessRegistration'
import { saveDashboardBusinessProfile } from '../dashboard/dashboardBusinessProfileStorage'
import { upsertPersistedGenesisBusiness } from '../dashboard/genesisBusinessStorage'
import {
  clearModalWizardStorage,
  loadModalWizardStep1,
  saveModalWizardStep1,
} from '../wizard/createBusinessWizardStorage'
import { formatNisFull } from '../utils/formatNis'

const ACCENT_DARK = {
  cyan: {
    ring: 'ring-cyan-400/90 shadow-[0_0_28px_rgba(34,211,238,0.38)] border-cyan-400/55',
    idle: 'border-white/10 hover:border-cyan-400/25',
    slider: 'accent-cyan-400',
  },
  violet: {
    ring: 'ring-violet-400/90 shadow-[0_0_28px_rgba(167,139,250,0.38)] border-violet-400/55',
    idle: 'border-white/10 hover:border-violet-400/25',
    slider: 'accent-violet-400',
  },
  fuchsia: {
    ring: 'ring-fuchsia-400/90 shadow-[0_0_28px_rgba(232,121,249,0.38)] border-fuchsia-400/55',
    idle: 'border-white/10 hover:border-fuchsia-400/25',
    slider: 'accent-fuchsia-400',
  },
}

function formatBudgetShort(nis) {
  if (nis >= 1_000_000) return '1M'
  const k = nis / 1000
  return Number.isInteger(k) ? `${k}K` : `${Math.round(k)}K`
}

function interpolate(template, vars) {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, String(v)), template)
}

function CategoryIcon({ name, className }) {
  const Cmp = LucideIcons[name] || LucideIcons.Circle
  return <Cmp className={className} aria-hidden />
}

function licenseTitleKey(license) {
  return license === 'ltd' ? 'createBusiness.licenseLtdTitle' : 'createBusiness.licenseAuthorizedTitle'
}

function resolveLocationInsights(prefix, t) {
  return {
    primaryLocation: t(`${prefix}.primary_location`),
    alternativeLocation: t(`${prefix}.alternative_location`),
    rationale: Array.from({ length: RATIONALE_COUNT }, (_, i) => t(`${prefix}.rationale_${i + 1}`)),
    advantages: Array.from({ length: ADVANTAGE_COUNT }, (_, i) => t(`${prefix}.advantage_${i + 1}`)),
    challenges: Array.from({ length: CHALLENGE_COUNT }, (_, i) => t(`${prefix}.challenge_${i + 1}`)),
  }
}

function buildModalPayload(step1, t, user) {
  const profile = getBusinessAnalysisProfile(step1.categoryId, step1.subTypeId)
  const prefix = getLocationInsightBundlePrefix(step1.cityId, step1.categoryId)
  return {
    user: {
      fullName: (user?.displayName || 'Account').trim(),
      email: (user?.email || 'account@genesis.local').trim(),
      username: (user?.username || 'user').trim(),
      phone: (user?.phone || '+972500000000').trim(),
      password: '',
    },
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

export default function AddBusinessWizardModal({ open, onClose }) {
  const { t, locale, toggleLocale } = useI18n()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [categoryId, setCategoryId] = useState(null)
  const [subTypeId, setSubTypeId] = useState(null)
  const [budgetNis, setBudgetNis] = useState(BUDGET_MIN_NIS)
  const [cityId, setCityId] = useState(null)
  const [licenseType, setLicenseType] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitErr, setSubmitErr] = useState('')

  useEffect(() => {
    if (!open) return
    clearModalWizardStorage()
    setStep(1)
    setCategoryId(null)
    setSubTypeId(null)
    setBudgetNis(BUDGET_MIN_NIS)
    setCityId(null)
    setLicenseType(null)
    setSubmitErr('')
    setSubmitting(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const selectedCategory = useMemo(() => BUSINESS_CATEGORIES.find((c) => c.id === categoryId) ?? null, [categoryId])
  const accentKey = selectedCategory?.accent ?? 'cyan'
  const accent = ACCENT_DARK[accentKey] ?? ACCENT_DARK.cyan

  const budgetRangeText = interpolate(t('createBusiness.budgetValueFormat'), {
    min: formatBudgetShort(BUDGET_MIN_NIS),
    max: formatBudgetShort(BUDGET_MAX_NIS),
  })
  const budgetSelectedText = interpolate(t('createBusiness.budgetSelectedFormat'), {
    value: formatBudgetShort(budgetNis),
  })

  const canProceedStep1 = Boolean(categoryId && subTypeId && cityId && licenseType)

  const step1Saved = useMemo(() => loadModalWizardStep1(), [step])

  const handleStep1Next = () => {
    if (!canProceedStep1) return
    saveModalWizardStep1({
      categoryId,
      subTypeId,
      budgetNis,
      cityId,
      licenseType,
    })
    setStep(2)
  }

  const profile = useMemo(
    () => getBusinessAnalysisProfile(step1Saved.categoryId, step1Saved.subTypeId),
    [step1Saved.categoryId, step1Saved.subTypeId],
  )

  const subTypeConfig = useMemo(() => {
    const cat = BUSINESS_CATEGORIES.find((c) => c.id === step1Saved.categoryId)
    return cat?.subTypes.find((s) => s.id === step1Saved.subTypeId)
  }, [step1Saved.categoryId, step1Saved.subTypeId])

  const businessTypeLabel = subTypeConfig ? t(subTypeConfig.i18nKey) : step1Saved.subTypeId
  const minFormatted = formatNisFull(profile.minSetupCapitalNis, locale)
  const revenueFormatted = formatNisFull(profile.expectedMonthlyRevenueNis, locale)
  const budgetOk = budgetMeetsMinimum(step1Saved.budgetNis, profile)
  const openingCostsBody = interpolate(t('createBusiness.step2.opening_costs_body'), { amount: minFormatted })
  const employeesDescription = interpolate(t('createBusiness.step2.employees_description'), {
    businessType: businessTypeLabel,
  })
  const analysisMinimumLabel = interpolate(t('createBusiness.step2.analysis_minimum_label'), { amount: minFormatted })

  const cityLabel = t(`createBusiness.city.${step1Saved.cityId}`)
  const budgetFormatted = formatNisFull(step1Saved.budgetNis, locale)
  const structureLabel = t(licenseTitleKey(step1Saved.licenseType))
  const employeesFormatted = interpolate(t('createBusiness.step3.employees_count_format'), {
    count: String(profile.recommendedEmployees),
  })

  const step3Rows = useMemo(
    () => [
      { labelKey: 'createBusiness.step3.label_business_type', value: businessTypeLabel },
      { labelKey: 'createBusiness.step3.label_city', value: cityLabel },
      { labelKey: 'createBusiness.step3.label_budget', value: budgetFormatted },
      { labelKey: 'createBusiness.step3.label_structure', value: structureLabel },
      { labelKey: 'createBusiness.step3.label_revenue', value: revenueFormatted },
      { labelKey: 'createBusiness.step3.label_employees', value: employeesFormatted },
    ],
    [businessTypeLabel, cityLabel, budgetFormatted, structureLabel, revenueFormatted, employeesFormatted],
  )

  const bundlePrefix = useMemo(
    () => getLocationInsightBundlePrefix(step1Saved.cityId, step1Saved.categoryId),
    [step1Saved.cityId, step1Saved.categoryId],
  )
  const insights = useMemo(() => resolveLocationInsights(bundlePrefix, t), [bundlePrefix, locale, t])

  const handleFinish = async () => {
    const s1 = loadModalWizardStep1()
    setSubmitting(true)
    setSubmitErr('')
    try {
      const payload = buildModalPayload(s1, t, user)
      const created = await submitBusinessRegistration(payload)
      if (created?.data) {
        upsertPersistedGenesisBusiness(created.data, s1.licenseType)
      }
      saveDashboardBusinessProfile(payload.business)
      clearModalWizardStorage()
      onClose?.()
    } catch {
      setSubmitErr(t('createBusiness.step5.error_registration_failed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const selectCategory = (id) => {
    setCategoryId(id)
    setSubTypeId(null)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030712]/75 p-3 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-business-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        className="animate-fade-in relative flex max-h-[min(94vh,980px)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/[0.14] bg-gradient-to-br from-[#221038] via-[#150a22] to-[#050208] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_28px_90px_-24px_rgba(0,0,0,0.85),0_0_140px_-30px_rgba(124,58,237,0.42),0_0_90px_-35px_rgba(34,211,238,0.18)] ring-2 ring-violet-500/15 sm:max-w-3xl lg:max-w-[56rem]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,rgba(167,139,250,0.22),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_45%_at_100%_100%,rgba(34,211,238,0.1),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <header className="relative z-10 flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8 sm:py-6">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-violet-300/80 sm:text-xs">
              {interpolate(t('createBusiness.modalProgress'), { current: String(step), total: '4' })}
            </p>
            <h2
              id="add-business-modal-title"
              className="mt-1.5 truncate text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-[1.65rem] lg:leading-tight"
            >
              {t('createBusiness.modalTitle')}
            </h2>
            <p className="mt-1 hidden text-sm text-white/45 sm:block">{t('createBusiness.modalTitleSub')}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleLocale}
              className="rounded-xl border border-white/20 bg-white/[0.07] px-3 py-2 text-[11px] font-semibold text-white/90 shadow-inner shadow-white/5 transition-all hover:border-white/30 hover:bg-white/10 sm:text-xs"
            >
              {locale === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}
            </button>
            <button
              type="button"
              onClick={() => onClose?.()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white/75 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white sm:h-11 sm:w-11"
              aria-label={t('createBusiness.modalClose')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="relative z-10 flex gap-1.5 px-5 pt-4 sm:px-8 sm:pt-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step
                  ? 'bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-500 shadow-[0_0_12px_rgba(167,139,250,0.5)]'
                  : 'bg-white/[0.08]'
              }`}
            />
          ))}
        </div>

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-7 lg:py-8">
          {step === 1 && (
            <div className="space-y-6">
              <section>
                <h3 className="mb-4 text-base font-semibold text-white sm:text-lg">{t('createBusiness.categoriesHeading')}</h3>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                  {BUSINESS_CATEGORIES.map((cat) => {
                    const a = ACCENT_DARK[cat.accent] ?? ACCENT_DARK.cyan
                    const isOn = categoryId === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => selectCategory(cat.id)}
                        className={`flex flex-col items-center gap-2.5 rounded-2xl border bg-white/[0.05] px-2 py-5 text-center transition-all sm:gap-3 sm:py-6 lg:py-7 ${
                          isOn ? `${a.ring} ring-2` : a.idle
                        }`}
                      >
                        <CategoryIcon name={cat.iconName} className="h-8 w-8 text-white/90 sm:h-9 sm:w-9 lg:h-10 lg:w-10" />
                        <span className="text-xs font-medium leading-tight text-white/90 sm:text-[13px]">
                          {t(cat.i18nKey)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>

              {selectedCategory && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold text-white/90">{t('createBusiness.businessTypeHeading')}</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {selectedCategory.subTypes.map((st) => {
                      const isOn = subTypeId === st.id
                      const a = ACCENT_DARK[selectedCategory.accent] ?? ACCENT_DARK.cyan
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSubTypeId(st.id)}
                          className={`rounded-xl border bg-white/[0.04] px-3 py-3 text-center text-xs font-medium text-white/90 transition-all sm:text-[13px] ${
                            isOn ? `${a.ring} ring-2` : a.idle
                          }`}
                        >
                          {t(st.i18nKey)}
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}

              <section>
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white/90">{t('createBusiness.budgetLabel')}</h3>
                  <span className="text-sm font-semibold text-cyan-200/90">{budgetSelectedText}</span>
                </div>
                <p className="mb-2 text-[11px] text-white/45">{budgetRangeText}</p>
                <input
                  type="range"
                  min={BUDGET_MIN_NIS}
                  max={BUDGET_MAX_NIS}
                  step={BUDGET_STEP_NIS}
                  value={budgetNis}
                  onChange={(e) => setBudgetNis(Number(e.target.value))}
                  className={`h-2 w-full cursor-pointer rounded-full bg-white/10 ${accent.slider}`}
                />
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold text-white/90">{t('createBusiness.cityLabel')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {CITY_IDS.map((id) => {
                    const isOn = cityId === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setCityId(id)}
                        className={`rounded-xl border bg-white/[0.04] px-3 py-3.5 text-sm font-medium text-white/90 transition-all ${
                          isOn ? `${accent.ring} ring-2` : accent.idle
                        }`}
                      >
                        {t(`createBusiness.city.${id}`)}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold text-white/90">{t('createBusiness.licensingHeading')}</h3>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setLicenseType('authorized_dealer')}
                    className={`rounded-2xl border bg-white/[0.04] p-4 text-start transition-all sm:p-5 ${
                      licenseType === 'authorized_dealer' ? `${accent.ring} ring-2` : accent.idle
                    }`}
                  >
                    <span className="block text-sm font-semibold text-white">{t('createBusiness.licenseAuthorizedTitle')}</span>
                    <p className="mt-2 text-xs leading-relaxed text-white/55">{t('createBusiness.licenseAuthorizedDesc')}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLicenseType('ltd')}
                    className={`rounded-2xl border bg-white/[0.04] p-4 text-start transition-all sm:p-5 ${
                      licenseType === 'ltd' ? `${accent.ring} ring-2` : accent.idle
                    }`}
                  >
                    <span className="block text-sm font-semibold text-white">{t('createBusiness.licenseLtdTitle')}</span>
                    <p className="mt-2 text-xs leading-relaxed text-white/55">{t('createBusiness.licenseLtdDesc')}</p>
                  </button>
                </div>
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <section className="rounded-2xl border border-white/10 bg-[#14101f]/80 p-5 backdrop-blur-xl sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-bold text-white">{t('createBusiness.step2.analysis_card_title')}</h2>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                    <Sparkles className="h-5 w-5" aria-hidden />
                  </div>
                </div>
                <p className="mt-4 text-sm font-medium text-white/85">{analysisMinimumLabel}</p>
                {budgetOk && (
                  <div className="mt-4 rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
                      <span className="text-sm font-semibold text-emerald-100">{t('createBusiness.step2.status_budget_enough')}</span>
                    </div>
                  </div>
                )}
                <p className="mt-4 text-xs leading-relaxed text-white/55">{openingCostsBody}</p>
              </section>
              <section className="rounded-2xl border border-white/10 bg-[#14101f]/80 p-5 backdrop-blur-xl sm:p-6">
                <h2 className="text-base font-bold text-white">{t('createBusiness.step2.plan_card_title')}</h2>
                <div className="mt-5">
                  <p className="text-xs font-semibold text-white/70">{t('createBusiness.step2.recommended_employees_label')}</p>
                  <div className="mt-2 flex items-stretch justify-between gap-3 rounded-xl border border-white/5 bg-black/30 px-3 py-3 sm:px-4">
                    <p className="max-w-[62%] text-[11px] leading-relaxed text-white/50 sm:text-xs">
                      {t('createBusiness.step2.genesis_recommendation_label')}
                    </p>
                    <span className="text-2xl font-bold tabular-nums text-white">{profile.recommendedEmployees}</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-white/45 sm:text-xs">{employeesDescription}</p>
                </div>
                <div className="mt-6">
                  <p className="text-xs font-semibold text-white/70">{t('createBusiness.step2.expected_revenue_label')}</p>
                  <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 backdrop-blur-sm">
                    <div>
                      <p className="text-xs font-semibold text-emerald-200/90">{t('createBusiness.step2.revenue_estimate_title')}</p>
                      <p className="mt-1 text-lg font-bold tabular-nums text-emerald-100">{revenueFormatted}</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                      <DollarSign className="h-5 w-5" aria-hidden />
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-xs font-semibold text-white/70">{t('createBusiness.step2.business_structure_label')}</p>
                  <div className="mt-2 rounded-xl border border-white/5 bg-black/30 px-4 py-3.5">
                    <p className="text-sm font-medium text-white/90">{t(licenseTitleKey(step1Saved.licenseType))}</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_32px_rgba(52,211,153,0.45)] ring-4 ring-emerald-400/25">
                  <DollarSign className="h-9 w-9 text-white" strokeWidth={2.25} aria-hidden />
                </div>
              </div>
              <h2 className="text-center text-xl font-bold tracking-tight text-white sm:text-[1.4rem]">
                {t('createBusiness.step3.summary_title')}
              </h2>
              <p className="text-center text-sm text-white/55">{t('createBusiness.step3.summary_subtitle')}</p>
              <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl sm:p-6">
                <div className="overflow-hidden rounded-xl border border-white/5 bg-[#0c0814]/90">
                  {step3Rows.map((row, index) => (
                    <div
                      key={row.labelKey}
                      className={`flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4 ${
                        index < step3Rows.length - 1 ? 'border-b border-white/[0.08]' : ''
                      }`}
                    >
                      <span className="shrink-0 text-start text-xs font-medium text-white/50">{t(row.labelKey)}</span>
                      <span className="min-w-0 text-end text-sm font-semibold tabular-nums text-white">{row.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {step === 4 && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 flex-1 pe-2 text-lg font-bold text-white sm:text-xl">
                  {t('createBusiness.step4.recommended_location_title')}
                </h2>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200">
                  <MapPin className="h-5 w-5" aria-hidden />
                </div>
              </div>
              <p className="mt-3 text-lg font-semibold text-sky-300 sm:text-xl">{insights.primaryLocation}</p>
              <h3 className="mt-8 text-sm font-bold text-white">{t('createBusiness.step4.why_this_location')}</h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {insights.rationale.map((text, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/35 px-3.5 py-3 sm:px-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
                    <span className="text-sm leading-relaxed text-white/80">{text}</span>
                  </li>
                ))}
              </ul>
              <h3 className="mt-8 text-sm font-bold text-white">{t('createBusiness.step4.advantages_title')}</h3>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {insights.advantages.map((text, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-3">
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                    <span className="text-xs font-medium leading-relaxed text-emerald-50/95 sm:text-sm">{text}</span>
                  </div>
                ))}
              </div>
              <h3 className="mt-8 text-sm font-bold text-white">{t('createBusiness.step4.challenges_title')}</h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {insights.challenges.map((text, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-amber-600/45 bg-amber-950/35 px-3.5 py-3 sm:px-4"
                  >
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
                    <span className="text-sm leading-relaxed text-amber-50/90">{text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl border border-white/10 bg-black/25 px-4 py-4">
                <div className="flex items-center gap-2 text-white/55">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-wide">{t('createBusiness.step4.alternative_location')}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-white/85">{insights.alternativeLocation}</p>
              </div>
            </section>
          )}
        </div>

        {submitErr ? (
          <p className="relative z-10 border-t border-red-500/20 bg-red-950/40 px-5 py-3 text-center text-sm text-red-200 sm:px-8">
            {submitErr}
          </p>
        ) : null}

        <footer className="relative z-10 flex shrink-0 gap-3 border-t border-white/10 bg-[#0a0612]/90 px-5 py-4 backdrop-blur-sm sm:gap-4 sm:px-8 sm:py-5">
          {step === 1 && (
            <button
              type="button"
              onClick={handleStep1Next}
              disabled={!canProceedStep1}
              className="btn-authora-gradient flex h-12 w-full items-center justify-center rounded-xl text-base font-semibold text-[#020617] shadow-[0_8px_32px_-8px_rgba(34,211,238,0.45)] transition-all active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45"
            >
              {t('createBusiness.nextStepButton')}
            </button>
          )}
          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 sm:text-base"
              >
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                {t('createBusiness.step2.back_button')}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-authora-gradient flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#020617] shadow-[0_8px_32px_-8px_rgba(34,211,238,0.45)] transition-all active:scale-[0.99] sm:text-base"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                {t('createBusiness.step2.continue_payment_button')}
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/70 bg-transparent px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:text-base"
              >
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                {t('createBusiness.step3.btn_back')}
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 text-sm font-semibold text-white shadow-[0_0_28px_rgba(16,185,129,0.4)] transition-all hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.99] sm:text-base"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                {t('createBusiness.step3.btn_continue_location')}
              </button>
            </>
          )}
          {step === 4 && (
            <>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={submitting}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/70 bg-transparent px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50 sm:text-base"
              >
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                {t('createBusiness.step4.btn_back')}
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={submitting}
                className="btn-authora-gradient flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#020617] shadow-[0_8px_32px_-8px_rgba(34,211,238,0.45)] transition-all active:scale-[0.99] disabled:opacity-60 sm:text-base"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
                )}
                {t('createBusiness.modalSubmit')}
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  )
}
