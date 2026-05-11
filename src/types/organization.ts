/** GET `/api/v1/organizations` — one row per organization the user belongs to. */

export type OrganizationType = 'workspace' | 'chain' | 'franchise' | string

export type OrganizationMembershipRole = 'owner' | 'member' | string

export interface OrganizationSummary {
  organization_id: string
  name: string
  /** URL segment for `/orgs/:slug/...` (e.g. `asaf-arviv`). */
  slug?: string | null
  organization_type: OrganizationType
  created_at: string
  /** Present when the list includes the caller's membership role (backend contract). */
  role?: OrganizationMembershipRole | null
  member_count?: number | null
}

export interface OrganizationMemberRow {
  user_id: string
  role: OrganizationMembershipRole
  invited_email: string | null
  accepted_at: string | null
  created_at: string
}
