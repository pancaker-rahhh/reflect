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
    this.baseUrl = 'http://localhost:8000/api/v1';
  }

  protected async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getAuthHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        await supabase.auth.signOut();
        window.location.href = '/login';
        throw new ApiException('Authentication required', 401);
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorDetails;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
          errorDetails = errorData;
        } catch {
        }

        throw new ApiException(errorMessage, response.status, errorDetails);
      }

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiException('Network error - please check your connection', 0, error);
      }

      throw new ApiException('An unexpected error occurred', 500, error);
    }
  }

  protected async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}