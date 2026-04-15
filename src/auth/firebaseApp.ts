import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirebaseWebConfig } from '../config/genesisEnv'

let app: FirebaseApp | null = null

export function getGenesisFirebaseApp(): FirebaseApp | null {
  const cfg = getFirebaseWebConfig()
  if (!cfg) return null
  if (!app) {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(cfg)
  }
  return app
}

export function getGenesisFirebaseAuth(): Auth | null {
  const a = getGenesisFirebaseApp()
  return a ? getAuth(a) : null
}
