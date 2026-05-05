const memoryHiddenByBusiness = new Map<string, Set<string>>()

function businessKey(businessId: string): string {
  return businessId.trim()
}

export function orchestratorChatHiddenIdsStorageKey(businessId: string): string {
  return `genesis-orchestrator-chat-hidden-ids-${encodeURIComponent(businessId.trim())}`
}

/** Best-effort sort time (ms) from API payloads (snake_case, camelCase, epoch). */
export function getChatMessageSortTimeMs(item: object): number {
  const r = item as Record<string, unknown>
  const candidates = [
    item.created_at,
    item.timestamp,
    item.createdAt,
    item.updated_at,
    item.sent_at,
  ]
  for (const raw of candidates) {
    if (raw == null || raw === '') continue
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      const n = raw
      return n > 1e12 ? n : n * 1000
    }
    if (typeof raw === 'string') {
      const t = new Date(raw).getTime()
      if (Number.isFinite(t)) return t
    }
  }
  return 0
}

function loadPersistedHiddenIds(businessId: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(orchestratorChatHiddenIdsStorageKey(businessId))
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((x): x is string => typeof x === 'string' && x.trim().length > 0))
  } catch {
    return new Set()
  }
}

function persistHiddenIds(businessId: string, set: Set<string>): void {
  try {
    sessionStorage.setItem(orchestratorChatHiddenIdsStorageKey(businessId), JSON.stringify([...set]))
  } catch {
    /* quota / private mode — memory still holds ids for this tab */
  }
}

/** Message IDs hidden for this business after "clear chat" (client-side when DELETE is unsupported). */
export function getHiddenOrchestratorMessageIds(businessId: string | null | undefined): Set<string> {
  if (!businessId?.trim()) return new Set()
  const key = businessKey(businessId)
  let s = memoryHiddenByBusiness.get(key)
  if (!s) {
    s = loadPersistedHiddenIds(businessId)
    memoryHiddenByBusiness.set(key, s)
  }
  return new Set(s)
}

export function mergeHiddenOrchestratorMessageIds(
  businessId: string,
  ids: ReadonlyArray<string | undefined | null>,
): void {
  const key = businessKey(businessId)
  const cur = new Set(memoryHiddenByBusiness.get(key) ?? loadPersistedHiddenIds(businessId))
  for (const id of ids) {
    const t = id != null && String(id).trim()
    if (t) cur.add(t)
  }
  memoryHiddenByBusiness.set(key, cur)
  persistHiddenIds(businessId, cur)
}
