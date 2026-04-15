import { useQuery } from '@tanstack/react-query'
import { fetchStageById } from '../api/genesis/stagesApi'
import { POLL_MS_INTERACTIVE, refetchIntervalWithVisibilityAndBackoff } from '../lib/genesisPolling'

export function useStageDetailQuery(stageId: string | null | undefined, options?: { enabled?: boolean }) {
  const id = stageId?.trim() || null
  const enabled = Boolean(id) && (options?.enabled !== false)

  return useQuery({
    queryKey: ['stage-detail', id],
    queryFn: () => fetchStageById(id!),
    enabled,
    staleTime: 5_000,
    refetchInterval: enabled ? refetchIntervalWithVisibilityAndBackoff(POLL_MS_INTERACTIVE) : false,
  })
}
