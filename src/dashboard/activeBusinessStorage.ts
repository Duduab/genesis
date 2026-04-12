export const GENESIS_ACTIVE_BUSINESS_ID_KEY = 'genesis-active-business-id'
export const GENESIS_ACTIVE_BUSINESS_CHANGED_EVENT = 'genesis-active-business-changed'

function notify(): void {
  try {
    window.dispatchEvent(new CustomEvent(GENESIS_ACTIVE_BUSINESS_CHANGED_EVENT))
  } catch {
    /* ignore */
  }
}

export function readActiveBusinessId(): string | null {
  try {
    const v = localStorage.getItem(GENESIS_ACTIVE_BUSINESS_ID_KEY)
    return v && v.trim() ? v.trim() : null
  } catch {
    return null
  }
}

export function writeActiveBusinessId(businessId: string | null): void {
  try {
    if (businessId == null || businessId === '') {
      localStorage.removeItem(GENESIS_ACTIVE_BUSINESS_ID_KEY)
    } else {
      localStorage.setItem(GENESIS_ACTIVE_BUSINESS_ID_KEY, businessId)
    }
    notify()
  } catch {
    /* ignore */
  }
}
