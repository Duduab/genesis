import type { GenesisStageDetail, GenesisStageLogs } from '../../types/genesisStageDetail'
import { genesisGetJson, genesisPostJson } from './client'

function requireStageData<T>(data: T | null | undefined, label: string): T {
  if (data == null || typeof data !== 'object') {
    throw new Error(`Invalid ${label} response`)
  }
  return data
}

/**
 * GET `/api/v1/stages/{id}` — full stage detail (inputs, outputs, status, timing).
 */
export async function fetchStageById(stageId: string): Promise<GenesisStageDetail> {
  const id = encodeURIComponent(stageId.trim())
  const envelope = await genesisGetJson<GenesisStageDetail>(`/api/v1/stages/${id}`)
  return requireStageData(envelope.data, 'stage detail') as GenesisStageDetail
}

/**
 * GET `/api/v1/stages/{id}/logs` — raw agent trace (prompts, tool calls, tokens, cost ILS).
 */
export async function fetchStageLogs(stageId: string): Promise<GenesisStageLogs> {
  const id = encodeURIComponent(stageId.trim())
  const envelope = await genesisGetJson<GenesisStageLogs>(`/api/v1/stages/${id}/logs`)
  return (envelope.data ?? null) as GenesisStageLogs
}

/**
 * POST `/api/v1/stages/{id}/retry` — re-run agent from scratch (FAILED stages).
 */
export async function postStageRetry(stageId: string): Promise<void> {
  const id = encodeURIComponent(stageId.trim())
  const idempotencyKey =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `stage-retry-${Date.now()}-${Math.random().toString(36).slice(2)}`
  await genesisPostJson<unknown>(`/api/v1/stages/${id}/retry`, {
    idempotencyKey,
  })
}
