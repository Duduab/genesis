import { GENESIS_STAGE_STATUS_META, normalizeGenesisStageStatus } from '../constants/genesisApiEnums'
import { useI18n } from '../i18n/I18nContext'

/**
 * Renders a pipeline / business stage status with exact API colors and optional pulse animation.
 */
export default function GenesisStageStatusBadge({ status, className = '' }) {
  const { t } = useI18n()
  const key = normalizeGenesisStageStatus(status)
  const meta = GENESIS_STAGE_STATUS_META[key]
  const label = t(`enums.stageStatus.${key}`)
  const pulse = meta.pulse

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${pulse ? 'genesis-stage-pulse' : ''} ${className}`.trim()}
      style={{
        color: meta.textHex,
        backgroundColor: `${meta.hex}1f`,
        borderColor: `${meta.hex}66`,
      }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: meta.hex }} aria-hidden />
      {label}
    </span>
  )
}
