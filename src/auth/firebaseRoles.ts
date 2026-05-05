/** Backend JWT custom claim; defaults to entrepreneur when missing (see FIREBASE_INTEGRATION.md). */
export type GenesisJwtRole = 'superAdmin' | 'admin' | 'operator' | 'entrepreneur' | 'user'

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
  if (role === 'superAdmin' || role === 'admin') return 'Administrator'
  if (role === 'operator') return 'Operator'
  if (role === 'user') return 'User'
  return 'Entrepreneur'
}
