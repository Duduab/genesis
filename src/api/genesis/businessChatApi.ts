import type {
  ChatMessagesPayload,
  ChatPostQueuedAck,
  ChatTimelineEntry,
} from '../../types/chatMessage'
import { genesisGetJson, genesisPostJson } from './client'

function unwrapMessages(envelope: { data?: ChatMessagesPayload | null }): ChatMessagesPayload {
  const d = envelope.data
  if (!d || !Array.isArray(d.items)) {
    throw new Error('Invalid chat messages response')
  }
  return { items: d.items, has_more: Boolean(d.has_more) }
}

export interface FetchChatMessagesParams {
  /** Poll cursor: last seen message UUID (OpenAPI query `after`). */
  after?: string | null
  limit?: number
}

/** GET `/api/v1/businesses/{business_id}/chat/messages` */
export async function fetchChatMessages(
  businessId: string,
  params: FetchChatMessagesParams = {},
): Promise<ChatMessagesPayload> {
  const id = encodeURIComponent(businessId.trim())
  const q = new URLSearchParams()
  if (params.after?.trim()) q.set('after', params.after.trim())
  if (typeof params.limit === 'number') q.set('limit', String(params.limit))
  const qs = q.toString()
  const path = `/api/v1/businesses/${id}/chat/messages${qs ? `?${qs}` : ''}`
  const envelope = await genesisGetJson<ChatMessagesPayload>(path)
  return unwrapMessages(envelope)
}

export type ChatSendLanguage = 'auto' | 'he' | 'en'

/**
 * POST `/api/v1/businesses/{business_id}/chat/messages`
 * Body: `{ content, language }` — returns 202 with `{ message_id, status: "queued" }` in envelope `data`.
 */
export async function postChatMessage(
  businessId: string,
  content: string,
  language: ChatSendLanguage = 'auto',
): Promise<ChatPostQueuedAck> {
  const bid = encodeURIComponent(businessId.trim())
  const idempotencyKey =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `chat-${Date.now()}`
  const envelope = await genesisPostJson<ChatPostQueuedAck>(`/api/v1/businesses/${bid}/chat/messages`, {
    body: { content: content.trim(), language },
    idempotencyKey,
  })
  const d = envelope.data
  if (!d || typeof d.message_id !== 'string') {
    throw new Error('Invalid chat post response')
  }
  return { message_id: d.message_id, status: String(d.status ?? 'queued') }
}

export type ChatApprovalDecision = 'APPROVE' | 'REJECT'

/** POST `/api/v1/businesses/{business_id}/chat/approvals/{approval_id}/decide` */
export async function postChatApprovalDecision(
  businessId: string,
  approvalId: string,
  decision: ChatApprovalDecision,
  notes = '',
): Promise<void> {
  const bid = encodeURIComponent(businessId.trim())
  const aid = encodeURIComponent(approvalId.trim())
  const idempotencyKey =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `approval-${Date.now()}`
  await genesisPostJson<unknown>(`/api/v1/businesses/${bid}/chat/approvals/${aid}/decide`, {
    body: { decision, notes: notes.trim() },
    idempotencyKey,
  })
}

/** GET `/api/v1/businesses/{business_id}/chat/timeline` — unified chat + stages feed. */
export async function fetchChatTimeline(businessId: string, limit = 100): Promise<ChatTimelineEntry[]> {
  const bid = encodeURIComponent(businessId.trim())
  const envelope = await genesisGetJson<ChatTimelineEntry[]>(
    `/api/v1/businesses/${bid}/chat/timeline?limit=${encodeURIComponent(String(limit))}`,
  )
  const d = envelope.data
  if (!Array.isArray(d)) {
    throw new Error('Invalid chat timeline response')
  }
  return d
}
