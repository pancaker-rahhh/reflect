import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  SanitizedInput,
  SanitizedTitleInput,
  SanitizedMessageInput,
  SanitizedCommentInput,
  SanitizedEmailInput,
  useSanitizedInput,
} from '@/components/ui/SanitizedInput'

export function SanitizedInputExample() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    comment: '',
    email: '',
  })

  const [submittedData, setSubmittedData] = useState<{
    original: typeof formData
    sanitized: { title: string }
  } | null>(null)

  // Example using the hook
  const titleHook = useSanitizedInput('title')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittedData({
      original: formData,
      sanitized: {
        title: titleHook.sanitizedValue,
        // You would get sanitized values from other fields similarly
      },
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSanitizedChange = (field: string, original: string, sanitized: string) => {
    console.log(`${field} sanitized:`, { original, sanitized })
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Input Sanitization Examples</CardTitle>
          <CardDescription>
            These components automatically sanitize user input to prevent XSS and injection attacks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic sanitized input */}
            <SanitizedInput
              label="General Text Input"
              placeholder="Enter any text (will be sanitized)"
              fieldType="general"
              showCharCount
              onSanitizedChange={(original, sanitized) =>
                handleSanitizedChange('general', original, sanitized)
              }
              onChange={(e) => handleInputChange('general', e.target.value)}
            />

            {/* Title input with specific field type */}
            <SanitizedTitleInput
              label="Title Input"
              placeholder="Enter a title (max 200 chars)"
              showCharCount
              onSanitizedChange={(original, sanitized) =>
                handleSanitizedChange('title', original, sanitized)
              }
              onChange={(e) => handleInputChange('title', e.target.value)}
            />

            {/* Message input (textarea) */}
            <SanitizedMessageInput
              label="Message Input"
              placeholder="Enter a message (max 2000 chars)"
              showCharCount
              onSanitizedChange={(original, sanitized) =>
                handleSanitizedChange('message', original, sanitized)
              }
              onChange={(e) => handleInputChange('message', e.target.value)}
            />

            {/* Comment input */}
            <SanitizedCommentInput
              label="Comment Input"
              placeholder="Enter a comment (max 1000 chars)"
              showCharCount
              onSanitizedChange={(original, sanitized) =>
                handleSanitizedChange('comment', original, sanitized)
              }
              onChange={(e) => handleInputChange('comment', e.target.value)}
            />

            {/* Email input */}
            <SanitizedEmailInput
              label="Email Input"
              placeholder="Enter an email address"
              onSanitizedChange={(original, sanitized) =>
                handleSanitizedChange('email', original, sanitized)
              }
              onChange={(e) => handleInputChange('email', e.target.value)}
            />

            {/* Custom sanitization options */}
            <SanitizedInput
              label="Custom Sanitization"
              placeholder="This input allows HTML tags and strips newlines"
              sanitizationOptions={{
                allowHtml: true,
                stripNewlines: true,
                maxLength: 500,
              }}
              showCharCount
              onSanitizedChange={(original, sanitized) =>
                handleSanitizedChange('custom', original, sanitized)
              }
            />

            <Button type="submit" className="w-full">
              Submit Form
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Hook usage example */}
      <Card>
        <CardHeader>
          <CardTitle>Hook Usage Example</CardTitle>
          <CardDescription>
            Using the useSanitizedInput hook for custom implementations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SanitizedInput
              label="Title (using hook)"
              placeholder="This uses the hook internally"
              value={titleHook.value}
              onChange={(e) => titleHook.handleChange(e.target.value)}
              showCharCount
            />

            <div className="text-sm text-muted-foreground">
              <p>
                Character count: {titleHook.charCount}/{titleHook.maxLength}
              </p>
              <p>Is exceeding: {titleHook.isExceeding ? 'Yes' : 'No'}</p>
              <p>Remaining: {titleHook.remainingChars}</p>
              <p>Sanitized value: {titleHook.sanitizedValue}</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => titleHook.handleChange('Test <script>alert("xss")</script>')}
                variant="outline"
              >
                Test XSS Input
              </Button>
              <Button onClick={titleHook.reset} variant="outline">
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submitted data display */}
      {submittedData && (
        <Card>
          <CardHeader>
            <CardTitle>Submitted Data</CardTitle>
            <CardDescription>Showing original vs sanitized values</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
