import type { GenesisBusinessApiData } from '../../types/genesisBusiness'
import { genesisGetJson, genesisPostJson, genesisPutJson } from './client'

export async function fetchGenesisBusinessById(businessId: string): Promise<GenesisBusinessApiData> {
  const id = encodeURIComponent(businessId.trim())
  const envelope = await genesisGetJson<GenesisBusinessApiData>(`/api/v1/businesses/${id}`)
  if (!envelope.data?.business_id) {
    throw new Error('Invalid business response')
  }
  return envelope.data
}

/**
 * POST `/api/v1/businesses/{business_id}/cancel` — cancel an in-progress business (server “delete”).
 * Sends optional `Idempotency-Key` header per API contract.
 */
export interface UpdateGenesisBusinessBody {
  company_name: string
  hp_number: string
}

/**
 * PUT `/api/v1/businesses/{business_id}` — update company display fields.
 */
export async function updateGenesisBusiness(
  businessId: string,
  body: UpdateGenesisBusinessBody,
): Promise<GenesisBusinessApiData> {
  const id = encodeURIComponent(businessId.trim())
  const envelope = await genesisPutJson<GenesisBusinessApiData>(`/api/v1/businesses/${id}`, {
    body: {
      company_name: body.company_name.trim(),
      hp_number: body.hp_number.trim(),
    },
  })
  if (!envelope.data?.business_id) {
    throw new Error('Invalid business update response')
  }
  return envelope.data
}

export async function cancelGenesisBusiness(businessId: string): Promise<void> {
  const id = encodeURIComponent(businessId.trim())
  const idempotencyKey =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `cancel-${Date.now()}-${Math.random().toString(36).slice(2)}`
  await genesisPostJson<unknown>(`/api/v1/businesses/${id}/cancel`, {
    idempotencyKey,
  })
}
