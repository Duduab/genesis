/**
 * Machine codes returned by the Genesis API (problem JSON `code` or body `code`).
 * @see docs or backend contract for meanings.
 */
export const GENESIS_API_ERROR_CODES = [
  'auth_token_missing',
  'auth_token_invalid',
  'auth_insufficient_role',
  'business_not_found',
  'stage_not_found',
  'document_not_found',
  'activity_not_found',
  'validation_failed',
  'rate_limit_exceeded',
  'upload_failed',
  'service_unavailable',
] as const

export type GenesisApiErrorCode = (typeof GENESIS_API_ERROR_CODES)[number]

/** i18n path under `apiErrors.*` (camelCase segment keys). */
export const GENESIS_API_ERROR_CODE_I18N_KEYS: Record<GenesisApiErrorCode, string> = {
  auth_token_missing: 'apiErrors.authTokenMissing',
  auth_token_invalid: 'apiErrors.authTokenInvalid',
  auth_insufficient_role: 'apiErrors.authInsufficientRole',
  business_not_found: 'apiErrors.businessNotFound',
  stage_not_found: 'apiErrors.stageNotFound',
  document_not_found: 'apiErrors.documentNotFound',
  activity_not_found: 'apiErrors.activityNotFound',
  validation_failed: 'apiErrors.validationFailed',
  rate_limit_exceeded: 'apiErrors.rateLimitExceeded',
  upload_failed: 'apiErrors.uploadFailed',
  service_unavailable: 'apiErrors.serviceUnavailable',
}

export function isGenesisApiErrorCode(raw: string | null | undefined): raw is GenesisApiErrorCode {
  return Boolean(raw && (GENESIS_API_ERROR_CODES as readonly string[]).includes(raw))
}

export function genesisApiErrorI18nKey(code: string | null | undefined): string | null {
  if (!code) return null
  return isGenesisApiErrorCode(code) ? GENESIS_API_ERROR_CODE_I18N_KEYS[code] : null
}
