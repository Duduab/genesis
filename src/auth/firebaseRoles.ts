/** Backend JWT custom claim; defaults to entrepreneur when missing (see FIREBASE_INTEGRATION.md). */
export type GenesisJwtRole = 'admin' | 'operator' | 'entrepreneur'

export function roleClaimFromJwt(claims: Record<string, unknown> | undefined): GenesisJwtRole {
  const r = claims && typeof claims.role === 'string' ? claims.role.trim().toLowerCase() : ''
  if (r === 'admin' || r === 'operator' || r === 'entrepreneur') return r
  return 'entrepreneur'
}

/** Admin console UI: operators and admins can open the operations console (per backend permissions map). */
export function isConsoleStaffRole(claims: Record<string, unknown> | undefined): boolean {
  const r = roleClaimFromJwt(claims)
  return r === 'admin' || r === 'operator'
}

export function displayRoleLabel(role: GenesisJwtRole): string {
  if (role === 'admin') return 'Administrator'
  if (role === 'operator') return 'Operator'
  return 'Entrepreneur'
}
