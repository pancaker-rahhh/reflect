import type { Environment, EnvironmentConfig } from './types'
import { localDevConfig } from './local'
import { developmentConfig } from './development'
import { productionConfig } from './production'

function validateEnvironment(env: string | undefined): asserts env is Environment {
  if (!env) {
    throw new Error(
      'VITE_ENVIRONMENT is not set. Please create a .env file with VITE_ENVIRONMENT=local-dev'
    )
  }

  const validEnvironments: Environment[] = ['local-dev', 'development', 'production']
  
  if (!validEnvironments.includes(env as Environment)) {
    throw new Error(
      `Invalid VITE_ENVIRONMENT: "${env}". Valid values: ${validEnvironments.join(', ')}`
    )
  }
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
      throw new Error(
        `Missing required field "${field}" in ${config.environment} config`
      )
    }
  }
}

function initializeConfig(): EnvironmentConfig {
  const environment = import.meta.env.VITE_ENVIRONMENT
  validateEnvironment(environment)
  
  const config = loadEnvironmentConfig(environment)
  validateConfig(config)

  if (config.features.debug) {
    console.log('Environment:', config.environment)
    console.log('API:', config.apiBaseUrl)
    console.log('Frontend:', config.frontendUrl)
  }
  
  return config
}

export const config = initializeConfig()

export const isLocalDev = config.environment === 'local-dev'
export const isDevelopment = config.environment === 'development'
export const isProduction = config.environment === 'production'
export const isNonProduction = isLocalDev || isDevelopment

export const urlBuilder = {
  publicRoadmap: (subdomain?: string, publicSlug?: string): string => {
    if (subdomain) return `${config.frontendUrl}/public/r/${subdomain}`
    if (publicSlug) return `${config.frontendUrl}/public/roadmap/${publicSlug}`
    throw new Error('Either subdomain or publicSlug must be provided')
  },
  
  frontend: (path: string): string => `${config.frontendUrl}${path}`,
}

export type { Environment, EnvironmentConfig, SupabaseConfig, FeatureFlags } from './types'
