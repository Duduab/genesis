/**
 * Generic structures for the Create Business wizard.
 * Add categories by extending {@link BUSINESS_CATEGORIES} in config.
 */

export type CategoryAccent = 'cyan' | 'violet' | 'fuchsia'

export interface BusinessSubType {
  id: string
  /** Full i18n path, e.g. createBusiness.type.cafe */
  i18nKey: string
}

export interface BusinessCategoryConfig {
  id: string
  /** Full i18n path, e.g. createBusiness.category.culinary */
  i18nKey: string
  /** Lucide React icon component name (PascalCase) */
  iconName: string
  accent: CategoryAccent
  subTypes: BusinessSubType[]
}

export type LicenseTypeId = 'authorized_dealer' | 'ltd'

export interface WizardStep1State {
  categoryId: string | null
  subTypeId: string | null
  budgetNis: number
  cityId: string | null
  licenseType: LicenseTypeId | null
}

/** Persisted between wizard steps (sessionStorage). */
export interface WizardStep1Persisted {
  categoryId: string
  subTypeId: string
  budgetNis: number
  cityId: string
  licenseType: LicenseTypeId
}

/** Genesis analysis metrics for Step 2, keyed by categoryId:subTypeId. */
export interface BusinessAnalysisProfile {
  minSetupCapitalNis: number
  recommendedEmployees: number
  expectedMonthlyRevenueNis: number
}

/**
 * Resolved copy for Step 4 (from i18n bundle prefix + t()).
 * Populated by {@link getLocationInsightBundlePrefix} + lookups.
 */
export interface LocationInsightContent {
  primaryLocation: string
  alternativeLocation: string
  rationale: string[]
  advantages: string[]
  challenges: string[]
}

/** POST body for final wizard registration (user + business profile). */
export interface BusinessRegistrationPayload {
  user: {
    fullName: string
    email: string
    username: string
    phone: string
    password: string
  }
  business: {
    categoryId: string
    subTypeId: string
    cityId: string
    budgetNis: number
    licenseType: string
    recommendedEmployees: number
    expectedMonthlyRevenueNis: number
    recommendedLocation: string
    alternativeLocation: string
  }
}
