import { useCallback, useEffect, useState } from 'react'
import { fetchLegalDocumentsForBusiness } from '../api/genesis/legalDocumentsApi'
import type { LegalDocumentsListPayload } from '../types/legalDocument'

export function useLegalDocumentsForBusiness(businessId: string | null): {
  data: LegalDocumentsListPayload | null
  loading: boolean
  error: string | null
  refetch: () => void
} {
  const [tick, setTick] = useState(0)
  const [data, setData] = useState<LegalDocumentsListPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (!businessId?.trim()) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const payload = await fetchLegalDocumentsForBusiness(businessId)
        if (!cancelled) {
          setData(payload)
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setData(null)
          setError('legal.loadDocumentsFailed')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [businessId, tick])

  return { data, loading, error, refetch }
}
