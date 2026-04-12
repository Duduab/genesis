import type { NotificationsDataPayload } from '../../types/notification'
import { genesisGetJson } from './client'

/**
 * GET `/api/v1/notifications`
 */
export async function fetchNotifications(): Promise<NotificationsDataPayload> {
  const envelope = await genesisGetJson<NotificationsDataPayload>('/api/v1/notifications')
  const d = envelope.data
  if (!d || !Array.isArray(d.items)) {
    throw new Error('Invalid notifications response')
  }
  return {
    items: d.items,
    unread_count: typeof d.unread_count === 'number' ? d.unread_count : d.items.filter((i) => !i.read).length,
  }
}
