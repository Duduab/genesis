import { useMemo } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { Link, useRouter } from '../router'
import AuthHeroPanel from '../components/AuthHeroPanel'
import { loadWizardStep1 } from '../wizard/createBusinessWizardStorage'
import {
  ADVANTAGE_COUNT,
  CHALLENGE_COUNT,
  getLocationInsightBundlePrefix,
  RATIONALE_COUNT,
} from '../config/locationInsightBundles'
import type { LocationInsightContent } from '../types/business'

function resolveLocationInsights(prefix: string, t: (key: string) => string): LocationInsightContent {
  return {
    primaryLocation: t(`${prefix}.primary_location`),
    alternativeLocation: t(`${prefix}.alternative_location`),
    rationale: Array.from({ length: RATIONALE_COUNT }, (_, i) => t(`${prefix}.rationale_${i + 1}`)),
    advantages: Array.from({ length: ADVANTAGE_COUNT }, (_, i) => t(`${prefix}.advantage_${i + 1}`)),
    challenges: Array.from({ length: CHALLENGE_COUNT }, (_, i) => t(`${prefix}.challenge_${i + 1}`)),
  }
}

export default function RegisterStep4() {
  const { t, locale, toggleLocale } = useI18n()
  const { navigate } = useRouter()

  const step1 = useMemo(() => loadWizardStep1(), [])
  const bundlePrefix = useMemo(
    () => getLocationInsightBundlePrefix(step1.cityId, step1.categoryId),
    [step1.cityId, step1.categoryId],
  )

  const insights = useMemo(() => resolveLocationInsights(bundlePrefix, t), [bundlePrefix, locale, t])

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
              {t('createBusiness.step4.stepProgress')}
            </p>
            <div className="mt-3 flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i < 4 ? 'bg-gradient-to-r from-cyan-400 to-violet-500' : 'bg-white/10'}`}
                />
              ))}
            </div>
          </div>

          <div className="mx-auto mt-5 flex min-h-0 w-full max-w-lg flex-1 flex-col overflow-y-auto sm:max-w-xl">
            <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <h1 className="min-w-0 flex-1 pe-2 text-lg font-bold text-white sm:pe-3 sm:text-xl">
                  {t('createBusiness.step4.recommended_location_title')}
                </h1>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200">
                  <MapPin className="h-5 w-5" aria-hidden />
                </div>
              </div>

              <p className="mt-3 text-lg font-semibold text-sky-300 sm:text-xl">{insights.primaryLocation}</p>

              {/* A — Why this location */}
              <h2 className="mt-8 text-sm font-bold text-white">{t('createBusiness.step4.why_this_location')}</h2>
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

              {/* B — Advantages */}
              <h2 className="mt-8 text-sm font-bold text-white">{t('createBusiness.step4.advantages_title')}</h2>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {insights.advantages.map((text, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-3"
                  >
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                    <span className="text-xs font-medium leading-relaxed text-emerald-50/95 sm:text-sm">{text}</span>
                  </div>
                ))}
              </div>

              {/* C — Challenges */}
              <h2 className="mt-8 text-sm font-bold text-white">{t('createBusiness.step4.challenges_title')}</h2>
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

              {/* D — Alternative */}
              <div className="mt-8 rounded-xl border border-white/10 bg-black/25 px-4 py-4">
                <div className="flex items-center gap-2 text-white/55">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-wide">{t('createBusiness.step4.alternative_location')}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-white/85">{insights.alternativeLocation}</p>
              </div>
            </section>
          </div>

          <footer className="relative z-10 mx-auto mt-4 flex w-full max-w-lg shrink-0 gap-3 sm:max-w-xl">
            <button
              type="button"
              onClick={() => navigate('/register/step3')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/70 bg-transparent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              {t('createBusiness.step4.btn_back')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/register/step5')}
              className="btn-authora-gradient flex flex-[2] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#020617] transition-all active:scale-[0.99]"
            >
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
              {t('createBusiness.step4.btn_create_business')}
            </button>
          </footer>
        </div>
      </div>
    </div>
  )
}
