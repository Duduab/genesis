import type { BusinessCategoryConfig } from '../types/business'

/**
 * Single source of truth for business categories and sub-types.
 * To add e.g. "Services", append one object — UI and i18n keys must exist.
 */
export const BUSINESS_CATEGORIES: BusinessCategoryConfig[] = [
  {
    id: 'culinary',
    i18nKey: 'createBusiness.category.culinary',
    iconName: 'UtensilsCrossed',
    accent: 'cyan',
    subTypes: [
      { id: 'cafe', i18nKey: 'createBusiness.type.cafe' },
      { id: 'restaurant', i18nKey: 'createBusiness.type.restaurant' },
      { id: 'bakery', i18nKey: 'createBusiness.type.bakery' },
      { id: 'catering', i18nKey: 'createBusiness.type.catering' },
      { id: 'bar', i18nKey: 'createBusiness.type.bar' },
      { id: 'delicatessen', i18nKey: 'createBusiness.type.delicatessen' },
    ],
  },
  {
    id: 'retail',
    i18nKey: 'createBusiness.category.retail',
    iconName: 'ShoppingBag',
    accent: 'violet',
    subTypes: [
      { id: 'electronics', i18nKey: 'createBusiness.type.electronics' },
      { id: 'supermarket', i18nKey: 'createBusiness.type.supermarket' },
      { id: 'fashion', i18nKey: 'createBusiness.type.fashion' },
      { id: 'pharmacy', i18nKey: 'createBusiness.type.pharmacy' },
      { id: 'convenience', i18nKey: 'createBusiness.type.convenience' },
    ],
  },
  {
    id: 'services',
    i18nKey: 'createBusiness.category.services',
    iconName: 'Briefcase',
    accent: 'fuchsia',
    subTypes: [
      { id: 'consulting', i18nKey: 'createBusiness.type.consulting' },
      { id: 'beauty', i18nKey: 'createBusiness.type.beauty' },
      { id: 'fitness', i18nKey: 'createBusiness.type.fitness' },
    ],
  },
]

export const BUDGET_MIN_NIS = 200_000
export const BUDGET_MAX_NIS = 1_000_000
export const BUDGET_STEP_NIS = 50_000

export const CITY_IDS = ['jerusalem', 'telAviv', 'haifa', 'beerSheva'] as const
export type CityId = (typeof CITY_IDS)[number]
