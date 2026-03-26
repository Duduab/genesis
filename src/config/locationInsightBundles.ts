/**
 * Maps wizard context (city + business category) to an i18n bundle id under
 * `createBusiness.step4.bundles.<id>` for AI-style location insights.
 */
const BUNDLE_BY_CITY_CATEGORY = new Map<string, string>([
  ['telAviv:culinary', 'telAviv_culinary'],
  ['jerusalem:culinary', 'default'],
  ['haifa:culinary', 'default'],
  ['beerSheva:culinary', 'default'],
  ['telAviv:retail', 'default'],
  ['telAviv:services', 'default'],
])

export const DEFAULT_LOCATION_BUNDLE_ID = 'default'

export function getLocationInsightBundleId(cityId: string, categoryId: string): string {
  return BUNDLE_BY_CITY_CATEGORY.get(`${cityId}:${categoryId}`) ?? DEFAULT_LOCATION_BUNDLE_ID
}

/** Full i18n prefix for bundle fields, e.g. createBusiness.step4.bundles.telAviv_culinary */
export function getLocationInsightBundlePrefix(cityId: string, categoryId: string): string {
  const id = getLocationInsightBundleId(cityId, categoryId)
  return `createBusiness.step4.bundles.${id}`
}

export const RATIONALE_COUNT = 3
export const ADVANTAGE_COUNT = 3
export const CHALLENGE_COUNT = 2
