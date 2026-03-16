import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronRight, Shield, Scale, Landmark, Users, FileText, CreditCard, Briefcase, BadgeCheck, CircleDot, ArrowRight, Terminal, MessageSquare, Bot, Zap, Globe, Menu, X } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { Link } from '../router'

/* ────────────────────────────────────────────────
   Auto-typing terminal component
   ──────────────────────────────────────────────── */
function HeroTerminal({ t }) {
  const [lines, setLines] = useState([])
  const [cursorVisible, setCursorVisible] = useState(true)
  const termRef = useRef(null)
  const hasRun = useRef(false)

  const script = useCallback(() => [
    { type: 'prompt', text: '' },
    { type: 'user', text: t('landing.hero.terminalUser1') },
    { type: 'blank', text: '' },
    { type: 'ai', text: t('landing.hero.terminalAi1') },
    { type: 'ai', text: t('landing.hero.terminalAi2') },
    { type: 'blank', text: '' },
    { type: 'success', text: t('landing.hero.terminalAi3') },
    { type: 'success', text: t('landing.hero.terminalAi4') },
    { type: 'success', text: t('landing.hero.terminalAi5') },
    { type: 'blank', text: '' },
    { type: 'status', text: t('landing.hero.terminalStatus') },
  ], [t])

  useEffect(() => {
    if (hasRun.current) {
      setLines([])
      hasRun.current = false
    }

    const s = script()
    let idx = 0
    let charIdx = 0
    let currentLine = null
    let timer

    function tick() {
      if (idx >= s.length) return

      const entry = s[idx]

      if (entry.type === 'blank' || entry.type === 'prompt') {
        setLines(prev => [...prev, entry])
        idx++
        timer = setTimeout(tick, entry.type === 'prompt' ? 600 : 300)
        return
      }

      if (!currentLine) {
        currentLine = { ...entry, text: '' }
        setLines(prev => [...prev, currentLine])
        charIdx = 0
      }

      if (charIdx < entry.text.length) {
        currentLine = { ...currentLine, text: entry.text.slice(0, charIdx + 1) }
        setLines(prev => {
          const copy = [...prev]
          copy[copy.length - 1] = currentLine
          return copy
        })
        charIdx++
        const speed = entry.type === 'user' ? 40 : 22
        timer = setTimeout(tick, speed)
      } else {
        currentLine = null
        idx++
        timer = setTimeout(tick, entry.type === 'user' ? 800 : 350)
      }
    }

    const start = setTimeout(() => {
      hasRun.current = true
      tick()
    }, 1200)

    return () => { clearTimeout(start); clearTimeout(timer) }
  }, [script])

  useEffect(() => {
    const iv = setInterval(() => setCursorVisible(v => !v), 530)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [lines])

  const colorMap = {
    user: 'text-cyan-400',
    ai: 'text-genesis-300',
    success: 'text-emerald-400',
    status: 'text-slate-500',
    prompt: 'text-slate-600',
    blank: '',
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-950/80 shadow-2xl shadow-genesis-950/60 backdrop-blur-xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <span className="ms-2 text-[11px] font-medium tracking-wide text-slate-500">
          {t('landing.hero.terminalTitle')}
        </span>
      </div>

      {/* Terminal body */}
      <div ref={termRef} className="h-[300px] overflow-y-auto p-5 font-mono text-[13px] leading-relaxed sm:h-[340px]">
        {lines.map((line, i) => {
          if (line.type === 'blank') return <div key={i} className="h-3" />
          if (line.type === 'prompt') {
            return (
              <div key={i} className="flex items-center gap-2 text-slate-600">
                <span className="text-cyan-500">$</span>
                <span className="text-slate-400">{line.text}</span>
              </div>
            )
          }
          return (
            <div key={i} className={`${colorMap[line.type] || 'text-slate-400'}`}>
              {line.type === 'user' && <span className="text-cyan-600">{'> '}</span>}
              {line.type === 'ai' && <span className="text-genesis-600">{'◆ '}</span>}
              {line.text}
              {i === lines.length - 1 && (
                <span className={`ms-0.5 inline-block h-4 w-[2px] translate-y-[2px] bg-cyan-400 transition-opacity ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
              )}
            </div>
          )
        })}
        {lines.length === 0 && (
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-cyan-500">$</span>
            <span className={`inline-block h-4 w-[2px] bg-cyan-400 transition-opacity ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        )}
      </div>

      {/* Glow accent */}
      <div className="pointer-events-none absolute -bottom-10 -end-10 h-40 w-40 rounded-full bg-genesis-500/20 blur-[60px]" />
      <div className="pointer-events-none absolute -start-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-[50px]" />
    </div>
  )
}

/* ────────────────────────────────────────────────
   Agent Card with glow border
   ──────────────────────────────────────────────── */
function AgentCard({ name, role, desc, caps, icon: Icon, gradient, glowColor }) {
  return (
    <div className="group relative">
      <div className={`pointer-events-none absolute -inset-[1px] rounded-2xl opacity-0 blur-[2px] transition-opacity duration-500 group-hover:opacity-100 ${glowColor}`} />

      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-900/60 p-7 backdrop-blur-md transition-all duration-500 group-hover:border-white/[0.12] group-hover:bg-slate-900/80">
        <div className="mb-5 flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${gradient}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{name}</h3>
              <img
                src="/logos/logo-icon.png"
                alt=""
                className="h-4 w-4 shrink-0 object-contain opacity-20 transition-opacity group-hover:opacity-40"
                style={{ aspectRatio: 'auto' }}
              />
            </div>
            <p className="text-xs font-medium tracking-wide text-slate-500">{role}</p>
          </div>
        </div>

        <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-400">{desc}</p>

        <div className="flex flex-col gap-2.5">
          {caps.map((cap) => (
            <div key={cap} className="flex items-center gap-2.5 text-xs text-slate-500 transition-colors group-hover:text-slate-300">
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-genesis-400" />
              <span>{cap}</span>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute -bottom-8 -end-8 h-24 w-24 rounded-full bg-genesis-500/5 blur-[40px] transition-all group-hover:bg-genesis-500/15" />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────
   Pipeline step
   ──────────────────────────────────────────────── */
function PipelineStep({ num, title, desc, icon: Icon, isLast }) {
  return (
    <div className="group relative flex gap-5">
      {/* Vertical line + circle */}
      <div className="flex flex-col items-center">
        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-genesis-500/30 bg-genesis-950/80 transition-all group-hover:border-genesis-400/60 group-hover:shadow-lg group-hover:shadow-genesis-500/20">
          <Icon className="h-5 w-5 text-genesis-400 transition-colors group-hover:text-genesis-300" />
        </div>
        {!isLast && (
          <div className="mt-1 w-px flex-1 bg-gradient-to-b from-genesis-500/30 to-transparent" />
        )}
      </div>

      {/* Content */}
      <div className={`${isLast ? 'pb-0' : 'pb-12'} pt-1`}>
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-genesis-500">
          0{num}
        </span>
        <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
        <p className="max-w-md text-sm leading-relaxed text-slate-400">{desc}</p>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────
   Main Landing Page
   ──────────────────────────────────────────────── */
export default function LandingPage() {
  const { t, locale, toggleLocale } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Subtle noise + grid overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'g\' width=\'60\' height=\'60\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M60 0H0v60\' fill=\'none\' stroke=\'%23fff\' stroke-width=\'.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23g)\'/%3E%3C/svg%3E")' }} />

      {/* ──── NAV ──── */}
      <nav className="relative z-30 border-b border-white/[0.04]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center">
            <img
              src="/logos/logo-primary.png"
              alt="Genesis Technologies"
              className="h-9 w-auto brightness-0 invert object-contain"
              style={{ aspectRatio: 'auto' }}
            />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#agents-section" className="text-sm text-slate-400 transition-colors hover:text-white">{t('landing.nav.features')}</a>
            <a href="#pipeline-section" className="text-sm text-slate-400 transition-colors hover:text-white">{t('landing.nav.howItWorks')}</a>
            <button onClick={toggleLocale} className="text-sm text-slate-500 transition-colors hover:text-white">
              {locale === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}
            </button>
            <Link to="/login" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">{t('landing.nav.login')}</Link>
            <Link to="/register" className="rounded-lg bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/[0.14]">{t('landing.nav.getStarted')}</Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="text-slate-400 md:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/[0.04] bg-slate-950/95 px-5 py-4 backdrop-blur-lg md:hidden">
            <div className="flex flex-col gap-3">
              <a href="#agents-section" onClick={() => setMenuOpen(false)} className="text-sm text-slate-400">{t('landing.nav.features')}</a>
              <a href="#pipeline-section" onClick={() => setMenuOpen(false)} className="text-sm text-slate-400">{t('landing.nav.howItWorks')}</a>
              <button onClick={toggleLocale} className="text-start text-sm text-slate-500">{locale === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}</button>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm text-slate-300">{t('landing.nav.login')}</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="mt-1 block w-full rounded-lg bg-white/[0.08] py-2.5 text-center text-sm font-semibold">{t('landing.nav.getStarted')}</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ──── HERO ──── */}
      <section className="relative overflow-hidden">
        {/* Background gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute start-1/4 top-0 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-genesis-600/8 blur-[120px]" />
          <div className="absolute end-1/4 bottom-0 h-[500px] w-[500px] translate-y-1/3 rounded-full bg-cyan-600/5 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-20 sm:pt-28 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left — Copy */}
            <div>
              <div className="landing-stagger-1 mb-6 inline-flex items-center gap-2 rounded-full border border-genesis-500/20 bg-genesis-500/[0.06] px-4 py-1.5 backdrop-blur-sm">
                <CircleDot className="h-3.5 w-3.5 text-genesis-400" />
                <span className="text-xs font-semibold tracking-wide text-genesis-300">{t('landing.hero.badge')}</span>
              </div>

              <h1 className="landing-stagger-2 whitespace-pre-line text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                {t('landing.hero.headline')}
              </h1>

              <p className="landing-stagger-3 mt-6 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
                {t('landing.hero.sub')}
              </p>

              <div className="landing-stagger-4 mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  to="/register"
                  className="landing-glow-btn group inline-flex h-13 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-genesis-600 to-genesis-500 px-7 text-sm font-bold text-white transition-all hover:from-genesis-500 hover:to-genesis-400 active:scale-[0.97]"
                >
                  <Zap className="h-4 w-4" />
                  {t('landing.hero.cta')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <span className="text-xs text-slate-500">{t('landing.hero.ctaSub')}</span>
              </div>
            </div>

            {/* Right — Terminal with glowing core logo */}
            <div className="landing-stagger-3 relative">
              <div className="pointer-events-none absolute -top-8 start-1/2 z-20 -translate-x-1/2">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-genesis-500/20 blur-[20px]" style={{ animation: 'ai-orb-breathe 3s ease-in-out infinite' }} />
                  <img
                    src="/logos/logo-icon.png"
                    alt="Genesis Core"
                    className="relative h-10 w-10 object-contain brightness-0 invert drop-shadow-[0_0_12px_rgba(130,104,232,0.6)]"
                    style={{ aspectRatio: 'auto', animation: 'ai-orb-breathe 3s ease-in-out infinite' }}
                  />
                </div>
              </div>
              <HeroTerminal t={t} />
            </div>
          </div>
        </div>

        {/* Divider glow */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-genesis-500/20 to-transparent" />
      </section>

      {/* ──── AGENTS / BOARD OF DIRECTORS ──── */}
      <section id="agents-section" className="relative overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute end-0 top-0 h-[500px] w-[500px] rounded-full bg-genesis-600/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-6xl px-5">
          <div className="mb-14 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-400">
              <Bot className="h-3.5 w-3.5 text-genesis-400" />
              {t('landing.agents.badge')}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{t('landing.agents.title')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">{t('landing.agents.sub')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AgentCard
              name={t('landing.agents.govregName')}
              role={t('landing.agents.govregRole')}
              desc={t('landing.agents.govregDesc')}
              caps={[t('landing.agents.govregCap1'), t('landing.agents.govregCap2'), t('landing.agents.govregCap3')]}
              icon={Landmark}
              gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
              glowColor="bg-gradient-to-r from-cyan-400/40 to-blue-500/40"
            />
            <AgentCard
              name={t('landing.agents.taxfinName')}
              role={t('landing.agents.taxfinRole')}
              desc={t('landing.agents.taxfinDesc')}
              caps={[t('landing.agents.taxfinCap1'), t('landing.agents.taxfinCap2'), t('landing.agents.taxfinCap3')]}
              icon={CreditCard}
              gradient="bg-gradient-to-br from-genesis-500 to-purple-600"
              glowColor="bg-gradient-to-r from-genesis-400/40 to-purple-500/40"
            />
            <AgentCard
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
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* ──── PIPELINE / TRUST CONTAINER ──── */}
      <section id="pipeline-section" className="relative overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute start-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-cyan-600/4 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-6xl px-5">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            {/* Left — Heading */}
            <div className="lg:sticky lg:top-32">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-400">
                <Globe className="h-3.5 w-3.5 text-genesis-400" />
                {t('landing.pipeline.badge')}
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{t('landing.pipeline.title')}</h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">{t('landing.pipeline.sub')}</p>

              {/* Decorative card */}
              <div className="mt-10 hidden overflow-hidden rounded-xl border border-white/[0.06] bg-slate-900/40 p-5 backdrop-blur-sm lg:block">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Terminal className="h-4 w-4 text-genesis-500" />
                  <code className="text-genesis-400">genesis.spawn(&#34;tech-startup&#34;)</code>
                  <span className="ms-auto text-emerald-400">→ Entity live</span>
                </div>
              </div>
            </div>

            {/* Right — Timeline */}
            <div>
              <PipelineStep num={1} title={t('landing.pipeline.step1Title')} desc={t('landing.pipeline.step1Desc')} icon={MessageSquare} />
              <PipelineStep num={2} title={t('landing.pipeline.step2Title')} desc={t('landing.pipeline.step2Desc')} icon={Zap} />
              <PipelineStep num={3} title={t('landing.pipeline.step3Title')} desc={t('landing.pipeline.step3Desc')} icon={Shield} />
              <PipelineStep num={4} title={t('landing.pipeline.step4Title')} desc={t('landing.pipeline.step4Desc')} icon={TrendingUpIcon} isLast />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-genesis-500/20 to-transparent" />

      {/* ──── FINAL CTA ──── */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-genesis-600/8 blur-[140px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl px-5 text-center">
          <h2 className="whitespace-pre-line text-3xl font-bold tracking-tight sm:text-5xl">{t('landing.cta.title')}</h2>
          <p className="mx-auto mt-5 max-w-lg text-base text-slate-400">{t('landing.cta.sub')}</p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              to="/register"
              className="landing-glow-btn group inline-flex h-14 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-genesis-600 to-genesis-500 px-10 text-base font-bold text-white transition-all hover:from-genesis-500 hover:to-genesis-400 active:scale-[0.97]"
            >
              <Zap className="h-5 w-5" />
              {t('landing.cta.button')}
              <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <span className="text-xs text-slate-500">{t('landing.cta.note')}</span>
          </div>
        </div>
      </section>

      {/* ──── FOOTER ──── */}
      <footer className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center">
                <img
                  src="/logos/logo-primary.png"
                  alt="Genesis Technologies"
                  className="h-8 w-auto brightness-0 invert object-contain"
                  style={{ aspectRatio: 'auto' }}
                />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">{t('landing.hero.sub').slice(0, 90)}…</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">{t('landing.footer.product')}</h4>
              <div className="flex flex-col gap-2.5">
                <a href="#agents-section" className="text-sm text-slate-400 transition-colors hover:text-white">{t('landing.footer.features')}</a>
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">{t('landing.footer.pricing')}</a>
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">{t('landing.footer.docs')}</a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">{t('landing.footer.company')}</h4>
              <div className="flex flex-col gap-2.5">
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">{t('landing.footer.about')}</a>
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">{t('landing.footer.careers')}</a>
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">{t('landing.footer.blog')}</a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">{t('landing.footer.legal')}</h4>
              <div className="flex flex-col gap-2.5">
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">{t('landing.footer.privacy')}</a>
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">{t('landing.footer.terms')}</a>
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">{t('landing.footer.security')}</a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 border-t border-white/[0.04] pt-6">
            <img
              src="/logos/logo-specialty.png"
              alt="Genesis Technologies"
              className="h-6 w-auto object-contain opacity-15 grayscale brightness-200 transition-all hover:opacity-30 hover:grayscale-0"
              style={{ aspectRatio: 'auto' }}
            />
            <p className="text-xs text-slate-600">{t('landing.footer.copyright')}</p>
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
