import { formatNisFull } from '../utils/formatNis'
import type { PersistedGenesisBusiness } from './genesisBusinessStorage'

export type EntityUiStatus = 'active' | 'pendingVat' | 'underReview' | 'hibernating' | 'dormant'

export type EntityUiType = 'privateCompany' | 'llc' | 'corporation'

/** Shared view model for dashboard + My Entities cards. */
export interface GenesisEntityViewModel {
  key: string
  name: string
  legalIdDisplay: string
  status: EntityUiStatus
  entityType: EntityUiType
  agentsCount: number
  balanceLabel: string
  burnRateLabel: string
  balanceTrend: 'up' | 'down'
  burnTrend: 'up' | 'down'
  registeredLabel: string
  /** Indices into fixed avatar palette (My Entities). */
  agentAvatarIndices: number[]
}

function mapGlobalStatus(raw: string): EntityUiStatus {
  const u = raw.toUpperCase()
  if (u === 'ACTIVE' || u === 'OPERATIONAL') return 'active'
  if (u.includes('VAT') || u.includes('TAX_PENDING')) return 'pendingVat'
  if (u.includes('HIBERN') || u.includes('DORMANT') || u.includes('PAUSED')) return 'hibernating'
  if (u === 'INITIALIZING' || u.includes('PROGRESS') || u.includes('WAITING')) return 'underReview'
  return 'underReview'
}

function licenseToEntityType(licenseType: PersistedGenesisBusiness['licenseType']): EntityUiType {
  if (licenseType === 'ltd') return 'llc'
  return 'privateCompany'
}

function agentIndices(count: number, max = 3): number[] {
  const n = Math.min(Math.max(0, count), max)
  return Array.from({ length: n }, (_, i) => i)
}

export function mapPersistedBusinessToEntityView(
  row: PersistedGenesisBusiness,
  locale: string,
): GenesisEntityViewModel {
  const { api, licenseType } = row
  const name =
    api.company_name?.trim() ||
    [api.entrepreneur_name?.trim(), api.business_type.replace(':', ' · ')].filter(Boolean).join(' — ') ||
    api.business_id

  const hp = api.hp_number?.trim()
  const legalIdDisplay = hp ? `HP ${hp}` : api.business_id.slice(0, 8).toUpperCase()

  const monthly = api.monthly_cost_ils ?? 0
  const burnRateLabel =
    monthly > 0 ? `${formatNisFull(monthly, locale)}/mo` : `${formatNisFull(0, locale)}/mo`

  const created = new Date(api.created_at)
  const tag = locale === 'he' ? 'he-IL' : 'en-US'
  const registeredLabel = Number.isNaN(created.getTime())
    ? '—'
    : created.toLocaleDateString(tag, { month: 'short', year: 'numeric' })

  return {
    key: api.business_id,
    name,
    legalIdDisplay,
    status: mapGlobalStatus(api.global_status),
    entityType: licenseToEntityType(licenseType),
    agentsCount: api.active_agents_count,
    balanceLabel: formatNisFull(api.available_budget_ils, locale),
    burnRateLabel,
    balanceTrend: 'up',
    burnTrend: monthly <= 0 ? 'down' : 'up',
    registeredLabel,
    agentAvatarIndices: agentIndices(api.active_agents_count),
  }
}

/** ActiveEntities uses `dormant` instead of `hibernating` in statusConfig. */
export function toActiveEntitiesStatus(s: EntityUiStatus): EntityUiStatus | 'dormant' {
  if (s === 'hibernating') return 'dormant'
  return s
}
