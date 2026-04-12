import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { updateGenesisBusiness } from '../api/genesis/businessesApi'
import { loadPersistedGenesisBusinesses, upsertPersistedGenesisBusiness } from '../dashboard/genesisBusinessStorage'

export default function EditBusinessModal({
  open,
  onClose,
  onSaved,
  businessId,
  initialCompanyName,
  initialHpNumber,
}) {
  const { t, locale, toggleLocale } = useI18n()
  const [companyName, setCompanyName] = useState('')
  const [hpNumber, setHpNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!open) return
    setCompanyName((initialCompanyName ?? '').trim())
    setHpNumber((initialHpNumber ?? '').trim())
    setErr('')
    setSaving(false)
  }, [open, businessId, initialCompanyName, initialHpNumber])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const handleSave = async () => {
    if (!businessId?.trim()) return
    setSaving(true)
    setErr('')
    try {
      const data = await updateGenesisBusiness(businessId.trim(), {
        company_name: companyName,
        hp_number: hpNumber,
      })
      const row = loadPersistedGenesisBusinesses().find((b) => b.businessId === businessId.trim())
      if (row) {
        upsertPersistedGenesisBusiness({ ...row.api, ...data }, row.licenseType)
      }
      onSaved?.()
      onClose?.()
    } catch {
      setErr(t('entities.editBusinessFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-business-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose?.()
      }}
    >
      <div
        className="flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a0a2e] via-[#12081f] to-[#050208] shadow-2xl sm:max-w-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.18),transparent)]" />

        <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200/70">
              {t('entities.editBusinessKicker')}
            </p>
            <h2 id="edit-business-modal-title" className="truncate text-base font-bold text-white sm:text-lg">
              {t('entities.editBusinessModalTitle')}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleLocale}
              className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/80 transition-colors hover:bg-white/10 sm:text-xs"
            >
              {locale === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => onClose?.()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              aria-label={t('createBusiness.modalClose')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <p className="text-xs leading-relaxed text-white/50">{t('entities.editBusinessIntro')}</p>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="edit-company-name" className="block text-xs font-semibold text-white/80">
                {t('entities.editCompanyNameLabel')}
              </label>
              <input
                id="edit-company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t('entities.editCompanyNamePlaceholder')}
                autoComplete="organization"
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <div>
              <label htmlFor="edit-hp-number" className="block text-xs font-semibold text-white/80">
                {t('entities.editHpLabel')}
              </label>
              <input
                id="edit-hp-number"
                type="text"
                inputMode="numeric"
                value={hpNumber}
                onChange={(e) => setHpNumber(e.target.value)}
                placeholder={t('entities.editHpPlaceholder')}
                autoComplete="off"
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          {err ? (
            <p className="mt-4 text-sm font-medium text-red-300" role="alert">
              {err}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => onClose?.()}
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              {t('entities.dialogGoBack')}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t('entities.editBusinessSaving')}
                </>
              ) : (
                t('entities.editBusinessSave')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
