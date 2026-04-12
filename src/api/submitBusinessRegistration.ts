import type { BusinessRegistrationPayload } from '../types/business'
import type { GenesisBusinessApiData } from '../types/genesisBusiness'
import { genesisPostJson } from './genesis/client'
import { wizardPayloadToCreateBusinessRequest } from './genesis/mapWizardToCreateBusiness'

export interface SubmitBusinessRegistrationResult {
  businessId: string
  data: GenesisBusinessApiData
}

/**
 * Submits the wizard payload to `POST /api/v1/businesses` (full URL from env / default staging origin).
 */
export async function submitBusinessRegistration(
  payload: BusinessRegistrationPayload,
  options?: { idempotencyKey?: string },
): Promise<SubmitBusinessRegistrationResult | undefined> {
  const body = wizardPayloadToCreateBusinessRequest(payload)
  const idempotencyKey = options?.idempotencyKey ?? crypto.randomUUID()

  const envelope = await genesisPostJson<GenesisBusinessApiData>('/api/v1/businesses', {
    body,
    idempotencyKey,
  })

  const data = envelope.data
  const id = data?.business_id
  if (typeof id === 'string' && data) return { businessId: id, data }
  return undefined
}
