import { supabase } from './supabase'
import { createApiError, handleApiError } from './errors'

const API_BASE_URL: string = (() => {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (configured && typeof configured === 'string' && configured.trim().length > 0) {
    return configured
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:8000/api/v1'
  }

  const { hostname, protocol } = window.location
  const isLocalhost =
    hostname === 'localhost' || hostname.startsWith('127.') || hostname.endsWith('.local')

  if (isLocalhost) {
    return 'http://localhost:8000/api/v1'
  }

  // Infer api subdomain for production, e.g. reflectfeedback.com -> api.reflectfeedback.com
  const parts = hostname.split('.')
  const baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname
  const apiHost = `api.${baseDomain}`
  return `${protocol}//${apiHost}/api/v1`
})()

interface RequestConfig {
  timeout?: number
  maxRetries?: number
  skipRetry?: boolean
}

const DEFAULT_CONFIG = {
  timeout: 10000,
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatusCodes: new Set([408, 429, 500, 502, 503, 504]),
}

function createTimeoutSignal(timeout: number): AbortSignal {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeout)
  return controller.signal
}

function combineSignals(primary: AbortSignal, other?: AbortSignal): AbortSignal {
  if (!other) return primary
  const controller = new AbortController()
  const abort = () => controller.abort()

  if (primary.aborted || other.aborted) {
    controller.abort()
    return controller.signal
  }

  primary.addEventListener('abort', abort, { once: true })
  other.addEventListener('abort', abort, { once: true })
  return controller.signal
}

function shouldRetry(error: Error, attempt: number, maxRetries: number): boolean {
  if (attempt >= maxRetries) return false
  if (error.name === 'AbortError') return false

  if (error.message.includes('API Error:')) {
    const statusMatch = error.message.match(/status (\d+)/)
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10)
      return DEFAULT_CONFIG.retryableStatusCodes.has(status)
    }
  }

  return error.message.includes('fetch') || error.message.includes('network')
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function request<T>(endpoint: string, options: RequestInit & RequestConfig = {}): Promise<T> {
  const {
    timeout = DEFAULT_CONFIG.timeout,
    maxRetries = DEFAULT_CONFIG.maxRetries,
    skipRetry = false,
    ...fetchOptions
  } = options

  const makeRequest = async (attempt: number = 0): Promise<T> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token

      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
      const normalizedEndpointNoTrailingSlash = normalizedEndpoint.endsWith('/') && normalizedEndpoint !== '/' 
        ? normalizedEndpoint.slice(0, -1) 
        : normalizedEndpoint
      
      // TODO - Remove this once we have a proper logging system
      if (import.meta.env.DEV) {
        console.log(`🌐 API Request: ${fetchOptions.method || 'GET'} ${API_BASE_URL}${normalizedEndpointNoTrailingSlash}`)
        console.log(`🎫 Token present: ${token ? 'Yes' : 'No'}`)
      }

      const headers = new Headers(fetchOptions.headers)
      headers.set('Content-Type', 'application/json')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      const timeoutSignal = createTimeoutSignal(timeout)
      const requestSignal = fetchOptions.signal
      const combinedSignal = requestSignal
        ? combineSignals(timeoutSignal, requestSignal)
        : timeoutSignal

      const response = await fetch(`${API_BASE_URL}${normalizedEndpointNoTrailingSlash}`, {
        ...fetchOptions,
        headers,
        signal: combinedSignal,
      })

      if (response.status === 401) {
        await supabase.auth.signOut()
        window.location.href = '/login'
        throw new Error('Unauthorized')
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const detail = errorData?.detail || `Request failed with status ${response.status}`

        // Debug logging in development
        if (import.meta.env.DEV) {
          console.error(`❌ API Error: ${response.status} ${response.statusText}`)
          console.error(`❌ Error details:`, errorData)
        }

        throw createApiError(detail, response.status, errorData)
      }

      if (response.status === 204) {
        return null as T
      }

      const result = await response.json()

      // Debug logging in development
      if (import.meta.env.DEV) {
        console.log(`✅ API Success: ${response.status}`, result)
      }

      return result
    } catch (error) {
      const apiError = handleApiError(error)

      if (skipRetry || !shouldRetry(apiError, attempt, maxRetries)) {
        throw apiError
      }

      const delay = DEFAULT_CONFIG.retryDelay * Math.pow(2, attempt)
      await sleep(delay)

      return makeRequest(attempt + 1)
    }
  }

  return makeRequest()
}

export const apiClient = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'GET' }),

  getBinary: async (endpoint: string, config?: RequestConfig & RequestInit): Promise<Blob> => {
    const {
      timeout = DEFAULT_CONFIG.timeout,
      maxRetries = DEFAULT_CONFIG.maxRetries,
      skipRetry = false,
      ...fetchOptions
    } = (config as RequestInit & RequestConfig) || {}

    const makeRequest = async (attempt: number = 0): Promise<Blob> => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const token = session?.access_token

        if (import.meta.env.DEV) {
          console.log(`🌐 API Request (binary): GET ${API_BASE_URL}${endpoint}`)
          console.log(`🎫 Token present: ${token ? 'Yes' : 'No'}`)
        }

        const headers = new Headers(fetchOptions.headers)
        if (token) headers.set('Authorization', `Bearer ${token}`)
        headers.set('Accept', 'application/pdf')

        const timeoutSignal = createTimeoutSignal(timeout)
        const requestSignal = (fetchOptions as RequestInit).signal
        const combinedSignal = requestSignal
          ? combineSignals(timeoutSignal, requestSignal)
          : timeoutSignal

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...fetchOptions,
          method: 'GET',
          headers,
          signal: combinedSignal,
        })

        if (response.status === 401) {
          await supabase.auth.signOut()
          window.location.href = '/login'
          throw new Error('Unauthorized')
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => '')
          if (import.meta.env.DEV) {
            console.error(`❌ API Error (binary): ${response.status} ${response.statusText}`)
            console.error(`❌ Error details:`, errorText)
          }
          throw createApiError(
            errorText || `Request failed with status ${response.status}`,
            response.status,
            undefined
          )
        }

        return await response.blob()
      } catch (error) {
        const apiError = handleApiError(error)
        if (skipRetry || !shouldRetry(apiError, attempt, maxRetries)) throw apiError
        const delay = DEFAULT_CONFIG.retryDelay * Math.pow(2, attempt)
        await sleep(delay)
        return makeRequest(attempt + 1)
      }
    }

    return makeRequest()
  },

  post: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'DELETE' }),

  patch: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
}
