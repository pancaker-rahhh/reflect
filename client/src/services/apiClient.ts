const API_BASE_URL = '/api/v1'

function getToken(): string | null {
  const authData = localStorage.getItem('supabase.auth.token')
  if (authData) {
    return JSON.parse(authData).session?.access_token ?? null
  }
  return null
}

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const headers = new Headers(options?.headers)

  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
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
}
