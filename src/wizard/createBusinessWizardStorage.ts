import type { WizardStep1Persisted } from '../types/business'

const STORAGE_KEY = 'genesis-create-business-wizard'

/** Dev default when storage is empty: Culinary → Delicatessen (per product spec). */
export const WIZARD_STEP1_MOCK: WizardStep1Persisted = {
  categoryId: 'culinary',
  subTypeId: 'delicatessen',
  budgetNis: 300_000,
  cityId: 'telAviv',
  licenseType: 'authorized_dealer',
}

/** Parsed wizard payload or null (no session data / invalid). */
export function readWizardStep1OrNull(): WizardStep1Persisted | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<WizardStep1Persisted>
    if (
      typeof parsed.categoryId === 'string' &&
      typeof parsed.subTypeId === 'string' &&
      typeof parsed.budgetNis === 'number' &&
      typeof parsed.cityId === 'string' &&
      (parsed.licenseType === 'authorized_dealer' || parsed.licenseType === 'ltd')
    ) {
      return {
        categoryId: parsed.categoryId,
        subTypeId: parsed.subTypeId,
        budgetNis: parsed.budgetNis,
        cityId: parsed.cityId,
        licenseType: parsed.licenseType,
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

/**
 * Step 2: use saved Step 1 data, or dev mock (Culinary → Delicatessen) when empty.
 */
export function loadWizardStep1(): WizardStep1Persisted {
  return readWizardStep1OrNull() ?? { ...WIZARD_STEP1_MOCK }
}

export function saveWizardStep1(state: WizardStep1Persisted): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function clearWizardStorage(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
