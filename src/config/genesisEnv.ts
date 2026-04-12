/**
 * Genesis API and Firebase web config (env). See `.env.example`.
 *
 * Default API origin is staging Cloud Run. Override with `VITE_GENESIS_API_BASE_URL` for another environment.
 * The browser calls this origin directly; the API must allow your frontend origin (CORS).
 */

const DEFAULT_GENESIS_API_BASE_URL = 'https://genesis-api-242231160010.me-west1.run.app'

/** Staging dev token from backend guide (entrepreneur role). Override via env in production. */
const DEV_FALLBACK_BEARER_TOKEN = 'dev-entrepreneur-user1'

export function getGenesisApiBaseUrl(): string {
  const raw = import.meta.env.VITE_GENESIS_API_BASE_URL
  const fromEnv = typeof raw === 'string' ? raw.trim().replace(/\/$/, '') : ''
  return fromEnv || DEFAULT_GENESIS_API_BASE_URL
}

export function getGenesisApiBearerToken(): string {
  const raw = import.meta.env.VITE_GENESIS_API_BEARER_TOKEN
  const fromEnv = typeof raw === 'string' ? raw.trim() : ''
  if (fromEnv) return fromEnv
  if (import.meta.env.DEV) return DEV_FALLBACK_BEARER_TOKEN
  return ''
}

export function getFirebaseWebConfig(): {
  apiKey: string
  authDomain: string
  projectId: string
} | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim()
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim()
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim()
  if (!apiKey || !authDomain || !projectId) return null
  return { apiKey, authDomain, projectId }
}
