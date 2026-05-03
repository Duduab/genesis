import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirebaseWebConfig } from '../config/genesisEnv'

let app: FirebaseApp | null = null
let warnedMissingConfig = false

export function getGenesisFirebaseApp(): FirebaseApp | null {
  const cfg = getFirebaseWebConfig()
  if (!cfg) {
    // Loud, one-time warning so a broken deploy is visible in DevTools
    // without having to fill out a form first. See `.env.production`.
    if (!warnedMissingConfig && typeof console !== 'undefined') {
      warnedMissingConfig = true
      console.warn(
        '[genesis] Firebase Web SDK config missing — VITE_FIREBASE_API_KEY / VITE_FIREBASE_AUTH_DOMAIN / VITE_FIREBASE_PROJECT_ID were not present at `vite build`. Auth, registration, and authenticated API calls will not work. Check `.env.production` and rebuild.',
      )
    }
    return null
  }
  if (!app) {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(cfg)
  }
  return app
}

export function getGenesisFirebaseAuth(): Auth | null {
  const a = getGenesisFirebaseApp()
  return a ? getAuth(a) : null
}
