import { LayoutGrid, List } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

/**
 * @param {{ mode: 'cards' | 'list', onChange: (mode: 'cards' | 'list') => void }} props
 */
export default function ViewModeToggle({ mode, onChange }) {
  const { t } = useI18n()

  return (
    <div
      className="inline-flex rounded-lg border border-surface-200 bg-white p-0.5"
      role="group"
      aria-label={t('viewMode.groupLabel')}
    >
      <button
        type="button"
        onClick={() => onChange('cards')}
        aria-pressed={mode === 'cards'}
        title={t('viewMode.cards')}
        className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors ${
          mode === 'cards'
            ? 'bg-genesis-50 text-genesis-700 shadow-sm ring-1 ring-genesis-200/80'
            : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">{t('viewMode.cards')}</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        aria-pressed={mode === 'list'}
        title={t('viewMode.list')}
        className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors ${
          mode === 'list'
            ? 'bg-genesis-50 text-genesis-700 shadow-sm ring-1 ring-genesis-200/80'
            : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'
        }`}
      >
        <List className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">{t('viewMode.list')}</span>
      </button>
    </div>
  )
}
