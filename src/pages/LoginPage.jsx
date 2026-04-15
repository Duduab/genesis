import { useEffect, useState } from 'react'
import { User, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useRouter, Link } from '../router'
import { useAuth } from '../auth/AuthContext'
import AuthHeroPanel from '../components/AuthHeroPanel'

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function LoginPage() {
  const { t, locale, toggleLocale } = useI18n()
  const { navigate } = useRouter()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [regSuccess, setRegSuccess] = useState('')

  useEffect(() => {
    try {
      if (sessionStorage.getItem('genesis-reg-success')) {
        sessionStorage.removeItem('genesis-reg-success')
        setRegSuccess(t('createBusiness.step5.registration_success_msg'))
      }
    } catch {
      /* ignore */
    }
  }, [t])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const result = await login(username, password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(t('auth.login.invalidCredentials'))
      }
    } catch {
      setError(t('auth.login.firebaseError'))
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left — Form */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link to="/login" className="flex items-center">
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
            <h1 className="text-3xl font-bold tracking-tight text-surface-900">{t('auth.login.title')}</h1>
            <p className="mt-2 text-sm text-surface-400">{t('auth.login.subtitle')}</p>

            {regSuccess ? (
              <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800" role="status">
                {regSuccess}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-4">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => setError(t('auth.login.providerUnavailable'))}
                className="group flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] text-sm font-semibold text-white shadow-lg shadow-[#25D366]/25 transition-all hover:bg-[#20BD5A] hover:shadow-[#25D366]/35 active:scale-[0.98]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {t('auth.login.continueWhatsApp')}
              </button>
              <p className="text-center text-[11px] text-surface-400">{t('auth.login.whatsAppHint')}</p>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-surface-200" />
                <span className="text-xs font-medium text-surface-400">{t('auth.login.or')}</span>
                <div className="h-px flex-1 bg-surface-200" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={() => setError(t('auth.login.providerUnavailable'))}
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-surface-200 bg-white text-sm font-medium text-surface-700 transition-all hover:bg-surface-50 hover:shadow-sm active:scale-[0.98]"
              >
                <GoogleIcon className="h-4.5 w-4.5" />
                {t('auth.login.signInGoogle')}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-surface-200" />
                <span className="text-xs font-medium text-surface-400">{t('auth.login.or')}</span>
                <div className="h-px flex-1 bg-surface-200" />
              </div>

              {/* Username + Password form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="login-username" className="mb-1.5 block text-xs font-semibold text-surface-600">
                    {t('auth.login.username')}
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                    <input
                      id="login-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('auth.login.usernamePlaceholder')}
                      className="h-11 w-full rounded-xl border border-surface-200 bg-surface-50 ps-10 pe-3 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:bg-white focus:ring-2 focus:ring-genesis-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="login-pw" className="text-xs font-semibold text-surface-600">
                      {t('auth.login.password')}
                    </label>
                    <button type="button" className="text-[11px] font-medium text-genesis-600 transition-colors hover:text-genesis-700">
                      {t('auth.login.forgotPassword')}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                    <input
                      id="login-pw"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.login.passwordPlaceholder')}
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
                </div>

                <button type="submit" className="btn-authora-gradient group mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]">
                  {t('auth.login.signInEmail')}
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#020617] transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>
            </div>

            <p className="mt-8 text-center text-sm text-surface-400">
              {t('auth.login.noAccount')}{' '}
              <Link to="/register" className="font-semibold text-genesis-600 transition-colors hover:text-genesis-700">
                {t('auth.login.createAccount')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right — Hero */}
      <div className="hidden lg:block lg:w-1/2">
        <AuthHeroPanel />
      </div>
    </div>
  )
}
