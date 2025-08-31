export interface SanitizationOptions {
  maxLength?: number
  allowHtml?: boolean
  allowedTags?: string[]
  stripNewlines?: boolean
  trimWhitespace?: boolean
}

export class InputSanitizer {
  // Default maximum lengths for different field types
  static readonly MAX_LENGTHS = {
    title: 200,
    message: 2000,
    description: 5000,
    pros: 1000,
    cons: 1000,
    stepsToReproduce: 2000,
    expectedResult: 1000,
    actualResult: 1000,
    suggestedSolution: 2000,
    benefits: 1000,
    useCase: 1000,
    comment: 1000,
    submitterName: 100,
    submitterEmail: 254,
    category: 50,
    priority: 20,
    severity: 20,
    general: 1000,
  } as const

  // HTML tags that are considered safe
  static readonly SAFE_HTML_TAGS = [
    'b',
    'strong',
    'i',
    'em',
    'u',
    'br',
    'p',
    'ul',
    'ol',
    'li',
    'code',
    'pre',
  ]

  /**
   * Sanitize text input by removing dangerous content and applying formatting rules
   */
  static sanitizeText(input: string | null | undefined, options: SanitizationOptions = {}): string {
    if (!input) return ''

    const {
      maxLength = this.MAX_LENGTHS.general,
      allowHtml = false,
      allowedTags = this.SAFE_HTML_TAGS,
      stripNewlines = false,
      trimWhitespace = true,
    } = options

    let sanitized = String(input)

    // Trim whitespace
    if (trimWhitespace) {
      sanitized = sanitized.trim()
    }

    // Remove null bytes and control characters (except newlines and tabs)
    sanitized = sanitized
      .split('')
      .filter((char) => {
        const code = char.charCodeAt(0)
        return code !== 0 && (code < 9 || code > 13) && code !== 127
      })
      .join('')

    // Handle newlines
    if (stripNewlines) {
      sanitized = sanitized.replace(/[\r\n]/g, ' ')
    } else {
      // Normalize newlines
      sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    }

    // HTML sanitization
    if (allowHtml) {
      sanitized = this._sanitizeHtml(sanitized, allowedTags)
    } else {
      // Escape HTML to prevent XSS
      sanitized = this._escapeHtml(sanitized)
    }

    // Limit length
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength)
    }

    return sanitized
  }

  /**
   * Sanitize email address
   */
  static sanitizeEmail(email: string | null | undefined): string | null {
    if (!email) return null

    const sanitized = email.trim().toLowerCase()

    // Basic email validation pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (!emailPattern.test(sanitized)) {
      return null
    }

    // Limit length
    return sanitized.length > 254 ? null : sanitized
  }

  /**
   * Sanitize URL input
   */
  static sanitizeUrl(url: string | null | undefined): string | null {
    if (!url) return null

    let sanitized = url.trim()

    // Add protocol if missing
    if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
      sanitized = 'https://' + sanitized
    }

    try {
      // Basic URL validation
      new URL(sanitized)

      // Limit length
      return sanitized.length > 2048 ? null : sanitized
    } catch {
      return null
    }
  }

  /**
   * Sanitize rating values
   */
  static sanitizeRating(rating: number | string | null | undefined): number | null {
    if (rating === null || rating === undefined) return null

    try {
      const num = Number(rating)
      if (isNaN(num)) return null

      const intRating = Math.round(num)

      // Ensure rating is within valid range (0-10)
      if (intRating >= 0 && intRating <= 10) {
        return intRating
      }
    } catch {
      // Ignore errors
    }

    return null
  }

  /**
   * Sanitize severity values
   */
  static sanitizeSeverity(severity: string | null | undefined): string | null {
    if (!severity) return null

    const sanitized = severity.trim().toLowerCase()
    const allowedValues = ['low', 'medium', 'high', 'critical']

    return allowedValues.includes(sanitized) ? sanitized : 'medium'
  }

  /**
   * Sanitize priority values
   */
  static sanitizePriority(priority: string | null | undefined): string | null {
    if (!priority) return null

    const sanitized = priority.trim().toLowerCase()
    const allowedValues = ['low', 'medium', 'high', 'urgent']

    return allowedValues.includes(sanitized) ? sanitized : 'medium'
  }

  /**
   * Sanitize category values
   */
  static sanitizeCategory(category: string | null | undefined): string | null {
    if (!category) return null

    const sanitized = category.trim()

    // Remove special characters and limit length
    const cleaned = sanitized.replace(/[^\w\s-]/g, '')
    const limited = cleaned.substring(0, 50)

    return limited || null
  }

  /**
   * Sanitize widget key
   */
  static sanitizeWidgetKey(key: string | null | undefined): string | null {
    if (!key) return null

    const sanitized = key.trim()

    // Widget keys should only contain alphanumeric characters and underscores
    if (/^[a-zA-Z0-9_]+$/.test(sanitized)) {
      return sanitized
    }

    return null
  }

  /**
   * Get character count for input validation
   */
  static getCharacterCount(input: string | null | undefined): number {
    return input ? input.length : 0
  }

  /**
   * Check if input exceeds maximum length
   */
  static isExceedingMaxLength(input: string | null | undefined, maxLength: number): boolean {
    return this.getCharacterCount(input) > maxLength
  }

  /**
   * Get remaining characters
   */
  static getRemainingCharacters(input: string | null | undefined, maxLength: number): number {
    return Math.max(0, maxLength - this.getCharacterCount(input))
  }

  /**
   * Private method to escape HTML
   */
  private static _escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * Private method to sanitize HTML content
   */
  private static _sanitizeHtml(html: string, allowedTags: string[]): string {
    // This is a simplified approach - in production, consider using DOMPurify
    const div = document.createElement('div')
    div.innerHTML = html

    // Remove all script tags and event handlers
    const scripts = div.querySelectorAll('script')
    scripts.forEach((script) => script.remove())

    // Remove all elements except allowed tags
    const allElements = div.querySelectorAll('*')
    allElements.forEach((element) => {
      if (!allowedTags.includes(element.tagName.toLowerCase())) {
        element.replaceWith(element.textContent || '')
      }

      // Remove all attributes
      Array.from(element.attributes).forEach((attr) => {
        element.removeAttribute(attr.name)
      })
    })

    return div.innerHTML
  }
}

