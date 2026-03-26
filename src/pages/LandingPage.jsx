import { useState } from 'react'
import { ChevronRight, Shield, Landmark, Users, CreditCard, BadgeCheck, ArrowRight, Terminal, MessageSquare, Bot, Zap, Globe, Menu, X, Moon, Sun } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useTheme } from '../theme/ThemeContext'
import { Link } from '../router'

/* ────────────────────────────────────────────────
   Agent Card with glow border
   ──────────────────────────────────────────────── */
function AgentCard({ name, role, desc, caps, icon: Icon, gradient, glowColor, isDark = true }) {
  return (
    <div className="group relative">
      <div className={`pointer-events-none absolute -inset-[1px] rounded-2xl opacity-0 blur-[2px] transition-opacity duration-500 group-hover:opacity-100 ${glowColor}`} />

      <div
        className={`relative flex h-full flex-col overflow-hidden rounded-2xl p-7 backdrop-blur-md transition-all duration-500 ${
          isDark
            ? 'border border-white/[0.06] bg-slate-900/60 group-hover:border-white/[0.12] group-hover:bg-slate-900/80'
            : 'border border-slate-200 bg-white shadow-sm group-hover:border-slate-300 group-hover:shadow-md'
        }`}
      >
        <div className="mb-5 flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${gradient}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{name}</h3>
              <img
                src="/logos/logo-icon.png"
                alt=""
                className={`h-4 w-4 shrink-0 object-contain transition-opacity group-hover:opacity-60 ${isDark ? 'opacity-20 group-hover:opacity-40' : 'opacity-40'}`}
                style={{ aspectRatio: 'auto' }}
              />
            </div>
            <p className={`text-xs font-medium tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{role}</p>
          </div>
        </div>

        <p className={`mb-6 flex-1 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>

        <div className="flex flex-col gap-2.5">
          {caps.map((cap) => (
            <div
              key={cap}
              className={`flex items-center gap-2.5 text-xs transition-colors ${isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-800'}`}
            >
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
              <span>{cap}</span>
            </div>
          ))}
        </div>

        <div className={`pointer-events-none absolute -bottom-8 -end-8 h-24 w-24 rounded-full blur-[40px] transition-all ${isDark ? 'bg-cyan-500/5 group-hover:bg-violet-500/15' : 'bg-cyan-500/10 group-hover:bg-violet-500/20'}`} />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────
   Pipeline step
   ──────────────────────────────────────────────── */
function PipelineStep({ num, title, desc, icon: Icon, isLast, isDark = true }) {
  return (
    <div className="group relative flex gap-5">
      {/* Vertical line + circle */}
      <div className="flex flex-col items-center">
        <div
          className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border transition-all group-hover:shadow-lg ${
            isDark
              ? 'border-cyan-500/35 bg-slate-950/80 group-hover:border-violet-400/50 group-hover:shadow-cyan-500/20'
              : 'border-cyan-500/40 bg-white group-hover:border-violet-400/60 group-hover:shadow-cyan-500/15'
          }`}
        >
          <Icon className="h-5 w-5 text-cyan-500 transition-colors group-hover:text-violet-600" />
        </div>
        {!isLast && (
          <div className="mt-1 w-px flex-1 bg-gradient-to-b from-cyan-500/40 via-violet-500/20 to-transparent" />
        )}
      </div>

      {/* Content */}
      <div className={`${isLast ? 'pb-0' : 'pb-12'} pt-1`}>
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-cyan-600">
          0{num}
        </span>
        <h3 className={`mb-2 text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
        <p className={`max-w-md text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────
   Main Landing Page
   ──────────────────────────────────────────────── */
export default function LandingPage() {
  const { t, locale, toggleLocale } = useI18n()
  const { dark, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className={dark ? 'landing-authora-mesh min-h-screen text-white' : 'min-h-screen bg-slate-50 text-slate-900'}>
      {dark ? (
        <div className="landing-authora-grid-bg pointer-events-none fixed inset-0 z-0" />
      ) : (
        <div className="landing-light-grid-bg pointer-events-none fixed inset-0 z-0" />
      )}

      {/* ──── NAV — solid black bar ──── */}
      <nav className="relative z-30 border-b border-white/10 bg-black">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center">
            <img
              src="/logos/logo-primary.png"
              alt="Genesis Technologies"
              className="h-9 w-auto brightness-0 invert object-contain"
              style={{ aspectRatio: 'auto' }}
            />
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <a href="#agents-section" className="text-sm text-slate-300 transition-colors hover:text-white">{t('landing.nav.features')}</a>
            <a href="#pipeline-section" className="text-sm text-slate-300 transition-colors hover:text-white">{t('landing.nav.howItWorks')}</a>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-slate-200 transition-colors hover:bg-white/20 hover:text-white"
              aria-label={dark ? t('landing.nav.themeLight') : t('landing.nav.themeDark')}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={toggleLocale} className="text-sm text-slate-400 transition-colors hover:text-white">
              {locale === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}
            </button>
            <Link to="/login" className="text-sm font-medium text-slate-200 transition-colors hover:text-white">{t('landing.nav.login')}</Link>
            <Link to="/register" className="rounded-lg bg-white/[0.12] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/[0.2]">{t('landing.nav.getStarted')}</Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-200 transition-colors hover:bg-white/20 hover:text-white"
              aria-label={dark ? t('landing.nav.themeLight') : t('landing.nav.themeDark')}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex h-9 w-9 items-center justify-center text-slate-300">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-black px-5 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <a href="#agents-section" onClick={() => setMenuOpen(false)} className="text-sm text-slate-300">{t('landing.nav.features')}</a>
              <a href="#pipeline-section" onClick={() => setMenuOpen(false)} className="text-sm text-slate-300">{t('landing.nav.howItWorks')}</a>
              <button onClick={toggleLocale} className="text-start text-sm text-slate-400">{locale === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}</button>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm text-slate-200">{t('landing.nav.login')}</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="mt-1 block w-full rounded-lg bg-white/[0.12] py-2.5 text-center text-sm font-semibold text-white">{t('landing.nav.getStarted')}</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ──── HERO ──── */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-20 sm:pt-28 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left — Copy */}
            <div>
              <div
                className={`landing-stagger-1 mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#2dd4bf]/45 px-4 py-1.5 backdrop-blur-sm ${
                  dark ? 'bg-[#020617]/40' : 'bg-white/90 shadow-sm'
                }`}
              >
                <span className="text-xs font-semibold tracking-wide text-[#0d9488]">{t('landing.hero.badge')}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#0d9488]" />
              </div>

              <h1 className="landing-stagger-2 text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
                <span className={dark ? 'text-white' : 'text-slate-900'}>{t('landing.hero.headlineLead')}</span>
                <br />
                <span className="text-authora-hero-accent">{t('landing.hero.headlineAccent')}</span>
              </h1>

              <p className={`landing-stagger-3 mt-6 max-w-lg text-base leading-relaxed sm:text-lg ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('landing.hero.sub')}
              </p>

              <div className="landing-stagger-4 mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  to="/register"
                  className="landing-glow-btn btn-authora-gradient group inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-sm font-bold transition-all active:scale-[0.97]"
                >
                  <Zap className="h-4 w-4 shrink-0 text-[#020617]" />
                  {t('landing.hero.cta')}
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#020617] transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#pipeline-section"
                  className={`inline-flex h-12 items-center justify-center rounded-lg border px-6 text-sm font-semibold transition-all ${
                    dark
                      ? 'border-white/[0.12] bg-[#020617]/80 text-white backdrop-blur-sm hover:border-white/20 hover:bg-[#020617]'
                      : 'border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {t('landing.hero.ctaSecondary')}
                </a>
                <span className={`w-full text-xs sm:w-auto ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{t('landing.hero.ctaSub')}</span>
              </div>
            </div>

            {/* Right — Primary logo */}
            <div className="landing-stagger-3 relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                <div
                  className={`pointer-events-none absolute start-1/2 top-1/2 h-[min(100%,420px)] w-[min(100%,420px)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] ${
                    dark ? 'bg-gradient-to-tr from-cyan-500/25 via-violet-500/20 to-transparent' : 'bg-gradient-to-tr from-cyan-400/20 via-violet-400/15 to-transparent'
                  }`}
                />
                <img
                  src="/logos/logo-primary.png"
                  alt="Genesis Technologies"
                  className={`relative z-10 mx-auto h-auto w-full max-w-[min(100%,440px)] object-contain ${
                    dark ? 'drop-shadow-[0_8px_48px_rgba(0,0,0,0.4)]' : 'drop-shadow-[0_12px_40px_rgba(15,23,42,0.12)]'
                  }`}
                  style={{ aspectRatio: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider glow */}
        <div
          className={`h-px w-full ${dark ? 'bg-[linear-gradient(90deg,transparent,rgba(6,182,212,0.28),rgba(124,58,237,0.2),transparent)]' : 'bg-gradient-to-r from-transparent via-slate-300 to-transparent'}`}
        />
      </section>

      {/* ──── AGENTS / BOARD OF DIRECTORS ──── */}
      <section id="agents-section" className="relative overflow-hidden py-24 sm:py-32">
        {dark && (
          <div className="pointer-events-none absolute end-0 top-0 h-[500px] w-[500px] rounded-full bg-violet-600/8 blur-[120px]" />
        )}
        {!dark && (
          <div className="pointer-events-none absolute end-0 top-0 h-[400px] w-[400px] rounded-full bg-cyan-400/10 blur-[100px]" />
        )}

        <div className="relative z-10 mx-auto max-w-6xl px-5">
          <div className="mb-14 text-center">
            <span
              className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide ${
                dark
                  ? 'border-white/[0.08] bg-gradient-to-r from-white/[0.04] to-cyan-500/[0.04] text-slate-400'
                  : 'border-slate-200 bg-slate-100/80 text-slate-600'
              }`}
            >
              <Bot className="h-3.5 w-3.5 text-cyan-600" />
              {t('landing.agents.badge')}
            </span>
            <h2 className={`mt-4 text-3xl font-bold tracking-tight sm:text-4xl ${dark ? '' : 'text-slate-900'}`}>{t('landing.agents.title')}</h2>
            <p className={`mx-auto mt-4 max-w-2xl text-base ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{t('landing.agents.sub')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AgentCard
              isDark={dark}
              name={t('landing.agents.govregName')}
              role={t('landing.agents.govregRole')}
              desc={t('landing.agents.govregDesc')}
              caps={[t('landing.agents.govregCap1'), t('landing.agents.govregCap2'), t('landing.agents.govregCap3')]}
              icon={Landmark}
              gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
              glowColor="bg-gradient-to-r from-cyan-400/40 to-blue-500/40"
            />
            <AgentCard
              isDark={dark}
              name={t('landing.agents.taxfinName')}
              role={t('landing.agents.taxfinRole')}
              desc={t('landing.agents.taxfinDesc')}
              caps={[t('landing.agents.taxfinCap1'), t('landing.agents.taxfinCap2'), t('landing.agents.taxfinCap3')]}
              icon={CreditCard}
              gradient="bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600"
              glowColor="bg-gradient-to-r from-cyan-400/35 to-violet-500/35"
            />
            <AgentCard
              isDark={dark}
              name={t('landing.agents.opshrName')}
              role={t('landing.agents.opshrRole')}
              desc={t('landing.agents.opshrDesc')}
              caps={[t('landing.agents.opshrCap1'), t('landing.agents.opshrCap2'), t('landing.agents.opshrCap3')]}
              icon={Users}
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
              glowColor="bg-gradient-to-r from-emerald-400/40 to-teal-500/40"
            />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className={`h-px w-full ${dark ? 'bg-gradient-to-r from-transparent via-white/[0.06] to-transparent' : 'bg-gradient-to-r from-transparent via-slate-200 to-transparent'}`} />

      {/* ──── PIPELINE / TRUST CONTAINER ──── */}
      <section id="pipeline-section" className="relative overflow-hidden py-24 sm:py-32">
        {dark ? (
          <div className="pointer-events-none absolute start-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-cyan-600/4 blur-[120px]" />
        ) : (
          <div className="pointer-events-none absolute start-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-violet-400/10 blur-[100px]" />
        )}

        <div className="relative z-10 mx-auto max-w-6xl px-5">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            {/* Left — Heading */}
            <div className="lg:sticky lg:top-32">
              <span
                className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide ${
                  dark
                    ? 'border-white/[0.08] bg-gradient-to-r from-white/[0.04] to-violet-500/[0.05] text-slate-400'
                    : 'border-slate-200 bg-slate-100/80 text-slate-600'
                }`}
              >
                <Globe className="h-3.5 w-3.5 text-violet-600" />
                {t('landing.pipeline.badge')}
              </span>
              <h2 className={`mt-4 text-3xl font-bold tracking-tight sm:text-4xl ${dark ? '' : 'text-slate-900'}`}>{t('landing.pipeline.title')}</h2>
              <p className={`mt-4 max-w-md text-base leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{t('landing.pipeline.sub')}</p>

              {/* Decorative card */}
              <div
                className={`mt-10 hidden overflow-hidden rounded-xl border p-5 backdrop-blur-sm lg:block ${
                  dark ? 'border-white/[0.06] bg-slate-900/40' : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <div className={`flex items-center gap-3 text-xs ${dark ? 'text-slate-500' : 'text-slate-600'}`}>
                  <Terminal className="h-4 w-4 text-cyan-600" />
                  <code className="bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent">genesis.spawn(&#34;tech-startup&#34;)</code>
                  <span className={`ms-auto ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>→ Entity live</span>
                </div>
              </div>
            </div>

            {/* Right — Timeline */}
            <div>
              <PipelineStep isDark={dark} num={1} title={t('landing.pipeline.step1Title')} desc={t('landing.pipeline.step1Desc')} icon={MessageSquare} />
              <PipelineStep isDark={dark} num={2} title={t('landing.pipeline.step2Title')} desc={t('landing.pipeline.step2Desc')} icon={Zap} />
              <PipelineStep isDark={dark} num={3} title={t('landing.pipeline.step3Title')} desc={t('landing.pipeline.step3Desc')} icon={Shield} />
              <PipelineStep isDark={dark} num={4} title={t('landing.pipeline.step4Title')} desc={t('landing.pipeline.step4Desc')} icon={TrendingUpIcon} isLast />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className={`h-px w-full ${dark ? 'bg-[linear-gradient(90deg,transparent,rgba(6,182,212,0.22),rgba(124,58,237,0.16),transparent)]' : 'bg-gradient-to-r from-transparent via-slate-200 to-transparent'}`} />

      {/* ──── FINAL CTA ──── */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {dark && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-violet-600/15 blur-[140px]" />
          </div>
        )}
        {!dark && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/15 blur-[120px]" />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-2xl px-5 text-center">
          <h2 className={`whitespace-pre-line text-3xl font-bold tracking-tight sm:text-5xl ${dark ? '' : 'text-slate-900'}`}>{t('landing.cta.title')}</h2>
          <p className={`mx-auto mt-5 max-w-lg text-base ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{t('landing.cta.sub')}</p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              to="/register"
              className="landing-glow-btn btn-authora-gradient group inline-flex h-14 items-center justify-center gap-2.5 rounded-lg px-10 text-base font-bold transition-all active:scale-[0.97]"
            >
              <Zap className="h-5 w-5 shrink-0 text-[#020617]" />
              {t('landing.cta.button')}
              <ArrowRight className="h-4.5 w-4.5 shrink-0 text-[#020617] transition-transform group-hover:translate-x-0.5" />
            </Link>
            <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{t('landing.cta.note')}</span>
          </div>
        </div>
      </section>

      {/* ──── FOOTER ──── */}
      <footer className={dark ? 'border-t border-white/[0.04]' : 'border-t border-slate-200'}>
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center">
                <img
                  src="/logos/logo-primary.png"
                  alt="Genesis Technologies"
                  className={`h-8 w-auto object-contain ${dark ? 'brightness-0 invert' : ''}`}
                  style={{ aspectRatio: 'auto' }}
                />
              </div>
              <p className={`mt-4 text-xs leading-relaxed ${dark ? 'text-slate-500' : 'text-slate-600'}`}>{t('landing.hero.sub').slice(0, 90)}…</p>
            </div>

            {/* Product */}
            <div>
              <h4 className={`mb-4 text-xs font-semibold uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{t('landing.footer.product')}</h4>
              <div className="flex flex-col gap-2.5">
                <a href="#agents-section" className={`text-sm transition-colors ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>{t('landing.footer.features')}</a>
                <a href="#" className={`text-sm transition-colors ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>{t('landing.footer.pricing')}</a>
                <a href="#" className={`text-sm transition-colors ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>{t('landing.footer.docs')}</a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className={`mb-4 text-xs font-semibold uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{t('landing.footer.company')}</h4>
              <div className="flex flex-col gap-2.5">
                <a href="#" className={`text-sm transition-colors ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>{t('landing.footer.about')}</a>
                <a href="#" className={`text-sm transition-colors ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>{t('landing.footer.careers')}</a>
                <a href="#" className={`text-sm transition-colors ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>{t('landing.footer.blog')}</a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className={`mb-4 text-xs font-semibold uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-500'}`}>{t('landing.footer.legal')}</h4>
              <div className="flex flex-col gap-2.5">
                <a href="#" className={`text-sm transition-colors ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>{t('landing.footer.privacy')}</a>
                <a href="#" className={`text-sm transition-colors ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>{t('landing.footer.terms')}</a>
                <a href="#" className={`text-sm transition-colors ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>{t('landing.footer.security')}</a>
              </div>
            </div>
          </div>

          <div className={`mt-12 flex flex-col items-center gap-4 border-t pt-6 ${dark ? 'border-white/[0.04]' : 'border-slate-200'}`}>
            <img
              src="/logos/logo-specialty.png"
              alt="Genesis Technologies"
              className={`h-6 w-auto object-contain transition-all hover:grayscale-0 ${dark ? 'opacity-15 grayscale brightness-200 hover:opacity-30' : 'opacity-40 grayscale hover:opacity-70'}`}
              style={{ aspectRatio: 'auto' }}
            />
            <p className={`text-xs ${dark ? 'text-slate-600' : 'text-slate-500'}`}>{t('landing.footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function TrendingUpIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
