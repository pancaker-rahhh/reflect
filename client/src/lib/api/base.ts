import { supabase } from '../supabase';

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export class ApiException extends Error {
  public readonly status: number;
  public readonly details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.details = details;
  }
}

export abstract class BaseApiService {
  protected readonly baseUrl: string;

  constructor() {
    // For now, hardcode to localhost:8000 - can be made configurable later
    this.baseUrl = 'http://localhost:8000/api/v1';
  }

  /**
   * Get authorization headers with current session token
   */
  protected async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  /**
   * Make authenticated HTTP request
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getAuthHeaders();

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    console.log('📋 Headers:', headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      // Handle authentication errors
      if (response.status === 401) {
        await supabase.auth.signOut();
        window.location.href = '/login';
        throw new ApiException('Authentication required', 401);
      }

      // Handle other HTTP errors
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorDetails;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
          errorDetails = errorData;
        } catch {
          // If response is not JSON, use status text
        }

        throw new ApiException(errorMessage, response.status, errorDetails);
      }

      // Handle empty responses (like 204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('🚨 API Request Error:', error);
      
      if (error instanceof ApiException) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 Network Error - Backend might be unreachable:', error);
        throw new ApiException('Network error - please check your connection', 0, error);
      }

      console.error('🔥 Unexpected API Error:', error);
      throw new ApiException('An unexpected error occurred', 500, error);
    }
  }

  /**
   * GET request
   */
  protected async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}