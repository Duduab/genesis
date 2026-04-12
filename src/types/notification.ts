export interface GenesisNotificationItem {
  notification_id: string
  title: string
  body: string
  type: string
  read: boolean
  business_id: string | null
  created_at: string
}

export interface NotificationsDataPayload {
  items: GenesisNotificationItem[]
  unread_count: number
}
