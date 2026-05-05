import type { OrganizationSummary } from '../types/organization'

/** Newest first — matches organization picker ordering in the product UI. */
export function sortOrganizationsByNewest(organizations: readonly OrganizationSummary[]): OrganizationSummary[] {
  return [...organizations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

/** First organization after newest-first sort (primary tenant for legacy rows). */
export function primaryOrganizationId(organizations: readonly OrganizationSummary[]): string | null {
  const s = sortOrganizationsByNewest(organizations)
  const id = s[0]?.organization_id?.trim()
  return id || null
}

/**
 * Whether a business belongs to the active organization scope.
 * Rows without `organization_id` (legacy) are shown only under the primary org.
 */
export function businessBelongsToOrganizationScope(
  businessOrganizationId: string | null | undefined,
  activeOrganizationId: string | null | undefined,
  legacyFallbackOrganizationId: string | null | undefined,
): boolean {
  const active = typeof activeOrganizationId === 'string' ? activeOrganizationId.trim() : ''
  if (!active) return false

  const oid = typeof businessOrganizationId === 'string' ? businessOrganizationId.trim() : ''
  if (oid) return oid === active

  const legacy = typeof legacyFallbackOrganizationId === 'string' ? legacyFallbackOrganizationId.trim() : ''
  return legacy.length > 0 && legacy === active
}

/** Firebase JWT `role` claim: platform super-admin (legacy `admin` accepted during rollout). */
export function isJwtPlatformSuperAdmin(claims: Record<string, unknown> | undefined): boolean {
  const r = claims && typeof claims.role === 'string' ? claims.role.trim().toLowerCase() : ''
  return r === 'superadmin' || r === 'super_admin' || r === 'admin'
}

export function organizationRoleForBusiness(
  businessOrganizationId: string | null | undefined,
  organizations: readonly OrganizationSummary[],
): 'owner' | 'member' | null {
  const fromBusiness = typeof businessOrganizationId === 'string' ? businessOrganizationId.trim() : ''
  const resolved = fromBusiness || primaryOrganizationId(organizations) || ''
  if (!resolved) return null
  const row = organizations.find((o) => o.organization_id === resolved)
  const role = String(row?.role ?? '')
    .trim()
    .toLowerCase()
  if (role === 'owner') return 'owner'
  if (role === 'member') return 'member'
  return null
}

/**
 * Whether destructive / mutating business actions should be shown (owner or platform super-admin).
 * Members get read-only UX for business cards and detail actions.
 */
export function canWriteOrganizationBusiness(
  businessOrganizationId: string | null | undefined,
  organizations: readonly OrganizationSummary[],
  claims: Record<string, unknown> | undefined,
): boolean {
  if (isJwtPlatformSuperAdmin(claims)) return true
  return organizationRoleForBusiness(businessOrganizationId, organizations) === 'owner'
}

export type HeaderOrgBadgeVariant = 'loading' | 'systemAdmin' | 'orgOwner' | 'orgMember' | 'plainUser'

export function resolveHeaderOrgBadgeVariant(params: {
  claims: Record<string, unknown> | undefined
  organizations: readonly OrganizationSummary[]
  orgsLoading: boolean
}): HeaderOrgBadgeVariant {
  if (params.orgsLoading) return 'loading'
  if (isJwtPlatformSuperAdmin(params.claims)) return 'systemAdmin'
  const roles = params.organizations.map((o) => String(o.role ?? '').trim().toLowerCase())
  if (roles.some((r) => r === 'owner')) return 'orgOwner'
  if (params.organizations.length > 0) return 'orgMember'
  return 'plainUser'
}
