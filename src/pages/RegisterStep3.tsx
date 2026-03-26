import { useMemo } from 'react'
import { ArrowLeft, ArrowRight, DollarSign } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { Link, useRouter } from '../router'
import AuthHeroPanel from '../components/AuthHeroPanel'
import { getBusinessAnalysisProfile } from '../config/businessAnalysisProfiles'
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

type SummaryRow = { labelKey: string; value: string }

export default function RegisterStep3() {
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
  const cityLabel = t(`createBusiness.city.${step1.cityId}`)
  const budgetFormatted = formatNisFull(step1.budgetNis, locale)
  const structureLabel = t(licenseTitleKey(step1.licenseType))
  const revenueFormatted = formatNisFull(profile.expectedMonthlyRevenueNis, locale)
  const employeesFormatted = interpolate(t('createBusiness.step3.employees_count_format'), {
    count: String(profile.recommendedEmployees),
  })

  const rows: SummaryRow[] = useMemo(
    () => [
      { labelKey: 'createBusiness.step3.label_business_type', value: businessTypeLabel },
      { labelKey: 'createBusiness.step3.label_city', value: cityLabel },
      { labelKey: 'createBusiness.step3.label_budget', value: budgetFormatted },
      { labelKey: 'createBusiness.step3.label_structure', value: structureLabel },
      { labelKey: 'createBusiness.step3.label_revenue', value: revenueFormatted },
      { labelKey: 'createBusiness.step3.label_employees', value: employeesFormatted },
    ],
    [
      businessTypeLabel,
      cityLabel,
      budgetFormatted,
      structureLabel,
      revenueFormatted,
      employeesFormatted,
    ],
  )

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
              {t('createBusiness.step3.stepProgress')}
            </p>
            <div className="mt-3 flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i < 3 ? 'bg-gradient-to-r from-cyan-400 to-violet-500' : 'bg-white/10'}`}
                />
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_32px_rgba(52,211,153,0.45)] ring-4 ring-emerald-400/25">
                <DollarSign className="h-9 w-9 text-white" strokeWidth={2.25} aria-hidden />
              </div>
            </div>

            <h1 className="mt-5 text-center text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">
              {t('createBusiness.step3.summary_title')}
            </h1>
            <p className="mt-2 text-center text-sm text-white/55">{t('createBusiness.step3.summary_subtitle')}</p>
          </div>

          <div className="mx-auto mt-6 flex min-h-0 w-full max-w-lg flex-1 flex-col overflow-y-auto sm:max-w-xl">
            <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-6">
              <div className="overflow-hidden rounded-xl border border-white/5 bg-[#0c0814]/90">
                {rows.map((row, index) => (
                  <div
                    key={row.labelKey}
                    className={`flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4 ${
                      index < rows.length - 1 ? 'border-b border-white/[0.08]' : ''
                    }`}
                  >
                    <span className="shrink-0 text-start text-xs font-medium text-white/50">{t(row.labelKey)}</span>
                    <span className="min-w-0 text-end text-sm font-semibold tabular-nums text-white">{row.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <footer className="relative z-10 mx-auto mt-4 flex w-full max-w-lg shrink-0 gap-3 sm:max-w-xl">
            <button
              type="button"
              onClick={() => navigate('/register/step2')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/70 bg-transparent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              {t('createBusiness.step3.btn_back')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/register/step4')}
              className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-all hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.99]"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              {t('createBusiness.step3.btn_continue_location')}
            </button>
          </footer>
        </div>
      </div>
    </div>
  )
}
