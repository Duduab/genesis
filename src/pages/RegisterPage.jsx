import { useEffect, useMemo, useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { Link, useRouter } from '../router'
import AuthHeroPanel from '../components/AuthHeroPanel'
import {
  BUDGET_MAX_NIS,
  BUDGET_MIN_NIS,
  BUDGET_STEP_NIS,
  BUSINESS_CATEGORIES,
  CITY_IDS,
} from '../config/businessCategories'
import { readWizardStep1OrNull, saveWizardStep1 } from '../wizard/createBusinessWizardStorage'

function formatBudgetShort(nis) {
  if (nis >= 1_000_000) return '1M'
  const k = nis / 1000
  return Number.isInteger(k) ? `${k}K` : `${Math.round(k)}K`
}

function interpolate(template, vars) {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, String(v)), template)
}

const ACCENT = {
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

function CategoryIcon({ name, className }) {
  const Cmp = LucideIcons[name] || LucideIcons.Circle
  return <Cmp className={className} aria-hidden />
}

export default function RegisterPage() {
  const { t, locale, toggleLocale } = useI18n()
  const { navigate } = useRouter()
  const [categoryId, setCategoryId] = useState(null)
  const [subTypeId, setSubTypeId] = useState(null)
  const [budgetNis, setBudgetNis] = useState(BUDGET_MIN_NIS)
  const [cityId, setCityId] = useState(null)
  const [licenseType, setLicenseType] = useState(null)

  useEffect(() => {
    const saved = readWizardStep1OrNull()
    if (!saved) return
    setCategoryId(saved.categoryId)
    setSubTypeId(saved.subTypeId)
    setBudgetNis(saved.budgetNis)
    setCityId(saved.cityId)
    setLicenseType(saved.licenseType)
  }, [])

  const selectedCategory = useMemo(
    () => BUSINESS_CATEGORIES.find((c) => c.id === categoryId) ?? null,
    [categoryId],
  )

  const accentKey = selectedCategory?.accent ?? 'cyan'
  const accent = ACCENT[accentKey] ?? ACCENT.cyan

  const selectCategory = (id) => {
    setCategoryId(id)
    setSubTypeId(null)
  }

  const budgetRangeText = interpolate(t('createBusiness.budgetValueFormat'), {
    min: formatBudgetShort(BUDGET_MIN_NIS),
    max: formatBudgetShort(BUDGET_MAX_NIS),
  })

  const budgetSelectedText = interpolate(t('createBusiness.budgetSelectedFormat'), {
    value: formatBudgetShort(budgetNis),
  })

  const canProceedStep1 = Boolean(categoryId && subTypeId && cityId && licenseType)

  const handleNext = () => {
    if (!canProceedStep1 || !categoryId || !subTypeId || !cityId || !licenseType) return
    saveWizardStep1({
      categoryId,
      subTypeId,
      budgetNis,
      cityId,
      licenseType,
    })
    navigate('/register/step2')
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
          <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:max-w-xl sm:p-8">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200/70">
              {t('createBusiness.stepProgress')}
            </p>
            <div className="mt-3 flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i < 1 ? 'bg-gradient-to-r from-cyan-400 to-violet-500' : 'bg-white/10'}`}
                />
              ))}
            </div>
            <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">
              {t('createBusiness.title')}
            </h1>

            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-white/90">{t('createBusiness.categoriesHeading')}</h2>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {BUSINESS_CATEGORIES.map((cat) => {
                  const a = ACCENT[cat.accent]
                  const isOn = categoryId === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => selectCategory(cat.id)}
                      className={`flex flex-col items-center gap-2 rounded-xl border bg-white/[0.04] px-2 py-4 text-center transition-all sm:py-5 ${
                        isOn ? `${a.ring} ring-2` : a.idle
                      }`}
                    >
                      <CategoryIcon name={cat.iconName} className="h-7 w-7 text-white/85 sm:h-8 sm:w-8" />
                      <span className="text-[11px] font-medium leading-tight text-white/90 sm:text-xs">{t(cat.i18nKey)}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            {selectedCategory && (
              <section className="mt-7">
                <h2 className="mb-3 text-sm font-semibold text-white/90">{t('createBusiness.businessTypeHeading')}</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {selectedCategory.subTypes.map((st) => {
                    const isOn = subTypeId === st.id
                    const a = ACCENT[selectedCategory.accent]
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

            <section className="mt-7">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-sm font-semibold text-white/90">{t('createBusiness.budgetLabel')}</h2>
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

            <section className="mt-7">
              <h2 className="mb-3 text-sm font-semibold text-white/90">{t('createBusiness.cityLabel')}</h2>
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

            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-white/90">{t('createBusiness.licensingHeading')}</h2>
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

          <footer className="relative z-10 mx-auto mt-4 w-full max-w-lg shrink-0 sm:max-w-xl">
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceedStep1}
              className="btn-authora-gradient flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold text-[#020617] transition-all active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45"
            >
              {t('createBusiness.nextStepButton')}
            </button>
            <p className="mt-4 text-center text-sm text-white/50">
              {t('createBusiness.hasAccount')}{' '}
              <Link to="/login" className="font-semibold text-cyan-300/90 underline-offset-2 hover:text-cyan-200 hover:underline">
                {t('createBusiness.signIn')}
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
