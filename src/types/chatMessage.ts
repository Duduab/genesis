/** GET `/api/v1/businesses/{id}/chat/messages` — poll cursor: `after` = last seen `message_id` (UUID). */

export type ChatMessageRole = 'user' | 'assistant' | 'system' | 'agent' | string

export type ChatMessageType =
  | 'text'
  | 'agent_progress'
  | 'approval_card'
  | 'document_request'
  | 'info_request'
  | 'blocker'
  | 'error'
  | string

export interface ChatMessageApprovalData {
  approval_id?: string
}

export interface ChatMessageItem {
  message_id: string
  business_id?: string
  user_id?: string | null
  role: ChatMessageRole
  content?: string
  text?: string
  content_he?: string | null
  message_type?: ChatMessageType
  agent_actions?: Record<string, unknown> | null
  approval_data?: ChatMessageApprovalData | null
  metadata?: Record<string, unknown> | null
  status?: string
  created_at?: string
}

export interface ChatMessagesPayload {
  items: ChatMessageItem[]
  has_more: boolean
}

/** POST `/chat/messages` — 202 body `data` (per API contract). */
export interface ChatPostQueuedAck {
  message_id: string
  status: string
}

export interface ChatTimelineEntry {
  type: string
  id: string
  timestamp: string
  data: Record<string, unknown>
}
