import { getBusinessAnalysisProfile } from '../config/businessAnalysisProfiles'
import { getLocationInsightBundlePrefix } from '../config/locationInsightBundles'
import { readWizardStep1OrNull } from '../wizard/createBusinessWizardStorage'
import type { DashboardBusinessProfile } from './dashboardBusinessProfileStorage'
import { loadDashboardBusinessProfile } from './dashboardBusinessProfileStorage'
import type { PersistedGenesisBusiness } from './genesisBusinessStorage'

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

/**
 * When a business is selected via “Manage business”, KPI inputs follow that business’s API snapshot
 * while keeping category/city copy from the saved wizard profile when present.
 */
export function loadEffectiveBusinessProfileWithActive(
  t: (key: string) => string,
  activeRow: PersistedGenesisBusiness | null,
): DashboardBusinessProfile {
  const base = loadEffectiveBusinessProfile(t)
  if (!activeRow) return base
  const { api, licenseType } = activeRow
  const total = api.total_budget_ils ?? 0
  const available = api.available_budget_ils ?? 0
  const budgetNis =
    total > 0 ? total : available > 0 ? available : Math.max(base.budgetNis, 1)
  const monthly = api.monthly_cost_ils ?? 0
  const revenueBoost =
    monthly > 0
      ? Math.max(base.expectedMonthlyRevenueNis, Math.round(monthly * 4))
      : base.expectedMonthlyRevenueNis
  const agents = Math.max(base.recommendedEmployees, Math.max(1, api.active_agents_count ?? 0))
  const prefix = getLocationInsightBundlePrefix(base.cityId, base.categoryId)
  return {
    ...base,
    budgetNis,
    licenseType,
    recommendedEmployees: agents,
    expectedMonthlyRevenueNis: revenueBoost,
    recommendedLocation: t(`${prefix}.primary_location`),
    alternativeLocation: t(`${prefix}.alternative_location`),
  }
}
