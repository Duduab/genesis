import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchNotifications } from '../api/genesis/notificationsApi'
import type { GenesisNotificationItem } from '../types/notification'

export function useNotifications(open: boolean): {
  items: GenesisNotificationItem[]
  loading: boolean
  error: string | null
  effectiveUnread: number
  isItemUnread: (n: GenesisNotificationItem) => boolean
  refetch: () => void
  markRead: (notificationId: string) => void
  markAllRead: () => void
} {
  const [tick, setTick] = useState(0)
  const [items, setItems] = useState<GenesisNotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localRead, setLocalRead] = useState<Set<string>>(() => new Set())

  const refetch = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const data = await fetchNotifications()
        if (!cancelled) {
          setItems(data.items)
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setItems([])
          setError('topHeader.notificationsLoadFailed')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tick])

  useEffect(() => {
    if (!open) return
    setTick((n) => n + 1)
  }, [open])

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

  return { items, loading, error, effectiveUnread, isItemUnread: isUnread, refetch, markRead, markAllRead }
}
