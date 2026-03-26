import { useMemo } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, DollarSign, Sparkles } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { Link, useRouter } from '../router'
import AuthHeroPanel from '../components/AuthHeroPanel'
import { getBusinessAnalysisProfile, budgetMeetsMinimum } from '../config/businessAnalysisProfiles'
import { loadWizardStep1 } from '../wizard/createBusinessWizardStorage'
import { BUSINESS_CATEGORIES } from '../config/businessCategories'
import type { LicenseTypeId } from '../types/business'
import { formatNisFull } from '../utils/formatNis'

function interpolate(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v), template)
}

function licenseTitleKey(license: LicenseTypeId): string {
  return license === 'ltd' ? 'createBusiness.licenseLtdTitle' : 'createBusiness.licenseAuthorizedTitle'
}

export default function RegisterStep2() {
  const { t, locale, toggleLocale } = useI18n()
  const { navigate } = useRouter()

  const step1 = useMemo(() => loadWizardStep1(), [])
  const profile = useMemo(
    () => getBusinessAnalysisProfile(step1.categoryId, step1.subTypeId),
    [step1.categoryId, step1.subTypeId],
  )

  const subTypeConfig = useMemo(() => {
    const cat = BUSINESS_CATEGORIES.find((c) => c.id === step1.categoryId)
    return cat?.subTypes.find((s) => s.id === step1.subTypeId)
  }, [step1.categoryId, step1.subTypeId])

  const businessTypeLabel = subTypeConfig ? t(subTypeConfig.i18nKey) : step1.subTypeId

  const minFormatted = formatNisFull(profile.minSetupCapitalNis, locale)
  const revenueFormatted = formatNisFull(profile.expectedMonthlyRevenueNis, locale)
  const budgetOk = budgetMeetsMinimum(step1.budgetNis, profile)

  const openingCostsBody = interpolate(t('createBusiness.step2.opening_costs_body'), {
    amount: minFormatted,
  })

  const employeesDescription = interpolate(t('createBusiness.step2.employees_description'), {
    businessType: businessTypeLabel,
  })

  const analysisMinimumLabel = interpolate(t('createBusiness.step2.analysis_minimum_label'), {
    amount: minFormatted,
  })

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
              {t('createBusiness.step2.stepProgress')}
            </p>
            <div className="mt-3 flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i < 2 ? 'bg-gradient-to-r from-cyan-400 to-violet-500' : 'bg-white/10'}`}
                />
              ))}
            </div>
            <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">
              {t('createBusiness.title')}
            </h1>
          </div>

          <div className="mx-auto mt-6 flex min-h-0 w-full max-w-lg flex-1 flex-col gap-4 overflow-y-auto sm:max-w-xl">
            {/* Card 1 — Initial analysis */}
            <section className="rounded-2xl border border-white/10 bg-[#14101f]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-6">
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

            {/* Card 2 — Plan details */}
            <section className="rounded-2xl border border-white/10 bg-[#14101f]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-6">
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
                  <p className="text-sm font-medium text-white/90">{t(licenseTitleKey(step1.licenseType))}</p>
                </div>
              </div>
            </section>
          </div>

          <footer className="relative z-10 mx-auto mt-4 flex w-full max-w-lg shrink-0 gap-3 sm:max-w-xl">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
            >
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              {t('createBusiness.step2.back_button')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/register/step3')}
              className="btn-authora-gradient flex flex-[2] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#020617] transition-all active:scale-[0.99]"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              {t('createBusiness.step2.continue_payment_button')}
            </button>
          </footer>
        </div>
      </div>
    </div>
  )
}
