import type { OrganizationSummary } from '../types/organization'

/** Firebase JWT `role` claim: platform super-admin (legacy `admin` accepted during rollout). */
export function isJwtPlatformSuperAdmin(claims: Record<string, unknown> | undefined): boolean {
  const r = claims && typeof claims.role === 'string' ? claims.role.trim().toLowerCase() : ''
  return r === 'superadmin' || r === 'super_admin' || r === 'admin'
}

export function organizationRoleForBusiness(
  businessOrganizationId: string | null | undefined,
  organizations: readonly OrganizationSummary[],
): 'owner' | 'member' | null {
  if (!businessOrganizationId?.trim()) return null
  const id = businessOrganizationId.trim()
  const row = organizations.find((o) => o.organization_id === id)
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
