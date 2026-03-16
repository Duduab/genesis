import { useState } from 'react'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useRouter, Link } from '../router'
import AuthHeroPanel from '../components/AuthHeroPanel'

export default function RegisterPage() {
  const { t, locale, toggleLocale } = useI18n()
  const { navigate } = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  const strength = (() => {
    if (password.length === 0) return 0
    let s = 0
    if (password.length >= 8) s++
    if (password.length >= 12) s++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++
    if (/\d/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return Math.min(s, 4)
  })()

  const strengthColors = ['bg-surface-200', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500']

  return (
    <div className="flex h-screen bg-white">
      {/* Left — Hero (reversed: hero on left for register) */}
      <div className="hidden lg:block lg:w-1/2">
        <AuthHeroPanel />
      </div>

      {/* Right — Form */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link to="/register" className="flex items-center">
            <img
              src="/logos/logo-primary.png"
              alt="Genesis Technologies"
              className="animate-fade-in h-12 w-auto object-contain"
              style={{ aspectRatio: 'auto' }}
            />
          </Link>
          <button
            onClick={toggleLocale}
            className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-semibold text-surface-600 transition-colors hover:bg-surface-50"
          >
            {locale === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}
          </button>
        </div>

        {/* Form body */}
        <div className="flex flex-1 items-center justify-center px-6 sm:px-10">
          <div className="w-full max-w-[400px]">
            <h1 className="text-3xl font-bold tracking-tight text-surface-900">{t('auth.register.title')}</h1>
            <p className="mt-2 text-sm text-surface-400">{t('auth.register.subtitle')}</p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <div>
                <label htmlFor="reg-name" className="mb-1.5 block text-xs font-semibold text-surface-600">
                  {t('auth.register.fullName')}
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('auth.register.fullNamePlaceholder')}
                    className="h-11 w-full rounded-xl border border-surface-200 bg-surface-50 ps-10 pe-3 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:bg-white focus:ring-2 focus:ring-genesis-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="mb-1.5 block text-xs font-semibold text-surface-600">
                  {t('auth.register.email')}
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.register.emailPlaceholder')}
                    className="h-11 w-full rounded-xl border border-surface-200 bg-surface-50 ps-10 pe-3 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:bg-white focus:ring-2 focus:ring-genesis-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-pw" className="mb-1.5 block text-xs font-semibold text-surface-600">
                  {t('auth.register.password')}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                  <input
                    id="reg-pw"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.register.passwordPlaceholder')}
                    className="h-11 w-full rounded-xl border border-surface-200 bg-surface-50 ps-10 pe-10 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:bg-white focus:ring-2 focus:ring-genesis-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-surface-400 transition-colors hover:text-surface-600"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-surface-200'}`}
                      />
                    ))}
                  </div>
                )}
                <p className="mt-1.5 text-[11px] text-surface-400">{t('auth.register.passwordHint')}</p>
              </div>

              <button type="submit" className="group mt-2 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-genesis-600 to-genesis-500 text-sm font-semibold text-white shadow-lg shadow-genesis-500/25 transition-all hover:from-genesis-700 hover:to-genesis-600 hover:shadow-genesis-600/30 active:scale-[0.98]">
                <ShieldCheck className="h-[18px] w-[18px]" />
                {t('auth.register.joinButton')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <p className="text-center text-[11px] leading-relaxed text-surface-400">
                {t('auth.register.terms')}{' '}
                <span className="font-medium text-genesis-600 hover:underline cursor-pointer">{t('auth.register.termsLink')}</span>
                {' '}{t('auth.register.and')}{' '}
                <span className="font-medium text-genesis-600 hover:underline cursor-pointer">{t('auth.register.privacyLink')}</span>
              </p>
            </form>

            <p className="mt-8 text-center text-sm text-surface-400">
              {t('auth.register.hasAccount')}{' '}
              <Link to="/login" className="font-semibold text-genesis-600 transition-colors hover:text-genesis-700">
                {t('auth.register.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
