import { APP_VERSION } from '../generated/appVersion'

export { APP_VERSION }

/** Display label, e.g. `1.0.1` → `V1.0.1` */
export function formatAppVersionLabel(version = APP_VERSION) {
  const v = String(version || '').trim()
  if (!v) return 'V0.0.0'
  return /^v/i.test(v) ? `V${v.slice(1)}` : `V${v}`
}
