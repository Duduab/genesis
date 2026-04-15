/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Override default staging API origin. */
  readonly VITE_GENESIS_API_BASE_URL?: string
  /** Dev/staging token (e.g. dev-entrepreneur-user1). Production: use Firebase JWT via configureGenesisApi. */
  readonly VITE_GENESIS_API_BEARER_TOKEN?: string
  /** Admin token for `/admin` APIs; in dev, code falls back to `dev-admin-test` when unset. */
  readonly VITE_GENESIS_ADMIN_BEARER_TOKEN?: string
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  /** When true, show legacy demo rows in Mission Control (default off). */
  readonly VITE_GENESIS_SHOW_DEMO_UI?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
