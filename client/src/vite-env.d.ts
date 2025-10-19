/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Current environment: local, development, or production */
  readonly VITE_ENVIRONMENT: 'local' | 'development' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
