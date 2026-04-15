import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchLegalDocumentsForBusiness } from '../api/genesis/legalDocumentsApi'
import type { LegalDocumentsListPayload } from '../types/legalDocument'
import { POLL_MS_DASHBOARD, refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'

export function useLegalDocumentsForBusiness(businessId: string | null): {
  data: LegalDocumentsListPayload | null
  loading: boolean
  error: string | null
  refetch: () => void
} {
  const qc = useQueryClient()
  const id = businessId?.trim() || null

  const q = useQuery({
    queryKey: ['legal-documents', id],
    queryFn: () => fetchLegalDocumentsForBusiness(id!),
    enabled: Boolean(id),
    refetchInterval: refetchIntervalWithVisibilityAndBackoff(POLL_MS_DASHBOARD),
  })

  const refetch = useCallback(() => {
    if (id) void qc.invalidateQueries({ queryKey: ['legal-documents', id] })
  }, [qc, id])

  return {
    data: q.data ?? null,
    loading: Boolean(id) && (q.isLoading || q.isFetching),
    error: q.isError ? 'legal.loadDocumentsFailed' : null,
    refetch,
  }
}
