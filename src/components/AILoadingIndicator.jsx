import { useI18n } from '../i18n/I18nContext'

export default function AILoadingIndicator() {
  const { t } = useI18n()

  return (
    <div className="animate-slide-up-fade flex items-end gap-2.5">
      <img
        src="/logos/logo-icon.png"
        alt="Orchestrator Agent"
        className="h-7 w-7 rounded-full bg-genesis-50 object-contain p-0.5 ring-2 ring-genesis-200/60"
        style={{ aspectRatio: 'auto' }}
      />
      <div className="flex items-center gap-3 rounded-2xl rounded-es-sm bg-white px-4 py-3 shadow-sm ring-1 ring-surface-200/60">
        {/* Pulsing logo icon */}
        <div className="relative flex h-6 w-6 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full bg-genesis-400/25"
            style={{ animation: 'ai-ring-expand 1.8s ease-out infinite' }}
          />
          <img
            src="/logos/logo-icon.png"
            alt=""
            className="relative h-5 w-5 object-contain"
            style={{ animation: 'ai-orb-breathe 1.8s ease-in-out infinite', aspectRatio: 'auto' }}
          />
        </div>

        {/* Dots */}
        <div className="flex items-center gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="typing-dot h-[5px] w-[5px] rounded-full bg-genesis-400"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>

        <span className="text-xs font-medium text-surface-400">
          {t('chat.aiTyping')}
        </span>
      </div>
    </div>
  )
}
