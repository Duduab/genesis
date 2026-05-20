import { genesisGetJson } from './client'
import { isGenesisApiError } from './errors'
import type { BusinessAgentsProgressData } from '../../types/businessAgentsProgress'

/** Path segment after `/api/v1/businesses/{id}/` for per-agent drill-down. */
const DRILLDOWN_SEGMENT: Record<string, string> = {
  agent_mri: 'mri-blueprint',
  agent_nira: 'nira-session',
  agent_glo: 'glo-result',
  agent_nego: 'nego-auction',
}

export function drilldownSegmentForAgentId(agentId: string): string | null {
  const key = String(agentId || '').trim().toLowerCase()
  return DRILLDOWN_SEGMENT[key] ?? null
}

export async function fetchBusinessAgentsProgress(businessId: string): Promise<BusinessAgentsProgressData> {
  const bid = encodeURIComponent(businessId.trim())
  const envelope = await genesisGetJson<BusinessAgentsProgressData>(`/api/v1/businesses/${bid}/progress`)
  const d = envelope.data
  if (!d || typeof d !== 'object' || !Array.isArray(d.stages)) {
    throw new Error('Invalid businesses progress response')
  }
  return d
}

/**
 * Fetches agent-specific payload. Returns `null` on 404 (no data yet).
 */
export async function fetchBusinessAgentDrilldown(
  businessId: string,
  agentId: string,
): Promise<unknown | null> {
  const segment = drilldownSegmentForAgentId(agentId)
  if (!segment) return null
  const bid = encodeURIComponent(businessId.trim())
  try {
    const envelope = await genesisGetJson<unknown>(`/api/v1/businesses/${bid}/${segment}`)
    return envelope.data ?? null
  } catch (e) {
    if (isGenesisApiError(e) && e.status === 404) return null
    throw e
  }
}