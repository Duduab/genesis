import { useCallback, useEffect, useState } from 'react'
import { fetchBusinessAgents } from '../api/genesis/businessAgentsApi'
import type { BusinessAgentApiRow } from '../types/businessAgent'

export function useBusinessAgents(businessId: string | null): {
  agents: BusinessAgentApiRow[]
  loading: boolean
  error: string | null
  refetch: () => void
} {
  const [tick, setTick] = useState(0)
  const [agents, setAgents] = useState<BusinessAgentApiRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!businessId?.trim()) {
      setAgents([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const rows = await fetchBusinessAgents(businessId)
        if (!cancelled) {
          setAgents(rows)
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setAgents([])
          setError('activity.loadAgentsFailed')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [businessId, tick])

  return { agents, loading, error, refetch }
}
