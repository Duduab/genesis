import type { BusinessRegistrationPayload } from '../types/business'

export type DashboardBusinessProfile = BusinessRegistrationPayload['business']

const STORAGE_KEY = 'genesis-dashboard-business-profile'

export function saveDashboardBusinessProfile(business: DashboardBusinessProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(business))
  } catch {
    /* ignore */
  }
}

export function loadDashboardBusinessProfile(): DashboardBusinessProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<DashboardBusinessProfile>
    if (
      typeof p.categoryId === 'string' &&
      typeof p.subTypeId === 'string' &&
      typeof p.cityId === 'string' &&
      typeof p.budgetNis === 'number' &&
      typeof p.licenseType === 'string' &&
      typeof p.recommendedEmployees === 'number' &&
      typeof p.expectedMonthlyRevenueNis === 'number' &&
      typeof p.recommendedLocation === 'string' &&
      typeof p.alternativeLocation === 'string'
    ) {
      return {
        categoryId: p.categoryId,
        subTypeId: p.subTypeId,
        cityId: p.cityId,
        budgetNis: p.budgetNis,
        licenseType: p.licenseType,
        recommendedEmployees: p.recommendedEmployees,
        expectedMonthlyRevenueNis: p.expectedMonthlyRevenueNis,
        recommendedLocation: p.recommendedLocation,
        alternativeLocation: p.alternativeLocation,
      }
    }
  } catch {
    /* ignore */
  }
  return null
}
