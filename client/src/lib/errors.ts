export interface ApiError {
  message: string
  status: number
  details?: any
}

export class ApiException extends Error {
  public readonly status: number
  public readonly details?: any
  public readonly originalMessage?: string

  constructor(message: string, status: number, details?: any, originalMessage?: string) {
    super(message)
    this.name = 'ApiException'
    this.status = status
    this.details = details
    this.originalMessage = originalMessage
  }
}

interface ErrorPattern {
  pattern: RegExp
  userMessage: string
  category: 'validation' | 'authentication' | 'authorization' | 'network' | 'server' | 'generic'
}

class ErrorSanitizer {
  private readonly errorPatterns: ErrorPattern[] = [
    { 
      pattern: /duplicate key|unique constraint|already exists/i,
      userMessage: 'This item already exists. Please try a different name.',
      category: 'validation'
    },
    {
      pattern: /not found|404/i,
      userMessage: 'The requested resource was not found.',
      category: 'validation'
    },
    {
      pattern: /unauthorized|401/i,
      userMessage: 'You are not authorized to perform this action.',
      category: 'authentication'
    },
    {
      pattern: /forbidden|403/i,
      userMessage: 'You do not have permission to access this resource.',
      category: 'authorization'
    },
    {
      pattern: /validation error|invalid input/i,
      userMessage: 'Please check your input and try again.',
      category: 'validation'
    },
    {
      pattern: /network error|fetch failed|connection/i,
      userMessage: 'Network error. Please check your connection and try again.',
      category: 'network'
    },
    {
      pattern: /timeout/i,
      userMessage: 'The request timed out. Please try again.',
      category: 'network'
    },
    {
      pattern: /rate limit|too many requests|429/i,
      userMessage: 'Too many requests. Please wait a moment and try again.',
      category: 'server'
    },
    {
      pattern: /server error|500|502|503|504/i,
      userMessage: 'A server error occurred. Please try again later.',
      category: 'server'
    }
  ]

  sanitize(error: Error | string, isDevelopment: boolean = process.env.NODE_ENV === 'development'): string {
    const errorMessage = typeof error === 'string' ? error : error.message

    // In development, return the original error for debugging
    if (isDevelopment) {
      return errorMessage
    }

    // Try to match against known patterns
    for (const pattern of this.errorPatterns) {
      if (pattern.pattern.test(errorMessage)) {
        return pattern.userMessage
      }
    }

    // Default sanitized message
    return 'An unexpected error occurred. Please try again.'
  }

  getErrorCategory(error: Error | string): string {
    const errorMessage = typeof error === 'string' ? error : error.message

    for (const pattern of this.errorPatterns) {
      if (pattern.pattern.test(errorMessage)) {
        return pattern.category
      }
    }

    return 'generic'
  }
}

export const errorSanitizer = new ErrorSanitizer()

export function createApiError(message: string, status: number, details?: any): ApiException {
  const sanitizedMessage = errorSanitizer.sanitize(message)
  return new ApiException(sanitizedMessage, status, details, message)
}

export function handleApiError(error: unknown): ApiException {
  if (error instanceof ApiException) {
    return error
  }

  if (error instanceof Error) {
    const sanitizedMessage = errorSanitizer.sanitize(error.message)
    return new ApiException(sanitizedMessage, 500, undefined, error.message)
  }

  const sanitizedMessage = errorSanitizer.sanitize('Unknown error occurred')
  return new ApiException(sanitizedMessage, 500, undefined, String(error))
}