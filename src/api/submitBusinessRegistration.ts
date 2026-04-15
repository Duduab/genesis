import type { BusinessRegistrationPayload } from '../types/business'
import type { GenesisBusinessApiData } from '../types/genesisBusiness'
import { genesisPostJson } from './genesis/client'
import { fetchGenesisBusinessList } from './genesis/businessesApi'
import { wizardPayloadToCreateBusinessRequest, type CreateBusinessRequestBody } from './genesis/mapWizardToCreateBusiness'

export interface SubmitBusinessRegistrationResult {
  businessId: string
  data: GenesisBusinessApiData
}

function isGenesisBusinessData(data: unknown): data is GenesisBusinessApiData {
  return Boolean(
    data &&
      typeof data === 'object' &&
      'business_id' in data &&
      typeof (data as GenesisBusinessApiData).business_id === 'string' &&
      String((data as GenesisBusinessApiData).business_id).length > 0,
  )
}

function isAlreadyCreatedPayload(data: unknown): boolean {
  return (
    Boolean(data) &&
    typeof data === 'object' &&
    (data as { status?: string }).status === 'already_created'
  )
}

/**
 * When POST returns idempotent replay (`already_created`), `business_id` is not in the body.
 * Match a row from GET /businesses using the same create payload fields.
 */
async function resolveBusinessAfterIdempotentReplay(
  body: CreateBusinessRequestBody,
): Promise<GenesisBusinessApiData | null> {
  const list = await fetchGenesisBusinessList({ limit: 100 })
  const tol = 1
  const matches = list.items.filter(
    (b) =>
      b.business_type === body.business_type &&
      b.target_location === body.target_city &&
      Math.abs(Number(b.total_budget_ils) - Number(body.total_budget_ils)) <= tol,
  )
  if (matches.length === 1) return matches[0]
  if (matches.length > 1) {
    return [...matches].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  }
  if (list.items.length > 0) {
    return [...list.items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  }
  return null
}

/**
 * Submits the wizard payload to `POST /api/v1/businesses` (full URL from env / default staging origin).
 *
 * **Idempotency:** Reusing the same `Idempotency-Key` returns `200` with `data.status: "already_created"` and no
 * `business_id`. We resolve the created row from `GET /api/v1/businesses` when possible.
 */
export async function submitBusinessRegistration(
  payload: BusinessRegistrationPayload,
  options?: { idempotencyKey?: string },
): Promise<SubmitBusinessRegistrationResult> {
  const body = wizardPayloadToCreateBusinessRequest(payload)
  const idempotencyKey = options?.idempotencyKey ?? crypto.randomUUID()

  const envelope = await genesisPostJson<GenesisBusinessApiData>('/api/v1/businesses', {
    body,
    idempotencyKey,
  })

  const data = envelope.data as unknown
  if (isGenesisBusinessData(data)) {
    return { businessId: data.business_id, data }
  }

  if (isAlreadyCreatedPayload(data)) {
    const resolved = await resolveBusinessAfterIdempotentReplay(body)
    if (resolved) return { businessId: resolved.business_id, data: resolved }
    throw new Error(
      'This submission was already processed (duplicate Idempotency-Key), but the business list could not be matched. Open My Businesses and refresh, or try again with a new request.',
    )
  }

  throw new Error('Invalid response from create business API (missing business_id).')
}
