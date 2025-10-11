import React, { forwardRef, useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { InputSanitizer, sanitizeInput } from '@/lib/sanitization'
import type { SanitizationOptions } from '@/lib/sanitization'
import { cn } from '@/lib/utils'

export interface SanitizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  sanitizationOptions?: SanitizationOptions
  fieldType?: keyof typeof InputSanitizer.MAX_LENGTHS
  showCharCount?: boolean
  onSanitizedChange?: (value: string, sanitized: string) => void
  variant?: 'input' | 'textarea'
}

export const SanitizedInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  SanitizedInputProps
>(
  (
    {
      label,
      error,
      helperText,
      sanitizationOptions = {},
      fieldType = 'general',
      showCharCount = false,
      onSanitizedChange,
      variant = 'input',
      className,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState<string>(String(value || defaultValue || ''))
    const [sanitizedValue, setSanitizedValue] = useState('')
    const [isDirty, setIsDirty] = useState(false)

    const maxLength = sanitizationOptions.maxLength || InputSanitizer.MAX_LENGTHS[fieldType]
    const charCount = InputSanitizer.getCharacterCount(inputValue)
    const isExceeding = InputSanitizer.isExceedingMaxLength(inputValue, maxLength)
    const remainingChars = InputSanitizer.getRemainingCharacters(inputValue, maxLength)

    // Sanitize input value
    const sanitizeValue = useCallback(
      (value: string) => {
        const sanitized = InputSanitizer.sanitizeText(value, {
          maxLength,
          ...sanitizationOptions,
        })
        setSanitizedValue(sanitized)
        return sanitized
      },
      [maxLength, sanitizationOptions]
    )

    // Handle input change
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        setIsDirty(true)

        // Sanitize the value
        const sanitized = sanitizeValue(newValue)

        // Call the original onChange if provided
        if (onChange) {
          onChange(e as React.ChangeEvent<HTMLInputElement>)
        }

        // Call the sanitized change callback
        if (onSanitizedChange) {
          onSanitizedChange(newValue, sanitized)
        }
      },
      [onChange, onSanitizedChange, sanitizeValue]
    )

    // Sanitize on mount and when sanitization options change
    useEffect(() => {
      if (inputValue) {
        sanitizeValue(inputValue)
      }
    }, [inputValue, sanitizeValue])

    // Update internal state when external value changes
    useEffect(() => {
      if (value !== undefined && value !== inputValue) {
        setInputValue(String(value))
        setIsDirty(false)
      }
    }, [value, inputValue])

    const renderInput = () => {
      if (variant === 'textarea') {
        return (
          <Textarea
            value={inputValue}
            onChange={handleChange}
            className={cn(
              'transition-all duration-200',
              isExceeding && 'border-destructive focus:border-destructive',
              className
            )}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        )
      }
      return (
        <Input
          value={inputValue}
          onChange={handleChange}
          className={cn(
            'transition-all duration-200',
            isExceeding && 'border-red-500 focus:border-red-500',
            className
          )}
          ref={ref as React.Ref<HTMLInputElement>}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )
    }

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
          </Label>
        )}

        {renderInput()}

        {/* Character count and validation */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {showCharCount && (
              <span className={cn(isExceeding ? 'text-red-500' : '')}>
                {charCount}/{maxLength}
              </span>
            )}
            {isExceeding && (
              <span className="text-red-500">{remainingChars} characters over limit</span>
            )}
          </div>

          {isDirty && sanitizedValue !== inputValue && (
            <span className="text-amber-600">Input sanitized</span>
          )}
        </div>

        {/* Helper text */}
        {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}

        {/* Error message */}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

SanitizedInput.displayName = 'SanitizedInput'

// Convenience components for specific field types
export const SanitizedTitleInput = forwardRef<
  HTMLInputElement,
  Omit<SanitizedInputProps, 'fieldType'>
>((props, ref) => <SanitizedInput ref={ref} fieldType="title" {...props} />)
SanitizedTitleInput.displayName = 'SanitizedTitleInput'

export const SanitizedMessageInput = forwardRef<
  HTMLTextAreaElement,
  Omit<SanitizedInputProps, 'fieldType' | 'variant'>
>((props, ref) => <SanitizedInput ref={ref} fieldType="message" variant="textarea" {...props} />)
SanitizedMessageInput.displayName = 'SanitizedMessageInput'

export const SanitizedCommentInput = forwardRef<
  HTMLTextAreaElement,
  Omit<SanitizedInputProps, 'fieldType' | 'variant'>
>((props, ref) => <SanitizedInput ref={ref} fieldType="comment" variant="textarea" {...props} />)
SanitizedCommentInput.displayName = 'SanitizedCommentInput'

export const SanitizedEmailInput = forwardRef<
  HTMLInputElement,
  Omit<SanitizedInputProps, 'fieldType'>
>((props, ref) => (
  <SanitizedInput
    ref={ref}
    fieldType="submitterEmail"
    onSanitizedChange={(value, _sanitized) => {
      // Additional email-specific validation
      if (value && !InputSanitizer.sanitizeEmail(value)) {
        // You could set an error state here
      }
    }}
    {...props}
  />
))
SanitizedEmailInput.displayName = 'SanitizedEmailInput'

// Hook for using sanitized input with form libraries
export const useSanitizedInput = (
  fieldType: keyof typeof InputSanitizer.MAX_LENGTHS = 'general'
) => {
  const [value, setValue] = useState('')
  const [sanitizedValue, setSanitizedValue] = useState('')

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue)
      // Use the general sanitizer for field types that don't have specific sanitizers
      const sanitized =
        sanitizeInput[fieldType as keyof typeof sanitizeInput]?.(newValue) ||
        sanitizeInput.general(newValue, InputSanitizer.MAX_LENGTHS[fieldType])
      setSanitizedValue(String(sanitized || ''))
    },
    [fieldType]
  )

  const reset = useCallback(() => {
    setValue('')
    setSanitizedValue('')
  }, [])

  return {
    value,
    sanitizedValue,
    handleChange,
    reset,
    maxLength: InputSanitizer.MAX_LENGTHS[fieldType],
    charCount: InputSanitizer.getCharacterCount(value),
    isExceeding: InputSanitizer.isExceedingMaxLength(value, InputSanitizer.MAX_LENGTHS[fieldType]),
    remainingChars: InputSanitizer.getRemainingCharacters(
      value,
      InputSanitizer.MAX_LENGTHS[fieldType]
    ),
  }
}