/**
 * Convenience functions for common sanitization tasks
 */
export const sanitizeInput = {
  title: (input: string) =>
    InputSanitizer.sanitizeText(input, { maxLength: InputSanitizer.MAX_LENGTHS.title }),
  message: (input: string) =>
    InputSanitizer.sanitizeText(input, { maxLength: InputSanitizer.MAX_LENGTHS.message }),
  description: (input: string) =>
    InputSanitizer.sanitizeText(input, { maxLength: InputSanitizer.MAX_LENGTHS.description }),
  comment: (input: string) =>
    InputSanitizer.sanitizeText(input, { maxLength: InputSanitizer.MAX_LENGTHS.comment }),
  email: (input: string) => InputSanitizer.sanitizeEmail(input),
  url: (input: string) => InputSanitizer.sanitizeUrl(input),
  rating: (input: number | string) => InputSanitizer.sanitizeRating(input),
  severity: (input: string) => InputSanitizer.sanitizeSeverity(input),
  priority: (input: string) => InputSanitizer.sanitizePriority(input),
  category: (input: string) => InputSanitizer.sanitizeCategory(input),
  widgetKey: (input: string) => InputSanitizer.sanitizeWidgetKey(input),
  general: (input: string, maxLength?: number) =>
    InputSanitizer.sanitizeText(input, {
      maxLength: maxLength || InputSanitizer.MAX_LENGTHS.general,
    }),
}

/**
 * React hook for input sanitization (if you want to use it as a hook)
 */
export const useInputSanitization = (maxLength?: number) => {
  const sanitize = (input: string) => InputSanitizer.sanitizeText(input, { maxLength })
  const getCharCount = (input: string) => InputSanitizer.getCharacterCount(input)
  const isExceeding = (input: string) =>
    InputSanitizer.isExceedingMaxLength(input, maxLength || InputSanitizer.MAX_LENGTHS.general)
  const getRemaining = (input: string) =>
    InputSanitizer.getRemainingCharacters(input, maxLength || InputSanitizer.MAX_LENGTHS.general)

  return {
    sanitize,
    getCharCount,
    isExceeding,
    getRemaining,
    maxLength: maxLength || InputSanitizer.MAX_LENGTHS.general,
  }
}
