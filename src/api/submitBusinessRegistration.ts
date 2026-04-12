import type { BusinessRegistrationPayload } from '../types/business'
import { genesisPostJson } from './genesis/client'
import { wizardPayloadToCreateBusinessRequest } from './genesis/mapWizardToCreateBusiness'

export interface SubmitBusinessRegistrationResult {
  businessId: string
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

  const envelope = await genesisPostJson<{ business_id: string }>('/api/v1/businesses', {
    body,
    idempotencyKey,
  })

  const id = envelope.data?.business_id
  if (typeof id === 'string') return { businessId: id }
  return undefined
}
