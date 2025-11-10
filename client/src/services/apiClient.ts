import { config } from '@/config'
import { supabase } from '@/lib/supabase'

const API_BASE_URL = config.apiBaseUrl

interface ApiConfig {
  timeout: number
  maxRetries: number
  retryDelay: number
  retryableStatusCodes: Set<number>
}

interface RequestOptions extends RequestInit {
  timeout?: number
  maxRetries?: number
  skipRetry?: boolean
}

const DEFAULT_CONFIG: ApiConfig = {
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatusCodes: new Set([408, 429, 500, 502, 503, 504]),
}

async function getToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

function createTimeoutSignal(timeout: number): AbortSignal {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeout)
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

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    timeout = DEFAULT_CONFIG.timeout,
    maxRetries = DEFAULT_CONFIG.maxRetries,
    skipRetry = false,
    ...fetchOptions
  } = options

  const token = await getToken()
  const headersObj: Record<string, string> = {}

  if (fetchOptions.headers) {
    if (fetchOptions.headers instanceof Headers) {
      fetchOptions.headers.forEach((value, key) => {
        headersObj[key] = value
      })
    } else if (Array.isArray(fetchOptions.headers)) {
      fetchOptions.headers.forEach(([key, value]) => {
        headersObj[key] = value
      })
    } else {
      Object.assign(headersObj, fetchOptions.headers)
    }
  }

  headersObj['Content-Type'] = 'application/json'
  if (token) {
    headersObj['Authorization'] = `Bearer ${token}`
  }

  let baseUrl = API_BASE_URL
  if (endpoint.startsWith('/api/v2')) {
    baseUrl = API_BASE_URL.replace('/api/v1', '')
  }

  const makeRequest = async (attempt: number = 0): Promise<T> => {
    try {
      const timeoutSignal = createTimeoutSignal(timeout)
      const requestSignal = fetchOptions.signal

      const combinedSignal = requestSignal
        ? AbortSignal.any([timeoutSignal, requestSignal])
        : timeoutSignal

      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers: headersObj,
        signal: combinedSignal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const detail = errorData?.detail || `Request failed with status ${response.status}`
        throw new Error(`API Error: ${detail}`)
      }

      if (response.status === 204) {
        return null as T
      }

      return response.json()
    } catch (error) {
      const apiError = error as Error

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
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
}
