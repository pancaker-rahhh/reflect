import { format, isValid, parseISO } from 'date-fns'

export function safeFormat(
  date: string | Date | undefined | null,
  formatString: string,
  fallback: string = ''
): string {
  if (!date) {
    return fallback
  }

  let dateObj: Date

  if (typeof date === 'string') {
    // Try parsing as ISO string first
    try {
      dateObj = parseISO(date)
    } catch (error) {
      // If ISO parsing fails, try regular Date constructor
      try {
        dateObj = new Date(date)
      } catch (error2) {
        console.warn('safeFormat: Failed to parse date string:', date)
        return fallback
      }
    }
  } else if (date instanceof Date) {
    dateObj = date
  } else {
    console.warn('safeFormat: Unexpected date type:', typeof date, date)
    return fallback
  }

  // Check if the Date object is valid
  if (!isValid(dateObj) || isNaN(dateObj.getTime())) {
    console.warn('safeFormat: Invalid date object:', dateObj, 'Original value:', date)
    return fallback
  }

  try {
    return format(dateObj, formatString)
  } catch (error) {
    console.error('safeFormat: Error formatting date:', error, 'Date object:', dateObj)
    return fallback
  }
}

/**
 * Safely converts a date value to a Date object
 * Handles both Date objects and date strings
 */
export function toDate(date: string | Date | undefined | null): Date | null {
  if (!date) return null

  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date
  }

  if (typeof date === 'string') {
    try {
      const parsed = new Date(date)
      return isNaN(parsed.getTime()) ? null : parsed
    } catch (error) {
      console.warn('Failed to parse date string:', date, error)
      return null
    }
  }

  return null
}

/**
 * Transforms API response data by converting date strings to Date objects
 * This handles the conversion from backend datetime strings to frontend Date objects
 */
export function transformDates<T>(data: T): T {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data === 'string') {
    // Check if it's a date string (ISO format or PostgreSQL format)
    if (
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(data) ||
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(data)
    ) {
      try {
        const date = new Date(data)
        if (!isNaN(date.getTime())) {
          return date as T
        }
      } catch (error) {
        console.warn('Failed to parse date string:', data, error)
      }
    }
    return data
  }

  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(transformDates) as T
    }

    const transformed: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      // Handle date fields (both snake_case and camelCase)
      if (
        key === 'created_at' ||
        key === 'updated_at' ||
        key === 'deleted_at' ||
        key === 'createdAt' ||
        key === 'updatedAt' ||
        key === 'deletedAt'
      ) {
        if (typeof value === 'string' && value) {
          try {
            // Handle PostgreSQL timestamp format: "2025-08-21 12:46:35.89831+00"
            let dateString = value
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(value)) {
              // Convert PostgreSQL format to ISO format
              dateString = value.replace(' ', 'T')
            }

            const date = new Date(dateString)
            if (!isNaN(date.getTime())) {
              // Keep the original key name (don't convert to camelCase here)
              transformed[key] = date
            } else {
              console.warn('Invalid date after parsing:', dateString, 'Original:', value)
              transformed[key] = value
            }
          } catch (error) {
            console.warn('Failed to parse date string:', value, error)
            transformed[key] = value
          }
        } else {
          transformed[key] = value
        }
      } else {
        // Recursively transform nested objects and arrays
        transformed[key] = transformDates(value)
      }
    }
    return transformed
  }

  return data
}
