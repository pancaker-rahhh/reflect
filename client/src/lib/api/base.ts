import { supabase } from '../supabase';

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export class ApiException extends Error {
  public readonly status: number;
  public readonly details?: any;
  public readonly originalMessage?: string;

  constructor(message: string, status: number, details?: any, originalMessage?: string) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.details = details;
    this.originalMessage = originalMessage;
  }
}

interface ErrorPattern {
  pattern: RegExp | string;
  userMessage: string;
  category: 'validation' | 'permission' | 'network' | 'system';
}

class ErrorSanitizer {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  private readonly errorPatterns: ErrorPattern[] = [
    // Database/SQL errors
    { 
      pattern: /duplicate key|unique constraint|already exists/i,
      userMessage: 'This item already exists. Please try a different name.',
      category: 'validation'
    },
    { 
      pattern: /foreign key constraint|references/i,
      userMessage: 'Cannot perform this action due to existing dependencies.',
      category: 'validation'
    },
    { 
      pattern: /not null constraint|required field/i,
      userMessage: 'Please fill in all required fields.',
      category: 'validation'
    },

    // Authentication errors
    { 
      pattern: /token.*expired|session.*expired/i,
      userMessage: 'Your session has expired. Please sign in again.',
      category: 'permission'
    },
    { 
      pattern: /unauthorized|access denied|forbidden/i,
      userMessage: 'You do not have permission to perform this action.',
      category: 'permission'
    },
    { 
      pattern: /authentication.*required|login.*required/i,
      userMessage: 'Please sign in to continue.',
      category: 'permission'
    },

    // Validation errors
    { 
      pattern: /validation.*failed|invalid.*format/i,
      userMessage: 'Please check your input and try again.',
      category: 'validation'
    },
    { 
      pattern: /too.*long|exceeds.*limit|maximum.*length/i,
      userMessage: 'Input is too long. Please shorten and try again.',
      category: 'validation'
    },
    { 
      pattern: /invalid.*email/i,
      userMessage: 'Please enter a valid email address.',
      category: 'validation'
    },

    // Rate limiting
    { 
      pattern: /rate.*limit|too.*many.*requests/i,
      userMessage: 'Too many requests. Please wait a moment and try again.',
      category: 'system'
    },

    // Network/Server errors
    { 
      pattern: /timeout|connection.*reset|network.*error/i,
      userMessage: 'Connection timeout. Please check your internet connection and try again.',
      category: 'network'
    },
    { 
      pattern: /internal.*server.*error|500/i,
      userMessage: 'Something went wrong on our end. Please try again later.',
      category: 'system'
    },
    { 
      pattern: /service.*unavailable|503/i,
      userMessage: 'Service is temporarily unavailable. Please try again later.',
      category: 'system'
    },
    { 
      pattern: /bad.*gateway|502/i,
      userMessage: 'Server is temporarily unavailable. Please try again later.',
      category: 'system'
    },

    // Not found errors
    { 
      pattern: /not.*found|404/i,
      userMessage: 'The requested resource was not found.',
      category: 'validation'
    }
  ];

  private readonly fallbackMessages = {
    validation: 'Please check your input and try again.',
    permission: 'You do not have permission to perform this action.',
    network: 'Network error. Please check your connection and try again.',
    system: 'Something went wrong. Please try again later.'
  };

  sanitizeError(
    rawMessage: string, 
    status: number, 
    errorDetails?: any
  ): { message: string; shouldLog: boolean } {

    if (this.isDevelopment) {
      return {
        message: this.removeStackTraces(rawMessage),
        shouldLog: true
      };
    }

    if (this.isUserFriendly(rawMessage)) {
      return {
        message: rawMessage,
        shouldLog: false
      };
    }

    for (const pattern of this.errorPatterns) {
      const regex = pattern.pattern instanceof RegExp 
        ? pattern.pattern 
        : new RegExp(pattern.pattern, 'i');
      
      if (regex.test(rawMessage)) {
        return {
          message: pattern.userMessage,
          shouldLog: true
        };
      }
    }

    const category = this.getErrorCategoryFromStatus(status);
    return {
      message: this.fallbackMessages[category],
      shouldLog: true
    };
  }

  private isUserFriendly(message: string): boolean {
    const technicalTerms = [
      'stack trace', 'error:', 'exception', 'null pointer', 'undefined',
      'database', 'sql', 'query', 'table', 'column', 'constraint',
      'internal server', 'traceback', 'line', 'file:', 'function',
      'class', 'method', 'variable', 'object', 'array'
    ];

    const lowerMessage = message.toLowerCase();
    return !technicalTerms.some(term => lowerMessage.includes(term));
  }

  private removeStackTraces(message: string): string {
    // Remove common stack trace patterns
    return message
      .replace(/\s+at\s+.*\(.*:\d+:\d+\)/g, '')
      .replace(/\s+at\s+.*:\d+:\d+/g, '')
      .replace(/File ".*", line \d+/g, '')
      .replace(/Traceback \(most recent call last\):/g, '')
      .trim();
  }

  private getErrorCategoryFromStatus(status: number): keyof typeof this.fallbackMessages {
    if (status >= 400 && status < 500) {
      if (status === 401 || status === 403) return 'permission';
      if (status === 422 || status === 400) return 'validation';
      return 'validation';
    }
    
    if (status >= 500) return 'system';
    if (status === 0) return 'network';
    
    return 'system';
  }

  logError(originalMessage: string, sanitizedMessage: string, details?: any) {
    if (this.isDevelopment) {
      console.error('API Error:', {
        original: originalMessage,
        sanitized: sanitizedMessage,
        details
      });
    }
    
    // TODO: In production, you might want to send this to an error tracking service
    // like Sentry, etc.
  }
}

export abstract class BaseApiService {
  protected readonly baseUrl: string;
  private readonly errorSanitizer = new ErrorSanitizer();

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
        throw new ApiException('Your session has expired. Please sign in again.', 401);
      }

      if (!response.ok) {
        let rawErrorMessage = `Request failed`;
        let errorDetails;

        try {
          const errorData = await response.json();
          rawErrorMessage = errorData.message || errorData.detail || rawErrorMessage;
          errorDetails = errorData;
        } catch {
          rawErrorMessage = response.statusText || rawErrorMessage;
        }

        const { message: sanitizedMessage, shouldLog } = this.errorSanitizer.sanitizeError(
          rawErrorMessage,
          response.status,
          errorDetails
        );

        if (shouldLog) {
          this.errorSanitizer.logError(rawErrorMessage, sanitizedMessage, errorDetails);
        }

        throw new ApiException(
          sanitizedMessage,
          response.status,
          errorDetails,
          rawErrorMessage
        );
      }

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const { message: sanitizedMessage } = this.errorSanitizer.sanitizeError(
          'Network error occurred',
          0
        );
        
        this.errorSanitizer.logError(
          error.message,
          sanitizedMessage,
          error
        );
        
        throw new ApiException(sanitizedMessage, 0, error, error.message);
      }

      // Handle unexpected errors
      const { message: sanitizedMessage } = this.errorSanitizer.sanitizeError(
        'Unexpected error occurred',
        500
      );
      
      this.errorSanitizer.logError(
        error instanceof Error ? error.message : String(error),
        sanitizedMessage,
        error
      );

      throw new ApiException(sanitizedMessage, 500, error, String(error));
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