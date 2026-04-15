import { getGenesisAdminApiBearerToken } from '../../config/genesisEnv'
import { resolveGenesisBearerToken } from './client'

/**
 * Prefer explicit admin token ({@link getGenesisAdminApiBearerToken} — includes dev default `dev-admin-test`),
 * else Firebase / tenant env token for rare cases where an admin JWT is provided there.
 */
export async function resolveAdminPanelApiBearerToken(): Promise<string | null> {
  const admin = getGenesisAdminApiBearerToken()
  if (admin) return admin
  return resolveGenesisBearerToken()
}
