/**
 * Canonical enum values from the Genesis API (tenant-facing).
 * Use {@link normalize*} helpers when reading strings from the wire.
 */

export const GENESIS_BUSINESS_STATUSES = [
  'INITIALIZING',
  'IN_PROGRESS',
  'HALTED',
  'COMPLETED',
  'CANCELLED',
  'FAILED',
  'PENDING_NEGOTIATION',
  'CHECKING',
  'OPPORTUNITY',
  'INACTIVE',
] as const
export type GenesisBusinessStatus = (typeof GENESIS_BUSINESS_STATUSES)[number]

export const GENESIS_STAGE_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'AWAITING_APPROVAL',
  'SUCCESS',
  'FAILED',
  'RETRYING',
  'CANCELLED',
] as const
export type GenesisStageStatus = (typeof GENESIS_STAGE_STATUSES)[number]

export const GENESIS_AGENT_IDS = [
  'orchestrator',
  'agent_prompter',
  'agent_financial',
  'agent_spatial',
  'agent_real_estate',
  'agent_negotiation',
  'agent_legal',
  'agent_renovation',
  'agent_licensing',
  'agent_procurement',
  'agent_hr',
  'agent_liaison',
] as const
export type GenesisAgentId = (typeof GENESIS_AGENT_IDS)[number]

export const GENESIS_DOCUMENT_CATEGORIES = ['contract', 'tax', 'employment', 'licensing'] as const
export type GenesisDocumentCategory = (typeof GENESIS_DOCUMENT_CATEGORIES)[number]

export const GENESIS_DOCUMENT_STATUSES = ['pending', 'approved', 'pending_signature', 'signed', 'error'] as const
export type GenesisDocumentStatus = (typeof GENESIS_DOCUMENT_STATUSES)[number]

export const GENESIS_ACTIVITY_STATUSES = ['completed', 'pending_approval', 'error'] as const
export type GenesisActivityStatus = (typeof GENESIS_ACTIVITY_STATUSES)[number]

function canonEnumKey(raw: string | null | undefined): string {
  return String(raw ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
}

export function normalizeGenesisBusinessStatus(raw: string | null | undefined): GenesisBusinessStatus | null {
  const u = canonEnumKey(raw)
  return (GENESIS_BUSINESS_STATUSES as readonly string[]).includes(u) ? (u as GenesisBusinessStatus) : null
}

export function normalizeGenesisStageStatus(raw: string | null | undefined): GenesisStageStatus {
  const u = canonEnumKey(raw)
  if ((GENESIS_STAGE_STATUSES as readonly string[]).includes(u)) return u as GenesisStageStatus
  return 'NOT_STARTED'
}

export function normalizeGenesisDocumentCategory(raw: string | null | undefined): GenesisDocumentCategory | null {
  const u = String(raw ?? '')
    .trim()
    .toLowerCase()
  if (u === 'deal') return 'contract'
  return (GENESIS_DOCUMENT_CATEGORIES as readonly string[]).includes(u) ? (u as GenesisDocumentCategory) : null
}

export function normalizeGenesisDocumentStatus(raw: string | null | undefined): GenesisDocumentStatus | null {
  const u = String(raw ?? '')
    .trim()
    .toLowerCase()
  return (GENESIS_DOCUMENT_STATUSES as readonly string[]).includes(u) ? (u as GenesisDocumentStatus) : null
}

export function normalizeGenesisActivityStatus(raw: string | null | undefined): GenesisActivityStatus {
  const u = String(raw ?? '')
    .trim()
    .toLowerCase()
  if (u === 'completed') return 'completed'
  if (u === 'error' || u === 'failed') return 'error'
  if (u === 'pending_approval' || u === 'awaiting_approval' || u === 'in_progress' || u === 'not_started' || u === 'pending')
    return 'pending_approval'
  return 'pending_approval'
}

/** BE hex colors + pulse hint for stage UI. */
export const GENESIS_STAGE_STATUS_META: Record<
  GenesisStageStatus,
  { hex: string; textHex: string; pulse: boolean }
> = {
  NOT_STARTED: { hex: '#9CA3AF', textHex: '#4B5563', pulse: false },
  IN_PROGRESS: { hex: '#3B82F6', textHex: '#1D4ED8', pulse: true },
  AWAITING_APPROVAL: { hex: '#F59E0B', textHex: '#B45309', pulse: true },
  SUCCESS: { hex: '#10B981', textHex: '#047857', pulse: false },
  FAILED: { hex: '#EF4444', textHex: '#B91C1C', pulse: false },
  RETRYING: { hex: '#FBBF24', textHex: '#B45309', pulse: true },
  CANCELLED: { hex: '#6B7280', textHex: '#374151', pulse: false },
}

export function isGenesisAgentId(raw: string | null | undefined): raw is GenesisAgentId {
  const u = String(raw ?? '').trim()
  return (GENESIS_AGENT_IDS as readonly string[]).includes(u)
}

/** i18n key `enums.businessStatus.<STATUS>` when the value is a known API enum. */
export function genesisBusinessStatusTranslationKey(raw: string | null | undefined): string | null {
  const n = normalizeGenesisBusinessStatus(raw)
  return n ? `enums.businessStatus.${n}` : null
}
