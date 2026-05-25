import { useI18n } from '../i18n/I18nContext'
import { formatAppVersionLabel } from '../lib/appVersion'

const variantClass = {
  dark: 'rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80',
  light:
    'rounded-md border border-surface-200 bg-surface-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-surface-600',
  subtle: 'text-[10px] font-semibold uppercase tracking-wider text-surface-400',
}

/**
 * @param {{ variant?: 'dark' | 'light' | 'subtle', className?: string }} props
 */
export default function AppVersionBadge({ variant = 'light', className = '' }) {
  const { t } = useI18n()
  const merged = [variantClass[variant] ?? variantClass.light, className].filter(Boolean).join(' ')

  return (
    <span aria-label={t('app.versionLabel')} className={merged}>
      {formatAppVersionLabel()}
    </span>
  )
}
