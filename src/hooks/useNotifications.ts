import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNotifications } from '../api/genesis/notificationsApi'
import type { GenesisNotificationItem } from '../types/notification'
import { POLL_MS_DASHBOARD, refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'

const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const

export function useNotifications(open: boolean, options?: { enabled?: boolean }): {
  items: GenesisNotificationItem[]
  loading: boolean
  error: string | null
  effectiveUnread: number
  isItemUnread: (n: GenesisNotificationItem) => boolean
  refetch: () => void
  markRead: (notificationId: string) => void
  markAllRead: () => void
} {
  const qc = useQueryClient()
  const [localRead, setLocalRead] = useState<Set<string>>(() => new Set())

  const queryEnabled = options?.enabled !== false

  const q = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: fetchNotifications,
    enabled: queryEnabled,
    refetchInterval: queryEnabled ? refetchIntervalWithVisibilityAndBackoff(POLL_MS_DASHBOARD) : false,
  })

  const refetch = useCallback(() => {
    void qc.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
  }, [qc])

  const items = q.data?.items ?? []

  const isUnread = useCallback(
    (n: GenesisNotificationItem) => !n.read && !localRead.has(n.notification_id),
    [localRead],
  )

  const effectiveUnread = useMemo(() => items.filter(isUnread).length, [items, isUnread])

  const markRead = useCallback((notificationId: string) => {
    setLocalRead((prev) => new Set([...prev, notificationId]))
  }, [])

  const markAllRead = useCallback(() => {
    setLocalRead((prev) => {
      const next = new Set(prev)
      for (const n of items) {
        next.add(n.notification_id)
      }
      return next
    })
  }, [items])

  useEffect(() => {
    if (open) refetch()
  }, [open, refetch])

  return {
    items,
    loading: q.isLoading || q.isFetching,
    error: q.isError ? 'topHeader.notificationsLoadFailed' : null,
    effectiveUnread,
    isItemUnread: isUnread,
    refetch,
    markRead,
    markAllRead,
  }
}
