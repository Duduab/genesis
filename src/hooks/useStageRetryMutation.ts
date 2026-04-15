import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postStageRetry } from '../api/genesis/stagesApi'

export function useStageRetryMutation(
  stageId: string | null | undefined,
  options?: { businessId?: string | null },
) {
  const qc = useQueryClient()
  const id = stageId?.trim() || null
  const bid = options?.businessId?.trim() || null

  return useMutation({
    mutationFn: () => {
      if (!id) throw new Error('Missing stage id')
      return postStageRetry(id)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['stage-detail', id] })
      await qc.invalidateQueries({ queryKey: ['stage-logs', id] })
      if (bid) await qc.invalidateQueries({ queryKey: ['business-stages', bid] })
      await qc.invalidateQueries({ queryKey: ['my-entities'] })
    },
  })
}
