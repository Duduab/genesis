import type { BusinessAnalysisProfile } from '../types/business'

const DEFAULT_PROFILE: BusinessAnalysisProfile = {
  minSetupCapitalNis: 120_000,
  recommendedEmployees: 2,
  expectedMonthlyRevenueNis: 25_000,
}

/**
 * Minimum setup capital and plan metrics per `categoryId:subTypeId`.
 * Add a row when you add a new sub-type, or the default is used.
 */
const BY_KEY: Record<string, BusinessAnalysisProfile> = {
  'culinary:cafe': { minSetupCapitalNis: 180_000, recommendedEmployees: 2, expectedMonthlyRevenueNis: 22_000 },
  'culinary:restaurant': { minSetupCapitalNis: 400_000, recommendedEmployees: 8, expectedMonthlyRevenueNis: 120_000 },
  'culinary:bakery': { minSetupCapitalNis: 120_000, recommendedEmployees: 2, expectedMonthlyRevenueNis: 18_000 },
  'culinary:catering': { minSetupCapitalNis: 100_000, recommendedEmployees: 3, expectedMonthlyRevenueNis: 35_000 },
  'culinary:bar': { minSetupCapitalNis: 250_000, recommendedEmployees: 4, expectedMonthlyRevenueNis: 45_000 },
  'culinary:delicatessen': { minSetupCapitalNis: 150_000, recommendedEmployees: 3, expectedMonthlyRevenueNis: 30_000 },
  'retail:electronics': { minSetupCapitalNis: 200_000, recommendedEmployees: 2, expectedMonthlyRevenueNis: 40_000 },
  'retail:supermarket': { minSetupCapitalNis: 500_000, recommendedEmployees: 12, expectedMonthlyRevenueNis: 200_000 },
  'retail:fashion': { minSetupCapitalNis: 150_000, recommendedEmployees: 3, expectedMonthlyRevenueNis: 28_000 },
  'retail:pharmacy': { minSetupCapitalNis: 350_000, recommendedEmployees: 4, expectedMonthlyRevenueNis: 55_000 },
  'retail:convenience': { minSetupCapitalNis: 130_000, recommendedEmployees: 2, expectedMonthlyRevenueNis: 24_000 },
  'services:consulting': { minSetupCapitalNis: 40_000, recommendedEmployees: 1, expectedMonthlyRevenueNis: 45_000 },
  'services:beauty': { minSetupCapitalNis: 90_000, recommendedEmployees: 2, expectedMonthlyRevenueNis: 20_000 },
  'services:fitness': { minSetupCapitalNis: 220_000, recommendedEmployees: 4, expectedMonthlyRevenueNis: 32_000 },
}

export function getBusinessAnalysisProfile(categoryId: string, subTypeId: string): BusinessAnalysisProfile {
  const key = `${categoryId}:${subTypeId}`
  return BY_KEY[key] ?? DEFAULT_PROFILE
}

export function budgetMeetsMinimum(budgetNis: number, profile: BusinessAnalysisProfile): boolean {
  return budgetNis >= profile.minSetupCapitalNis
}
