import type { BusinessRegistrationPayload } from '../../types/business'

/** Matches OpenAPI `CreateBusinessRequest` (POST /api/v1/businesses). */
export interface CreateBusinessRequestBody {
  entrepreneur_name: string
  entrepreneur_phone: string
  city_of_residence: string
  business_type: string
  target_city: string
  total_budget_ils: number
  requires_genesis_legal: boolean
  existing_tax_file: boolean
}

/** Canonical English city names for the API (establishment city from step 1). */
const ESTABLISHMENT_CITY_EN: Record<string, string> = {
  jerusalem: 'Jerusalem',
  telAviv: 'Tel Aviv',
  haifa: 'Haifa',
  beerSheva: 'Beer Sheva',
}

function establishmentCityEn(cityId: string): string {
  return ESTABLISHMENT_CITY_EN[cityId] ?? cityId
}

function normalizeBudgetIls(nis: number): number {
  const n = Math.round(Number(nis))
  return Number.isFinite(n) ? n : 0
}

/**
 * Maps licensing choice (step 1) to `existing_tax_file` (OpenAPI default false).
 * Authorized dealer (עוסק מורשה) → likely an existing tax / מס הכנסה file; LTD green-field → false.
 */
function existingTaxFileFromLicense(licenseType: string): boolean {
  return licenseType === 'authorized_dealer'
}

export function wizardPayloadToCreateBusinessRequest(
  payload: BusinessRegistrationPayload,
): CreateBusinessRequestBody {
  const cityEn = establishmentCityEn(payload.business.cityId)

  return {
    entrepreneur_name: payload.user.fullName.trim(),
    entrepreneur_phone: payload.user.phone.trim(),
    // Step 1 establishment city (RegisterPage). Same value until a separate residence field exists.
    city_of_residence: cityEn,
    business_type: `${payload.business.categoryId}:${payload.business.subTypeId}`,
    target_city: cityEn,
    total_budget_ils: normalizeBudgetIls(payload.business.budgetNis),
    requires_genesis_legal: payload.business.requiresGenesisLegal !== false,
    existing_tax_file: existingTaxFileFromLicense(payload.business.licenseType),
  }
}
