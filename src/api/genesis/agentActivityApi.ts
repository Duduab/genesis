import type { AgentActivityListPayload } from '../../types/agentActivity'
import { genesisGetJson } from './client'

export interface FetchAgentActivityParams {
  business_id?: string | null
  agent?: string | null
  status?: string | null
  from?: string | null
  to?: string | null
  limit?: number
  offset?: number
}

function buildQuery(p: FetchAgentActivityParams): string {
  const q = new URLSearchParams()
  if (p.business_id?.trim()) q.set('business_id', p.business_id.trim())
  if (p.agent?.trim()) q.set('agent', p.agent.trim())
  if (p.status?.trim()) q.set('status', p.status.trim())
  if (p.from?.trim()) q.set('from', p.from.trim())
  if (p.to?.trim()) q.set('to', p.to.trim())
  if (typeof p.limit === 'number') q.set('limit', String(p.limit))
  if (typeof p.offset === 'number') q.set('offset', String(p.offset))
  const s = q.toString()
  return s ? `?${s}` : ''
}

/**
 * GET `/api/v1/agent-activity` — filtered activity feed (OpenAPI).
 * Response envelope `data` is `{ items, status_counts? }`.
 */
export async function fetchAgentActivityList(params: FetchAgentActivityParams = {}): Promise<AgentActivityListPayload> {
  const envelope = await genesisGetJson<AgentActivityListPayload>(`/api/v1/agent-activity${buildQuery(params)}`)
  const d = envelope.data
  if (!d || !Array.isArray(d.items)) {
    throw new Error('Invalid agent-activity response')
  }
  return { items: d.items, status_counts: d.status_counts }
}
