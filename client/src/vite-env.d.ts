/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENVIRONMENT: 'local' | 'development' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
