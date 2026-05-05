import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { Link } from '../router'
import { getGenesisFirebaseAuth } from '../auth/firebaseApp'
import { useAuth } from '../auth/AuthContext'
import AuthHeroPanel from '../components/AuthHeroPanel'

function mapFirebaseResetError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'auth.forgotPassword.errorInvalidEmail'
    case 'auth/missing-email':
      return 'auth.forgotPassword.errorMissingEmail'
    case 'auth/too-many-requests':
      return 'auth.forgotPassword.errorTooManyRequests'
    case 'auth/unauthorized-domain':
      return 'auth.forgotPassword.errorUnauthorizedDomain'
    default:
      return 'auth.forgotPassword.errorGeneric'
  }
}

export default function ForgotPasswordPage() {
  const { t, locale, toggleLocale } = useI18n()
  const { firebaseConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSent(false)

    const trimmed = email.trim()
    if (!trimmed) {
      setError(t('auth.forgotPassword.errorMissingEmail'))
      return
    }

    if (!firebaseConfigured) {
      setError(t('auth.login.firebaseNotConfigured'))
      return
    }

    const auth = getGenesisFirebaseAuth()
    if (!auth) {
      setError(t('auth.login.firebaseNotConfigured'))
      return
    }

    setSubmitting(true)
    try {
      const continueUrl = `${window.location.origin}/login`
      await sendPasswordResetEmail(auth, trimmed, {
        url: continueUrl,
        handleCodeInApp: false,
      })
      setSent(true)
    } catch (err) {
      const code =
        err && typeof err === 'object' && err !== null && 'code' in err && typeof err.code === 'string'
          ? err.code
          : ''
      setError(t(mapFirebaseResetError(code)))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-surface-600 transition-colors hover:text-genesis-600">
            <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
            {t('auth.forgotPassword.backToLogin')}
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
            <h1 className="text-3xl font-bold tracking-tight text-surface-900">{t('auth.forgotPassword.title')}</h1>
            <p className="mt-2 text-sm text-surface-500">{t('auth.forgotPassword.subtitle')}</p>

            {sent ? (
              <div
                className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900"
                role="status"
              >
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                  <p>{t('auth.forgotPassword.successMessage').replaceAll('{{email}}', email.trim())}</p>
                </div>
                <Link
                  to="/login"
                  className="mt-4 inline-flex text-sm font-semibold text-genesis-700 underline-offset-2 hover:underline"
                >
                  {t('auth.forgotPassword.returnToSignIn')}
                </Link>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 flex flex-col gap-4">
                {error ? (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                    {error}
                  </div>
                ) : null}

                <div>
                  <label htmlFor="forgot-email" className="mb-1.5 block text-xs font-semibold text-surface-600">
                    {t('auth.forgotPassword.emailLabel')}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                    <input
                      id="forgot-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      placeholder={t('auth.forgotPassword.emailPlaceholder')}
                      disabled={submitting}
                      className="h-11 w-full rounded-xl border border-surface-200 bg-surface-50 ps-10 pe-3 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition-all focus:border-genesis-400 focus:bg-white focus:ring-2 focus:ring-genesis-100 disabled:opacity-60"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-authora-gradient mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-[#020617] transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : null}
                  {submitting ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2">
        <AuthHeroPanel />
      </div>
    </div>
  )
}
