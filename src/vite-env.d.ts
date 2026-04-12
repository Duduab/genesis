/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Override default staging API origin. */
  readonly VITE_GENESIS_API_BASE_URL?: string
  /** Dev/staging token only (e.g. dev-admin-test). Production: use Firebase JWT via configureGenesisApi. */
  readonly VITE_GENESIS_API_BEARER_TOKEN?: string
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
