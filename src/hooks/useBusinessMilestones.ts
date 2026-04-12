import { useCallback, useEffect, useState } from 'react'
import { fetchBusinessMilestones } from '../api/genesis/businessMilestonesApi'
import type { BusinessMilestoneApiRow } from '../types/businessMilestone'

export function useBusinessMilestones(businessId: string | null): {
  milestones: BusinessMilestoneApiRow[]
  loading: boolean
  error: string | null
  refetch: () => void
} {
  const [tick, setTick] = useState(0)
  const [milestones, setMilestones] = useState<BusinessMilestoneApiRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!businessId?.trim()) {
      setMilestones([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const rows = await fetchBusinessMilestones(businessId)
        if (!cancelled) {
          setMilestones(rows)
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setMilestones([])
          setError('dashboard.milestones.error')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [businessId, tick])

  return { milestones, loading, error, refetch }
}
