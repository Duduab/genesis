import { AlertTriangle, ChevronRight } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

export default function ApprovalBanner({ count, onReview }) {
  const { t } = useI18n()
  if (!count || count < 1) return null
  return (
    <div
      className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm"
      role="status"
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-900">{t('approvalBanner.title')}</p>
          <p className="mt-0.5 text-xs text-amber-800/90">{t('approvalBanner.subtitle').replaceAll('{{count}}', String(count))}</p>
        </div>
      </div>
      {onReview ? (
        <button
          type="button"
          onClick={onReview}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
        >
          {t('approvalBanner.review')}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  )
}
