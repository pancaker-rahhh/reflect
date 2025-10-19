export type Environment = 'local-dev' | 'development' | 'production'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

export interface FeatureFlags {
  debug: boolean
  analytics: boolean
  mockData: boolean
  verboseErrors: boolean
}

export interface EnvironmentConfig {
  environment: Environment
  apiBaseUrl: string
  frontendUrl: string
  supabase: SupabaseConfig
  features: FeatureFlags
}
