import { useQuery } from '@tanstack/react-query'
import { fetchStageLogs } from '../api/genesis/stagesApi'

/** Debug / admin: raw stage logs (not polled aggressively). */
export function useStageLogsQuery(stageId: string | null | undefined, options?: { enabled?: boolean }) {
  const id = stageId?.trim() || null
  const enabled = Boolean(id) && Boolean(options?.enabled)

  return useQuery({
    queryKey: ['stage-logs', id],
    queryFn: () => fetchStageLogs(id!),
    enabled,
    staleTime: 30_000,
  })
}
