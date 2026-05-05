export const GENESIS_ACTIVE_ORGANIZATION_ID_KEY = 'genesis-active-organization-id'
export const GENESIS_ACTIVE_ORGANIZATION_CHANGED_EVENT = 'genesis-active-organization-changed'


function notify(): void {
  try {
    window.dispatchEvent(new CustomEvent(GENESIS_ACTIVE_ORGANIZATION_CHANGED_EVENT))
  } catch {
    /* ignore */
  }
}

export function readActiveOrganizationId(): string | null {
  try {
    const v = localStorage.getItem(GENESIS_ACTIVE_ORGANIZATION_ID_KEY)
    return v && v.trim() ? v.trim() : null
  } catch {
    return null
  }
}

export function writeActiveOrganizationId(organizationId: string | null): void {
  try {
    if (organizationId == null || organizationId === '') {
      localStorage.removeItem(GENESIS_ACTIVE_ORGANIZATION_ID_KEY)
    } else {
      localStorage.setItem(GENESIS_ACTIVE_ORGANIZATION_ID_KEY, organizationId)
    }
    notify()
  } catch {
    /* ignore */
  }
}
