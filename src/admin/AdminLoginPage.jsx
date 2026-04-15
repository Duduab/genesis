import { useState } from 'react'
import { User, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { useRouter, Link } from '../router'
import { useAdminAuth } from '../context/AdminAuthContext'
import AdminAuthHeroPanel from '../components/AdminAuthHeroPanel'

export default function AdminLoginPage() {
  const { t, locale, toggleLocale } = useI18n()
  const { login } = useAdminAuth()
  const { navigate } = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const ok = login(username.trim(), password)
    if (ok) navigate('/admin/monitoring')
    else setError(t('auth.adminLogin.invalidCredentials'))
  }

  return (
    <div className="flex h-screen bg-white">
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link to="/admin" className="flex items-center">
            <img
              src="/logos/logo-primary.png"
              alt="Genesis Technologies"
              className="animate-fade-in h-12 w-auto object-contain"
              style={{ aspectRatio: 'auto' }}
            />
          </Link>
          <button
            type="button"
            onClick={toggleLocale}
            className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-semibold text-surface-600 transition-colors hover:bg-surface-50"
          >
            {locale === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 sm:px-10">
          <div className="w-full max-w-[400px]">
            <h1 className="text-3xl font-bold tracking-tight text-surface-900">{t('auth.adminLogin.title')}</h1>
            <p className="mt-2 text-sm text-surface-400">{t('auth.adminLogin.subtitle')}</p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              {error ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              ) : null}

              <div>
                <label htmlFor="admin-login-username" className="mb-1.5 block text-xs font-semibold text-surface-600">
                  {t('auth.login.username')}
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                  <input
                    id="admin-login-username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('auth.adminLogin.usernamePlaceholder')}
                    className="h-11 w-full rounded-xl border border-surface-200 bg-surface-50 ps-10 pe-3 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:bg-white focus:ring-2 focus:ring-genesis-100"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="admin-login-pw" className="text-xs font-semibold text-surface-600">
                    {t('auth.login.password')}
                  </label>
                  <span className="text-[11px] font-medium text-surface-400">{t('auth.adminLogin.credentialHint')}</span>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                  <input
                    id="admin-login-pw"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.adminLogin.passwordPlaceholder')}
                    className="h-11 w-full rounded-xl border border-surface-200 bg-surface-50 ps-10 pe-10 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:bg-white focus:ring-2 focus:ring-genesis-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-surface-400 transition-colors hover:text-surface-600"
                    aria-label={showPw ? t('auth.adminLogin.hidePassword') : t('auth.adminLogin.showPassword')}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-authora-gradient group mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
              >
                {t('auth.adminLogin.signIn')}
                <ArrowRight className="h-4 w-4 shrink-0 text-[#020617] transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            <p className="mt-6 text-center text-xs leading-relaxed text-surface-500">{t('auth.adminLogin.apiNote')}</p>

            <p className="mt-6 text-center text-sm text-surface-400">
              <Link to="/dashboard" className="font-semibold text-genesis-600 transition-colors hover:text-genesis-700">
                {t('auth.adminLogin.backToApp')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2">
        <AdminAuthHeroPanel />
      </div>
    </div>
  )
}
