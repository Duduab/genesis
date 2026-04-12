import type { LicenseTypeId } from '../types/business'
import type { GenesisBusinessApiData } from '../types/genesisBusiness'

export const GENESIS_SAVED_BUSINESSES_STORAGE_KEY = 'genesis-saved-businesses'
const STORAGE_KEY = GENESIS_SAVED_BUSINESSES_STORAGE_KEY
export const GENESIS_BUSINESSES_UPDATED_EVENT = 'genesis-businesses-updated'

export interface PersistedGenesisBusiness {
  businessId: string
  savedAt: string
  api: GenesisBusinessApiData
  /** From wizard at creation; used for entity type + dashboard profile. */
  licenseType: LicenseTypeId
}

function isLicenseType(v: unknown): v is LicenseTypeId {
  return v === 'authorized_dealer' || v === 'ltd'
}

function isApiData(v: unknown): v is GenesisBusinessApiData {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return (
    typeof o.business_id === 'string' &&
    typeof o.business_type === 'string' &&
    typeof o.global_status === 'string' &&
    typeof o.entrepreneur_name === 'string' &&
    Array.isArray(o.stages)
  )
}

function notifyUpdated(): void {
  try {
    window.dispatchEvent(new CustomEvent(GENESIS_BUSINESSES_UPDATED_EVENT))
  } catch {
    /* ignore */
  }
}

export function loadPersistedGenesisBusinesses(): PersistedGenesisBusiness[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const out: PersistedGenesisBusiness[] = []
    for (const row of parsed) {
      if (!row || typeof row !== 'object') continue
      const r = row as Record<string, unknown>
      if (typeof r.businessId !== 'string' || typeof r.savedAt !== 'string') continue
      if (!isApiData(r.api)) continue
      if (!isLicenseType(r.licenseType)) continue
      out.push({
        businessId: r.businessId,
        savedAt: r.savedAt,
        api: r.api,
        licenseType: r.licenseType,
      })
    }
    return out.sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))
  } catch {
    return []
  }
}

export function upsertPersistedGenesisBusiness(
  api: GenesisBusinessApiData,
  licenseType: LicenseTypeId,
): void {
  const id = api.business_id
  if (!id) return
  const list = loadPersistedGenesisBusinesses().filter((b) => b.businessId !== id)
  list.unshift({
    businessId: id,
    savedAt: new Date().toISOString(),
    api,
    licenseType,
  })
  const trimmed = list.slice(0, 50)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    notifyUpdated()
  } catch {
    /* ignore */
  }
}

export function removePersistedGenesisBusiness(businessId: string): void {
  const id = businessId.trim()
  if (!id) return
  const list = loadPersistedGenesisBusinesses().filter((b) => b.businessId !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    notifyUpdated()
  } catch {
    /* ignore */
  }
}
