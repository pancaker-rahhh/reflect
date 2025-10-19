import type { Environment, EnvironmentConfig } from './types'
import { localConfig } from './local'
import { developmentConfig } from './development'
import { productionConfig } from './production'


function validateEnvironment(env: string | undefined): asserts env is Environment {
  if (!env) {
    throw new Error(
      '❌ VITE_ENVIRONMENT is not set.\n' +
        'Please create a .env file with VITE_ENVIRONMENT=local\n' +
        'Valid values: local, development, production'
    )
  }

  const validEnvironments: Environment[] = ['local', 'development', 'production']
  
  if (!validEnvironments.includes(env as Environment)) {
    throw new Error(
      `❌ Invalid VITE_ENVIRONMENT value: "${env}"\n` +
        `Valid values are: ${validEnvironments.join(', ')}\n` +
        'Please check your .env file.'
    )
  }
}

function loadEnvironmentConfig(environment: Environment): EnvironmentConfig {
  const configMap: Record<Environment, EnvironmentConfig> = {
    local: localConfig,
    development: developmentConfig,
    production: productionConfig,
  }

  return configMap[environment]
}

function validateConfig(config: EnvironmentConfig): void {
  const requiredFields = [
    'environment',
    'apiBaseUrl',
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
        `❌ Configuration error: Missing required field "${field}" in ${config.environment} config`
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
    console.log('🔧 Environment Configuration Loaded:', {
      environment: config.environment,
      apiBaseUrl: config.apiBaseUrl,
      supabaseUrl: config.supabase.url,
      features: config.features,
    })
  }
  
  return config
}

export const config = initializeConfig()

export const isLocal = config.environment === 'local'
export const isDevelopment = config.environment === 'development'
export const isProduction = config.environment === 'production'

export const isNonProduction = isLocal || isDevelopment

export type { Environment, EnvironmentConfig, SupabaseConfig, FeatureFlags } from './types'
