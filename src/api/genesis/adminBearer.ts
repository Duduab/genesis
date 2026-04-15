import { getGenesisAdminApiBearerToken } from '../../config/genesisEnv'
import { resolveGenesisBearerToken } from './client'

/** Prefer `VITE_GENESIS_ADMIN_BEARER_TOKEN`, else Firebase / `VITE_GENESIS_API_BEARER_TOKEN` (dev fallback). */
export async function resolveAdminPanelApiBearerToken(): Promise<string | null> {
  const admin = getGenesisAdminApiBearerToken()
  if (admin) return admin
  return resolveGenesisBearerToken()
}
