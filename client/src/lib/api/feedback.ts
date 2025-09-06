import { apiClient } from '../client'

// Define the shape of the data we'll send to the backend
interface FeedbackPayload {
  widgetKey: string
  response: string // The actual feedback text
  rating?: number // Rating for feedback types that support it
  feedbackType?: string // Type of feedback (review, bug_report, etc.)
  // You could add more data here later, like user agent, current URL, etc.
}

interface ConversionData {
  priority: 'low' | 'medium' | 'high' | 'critical'
  custom_tags?: string[]
  conversion_notes?: string
}

interface ConversionPreview {
  suggested_title: string
  suggested_description: string
  suggested_tags: Array<{
    name: string
    color: string
  }>
  suggested_priority: 'low' | 'medium' | 'high' | 'critical'
}

async function submit(payload: FeedbackPayload): Promise<void> {
  const response = await fetch('/api/v1/public/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    // Handle rate limiting with detailed error information
    if (response.status === 429) {
      try {
        const errorData = await response.json()
        const retryAfter = response.headers.get('Retry-After')
        const retrySeconds = retryAfter ? parseInt(retryAfter) : 60
        const retryMinutes = Math.ceil(retrySeconds / 60)

        // Use the detailed message from the backend if available
        const message = errorData?.detail?.message || errorData?.message || 'Too many requests'
        throw new Error(
          `${message}. Please try again in ${retryMinutes} minute${retryMinutes !== 1 ? 's' : ''}.`
        )
      } catch (parseError) {
        // Fallback if JSON parsing fails
        const retryAfter = response.headers.get('Retry-After')
        const retrySeconds = retryAfter ? parseInt(retryAfter) : 60
        const retryMinutes = Math.ceil(retrySeconds / 60)
        throw new Error(
          `Too many requests. Please try again in ${retryMinutes} minute${retryMinutes !== 1 ? 's' : ''}.`
        )
      }
    }

    // Try to get a meaningful error message from the backend for other errors
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Submission failed with an unknown error.' }))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  // We don't need to return anything on success
}

async function getActionableFeedback(): Promise<any[]> {
  return apiClient.get('/feedback/actionable')
}

async function getConversionPreview(feedbackId: string): Promise<ConversionPreview> {
  return apiClient.get(`/feedback/${feedbackId}/conversion-preview`)
}

async function convertToRoadmap(feedbackId: string, conversionData: ConversionData): Promise<any> {
  return apiClient.post(`/feedback/${feedbackId}/convert`, conversionData)
}

export const feedbackApi = {
  submit,
  getActionableFeedback,
  getConversionPreview,
  convertToRoadmap,
}

export type { FeedbackPayload, ConversionData, ConversionPreview }
