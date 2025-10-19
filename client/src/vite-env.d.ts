/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENVIRONMENT: 'local-dev' | 'development' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
