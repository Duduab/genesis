import type { GenesisGuardrails, NotificationPrefs } from '../../types/tenantSettings'

function asBool(v: unknown, fallback: boolean): boolean {
  if (typeof v === 'boolean') return v
  if (v === 1 || v === '1') return true
  if (v === 0 || v === '0') return false
  if (typeof v === 'string') {
    const s = v.toLowerCase()
    if (s === 'true') return true
    if (s === 'false') return false
  }
  return fallback
}

export function parseNotificationPrefs(data: Record<string, unknown>): NotificationPrefs {
  return {
    email_on_approval: asBool(data.email_on_approval, true),
    email_on_completion: asBool(data.email_on_completion, true),
    email_on_error: asBool(data.email_on_error, true),
    push_enabled: asBool(data.push_enabled, false),
  }
}

function asFiniteNumber(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

export function normalizeMaxMessagesPerAgent(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { default: 100 }
  }
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = asFiniteNumber(v, NaN)
    if (Number.isFinite(n)) out[k] = n
  }
  return Object.keys(out).length ? out : { default: 100 }
}

export function parseGenesisGuardrails(data: Record<string, unknown>): GenesisGuardrails {
  const blocked = data.blocked_agents
  const agents = Array.isArray(blocked) ? blocked.map((id) => String(id)) : []

  return {
    max_messages_per_agent: normalizeMaxMessagesPerAgent(data.max_messages_per_agent),
    max_budget_per_stage_ils: asFiniteNumber(data.max_budget_per_stage_ils, 0),
    require_approval_above_ils: asFiniteNumber(data.require_approval_above_ils, 0),
    blocked_agents: agents,
  }
}
