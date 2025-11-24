import type { Environment, EnvironmentConfig } from './types'
import { localDevConfig } from './local'
import { developmentConfig } from './development'
import { productionConfig } from './production'

function validateEnvironment(env: string | undefined): Environment {
  // Temporary fix: Default to 'local-dev' if VITE_ENVIRONMENT is not set
  if (!env) {
    console.warn(
      'VITE_ENVIRONMENT is not set. Defaulting to "local-dev". Please create a .env file with VITE_ENVIRONMENT=local-dev'
    )
    env = 'local-dev'
  }

  const validEnvironments: Environment[] = ['local-dev', 'development', 'production']

  if (!validEnvironments.includes(env as Environment)) {
    throw new Error(
      `Invalid VITE_ENVIRONMENT: "${env}". Valid values: ${validEnvironments.join(', ')}`
    )
  }

  return env as Environment
}

function loadEnvironmentConfig(environment: Environment): EnvironmentConfig {
  const configMap: Record<Environment, EnvironmentConfig> = {
    'local-dev': localDevConfig,
    development: developmentConfig,
    production: productionConfig,
  }

  return configMap[environment]
}

function validateConfig(config: EnvironmentConfig): void {
  const requiredFields = [
    'environment',
    'apiBaseUrl',
    'frontendUrl',
    'supabase.url',
    'supabase.anonKey',
  ]

  for (const field of requiredFields) {
    const keys = field.split('.')
    let value: any = config

    for (const key of keys) {
      value = value?.[key]
    }

    if (!value) {
      throw new Error(`Missing required field "${field}" in ${config.environment} config`)
    }
  }
}

let _config: EnvironmentConfig | null = null

function initializeConfig(): EnvironmentConfig {
  if (_config) return _config

  const environment = validateEnvironment(import.meta.env.VITE_ENVIRONMENT)

  const config = loadEnvironmentConfig(environment)
  validateConfig(config)

  if (config.features.debug) {
    console.log('Environment:', config.environment)
    console.log('API:', config.apiBaseUrl)
    console.log('Frontend:', config.frontendUrl)
  }

  _config = config
  return config
}

// Lazy initialization - only runs when first accessed
export const config = new Proxy({} as EnvironmentConfig, {
  get(_target, prop) {
    const actualConfig = initializeConfig()
    return actualConfig[prop as keyof EnvironmentConfig]
  },
  ownKeys() {
    const actualConfig = initializeConfig()
    return Object.keys(actualConfig)
  },
  has(_target, prop) {
    const actualConfig = initializeConfig()
    return prop in actualConfig
  },
  getOwnPropertyDescriptor(_target, prop) {
    const actualConfig = initializeConfig()
    return Object.getOwnPropertyDescriptor(actualConfig, prop)
  },
})

export const isLocalDev = config.environment === 'local-dev'
export const isDevelopment = config.environment === 'development'
export const isProduction = config.environment === 'production'
export const isNonProduction = isLocalDev || isDevelopment

export const urlBuilder = {
  publicRoadmap: (subdomain?: string, publicSlug?: string): string | null => {
    if (subdomain) return `${config.frontendUrl}/public/r/${subdomain}`
    if (publicSlug) return `${config.frontendUrl}/public/roadmap/${publicSlug}`
    return null
  },

  frontend: (path: string): string => `${config.frontendUrl}${path}`,
}

export type { Environment, EnvironmentConfig, SupabaseConfig, FeatureFlags } from './types'
