/** Backend JWT custom claim; defaults to entrepreneur when missing (see FIREBASE_INTEGRATION.md). */
export type GenesisJwtRole = 'superAdmin' | 'admin' | 'operator' | 'entrepreneur' | 'user'

/** Collapsed UI bucket: Admin vs User (i18n: `roles.admin` / `roles.user`). */
export type DisplayRoleBucket = 'admin' | 'user'

export function jwtRoleToDisplayBucket(role: GenesisJwtRole): DisplayRoleBucket {
  if (role === 'superAdmin' || role === 'admin' || role === 'operator') return 'admin'
  return 'user'
}

/**
 * Maps platform/org API role strings to the same two UI buckets (owner → admin, member → user).
 */
export function roleStringToDisplayBucket(role: string | null | undefined): DisplayRoleBucket {
  const r = String(role ?? '').trim().toLowerCase()
  if (r === 'owner' || r === 'admin' || r === 'superadmin' || r === 'super_admin' || r === 'operator') return 'admin'
  return 'user'
}

export function roleClaimFromJwt(claims: Record<string, unknown> | undefined): GenesisJwtRole {
  const r = claims && typeof claims.role === 'string' ? claims.role.trim().toLowerCase() : ''
  if (r === 'superadmin' || r === 'super_admin') return 'superAdmin'
  if (r === 'admin') return 'admin'
  if (r === 'operator') return 'operator'
  if (r === 'entrepreneur') return 'entrepreneur'
  if (r === 'user') return 'user'
  return 'entrepreneur'
}

/** Admin console UI: operators and platform admins can open the operations console (per backend permissions map). */
export function isConsoleStaffRole(claims: Record<string, unknown> | undefined): boolean {
  const r = roleClaimFromJwt(claims)
  return r === 'superAdmin' || r === 'admin' || r === 'operator'
}

export function displayRoleLabel(role: GenesisJwtRole): string {
  return jwtRoleToDisplayBucket(role) === 'admin' ? 'Admin' : 'User'
}
