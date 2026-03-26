import { getBusinessAnalysisProfile } from '../config/businessAnalysisProfiles'
import { getLocationInsightBundlePrefix } from '../config/locationInsightBundles'
import { readWizardStep1OrNull } from '../wizard/createBusinessWizardStorage'
import type { DashboardBusinessProfile } from './dashboardBusinessProfileStorage'
import { loadDashboardBusinessProfile } from './dashboardBusinessProfileStorage'

/**
 * Saved profile after registration, else in-progress wizard, else localized demo defaults.
 */
export function loadEffectiveBusinessProfile(t: (key: string) => string): DashboardBusinessProfile {
  const saved = loadDashboardBusinessProfile()
  if (saved) return saved

  const w = readWizardStep1OrNull()
  if (w) {
    const p = getBusinessAnalysisProfile(w.categoryId, w.subTypeId)
    const prefix = getLocationInsightBundlePrefix(w.cityId, w.categoryId)
    return {
      categoryId: w.categoryId,
      subTypeId: w.subTypeId,
      cityId: w.cityId,
      budgetNis: w.budgetNis,
      licenseType: w.licenseType,
      recommendedEmployees: p.recommendedEmployees,
      expectedMonthlyRevenueNis: p.expectedMonthlyRevenueNis,
      recommendedLocation: t(`${prefix}.primary_location`),
      alternativeLocation: t(`${prefix}.alternative_location`),
    }
  }

  const prefix = 'createBusiness.step4.bundles.telAviv_culinary'
  return {
    categoryId: 'culinary',
    subTypeId: 'delicatessen',
    cityId: 'telAviv',
    budgetNis: 300_000,
    licenseType: 'authorized_dealer',
    recommendedEmployees: 3,
    expectedMonthlyRevenueNis: 30_000,
    recommendedLocation: t(`${prefix}.primary_location`),
    alternativeLocation: t(`${prefix}.alternative_location`),
  }
}
