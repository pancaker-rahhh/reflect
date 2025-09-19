import { apiClient } from '../client'

interface FeedbackPayload {
  widgetKey: string
  response: string
  rating?: number
  feedbackType?: string
}

interface ConversionData {
  column_id?: string
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
    if (response.status === 403) {
      try {
        const errorData = await response.json()
        if (errorData?.detail?.error === 'Response limit exceeded') {
          throw new Error(
            "Thank you for your feedback! We've received your message and will review it soon."
          )
        }
      } catch (parseError) {
        throw new Error(
          "Thank you for your feedback! We've received your message and will review it soon."
        )
      }
    }

    if (response.status === 429) {
      try {
        const errorData = await response.json()
        const retryAfter = response.headers.get('Retry-After')
        const retrySeconds = retryAfter ? parseInt(retryAfter) : 60
        const retryMinutes = Math.ceil(retrySeconds / 60)

        const message = errorData?.detail?.message || errorData?.message || 'Too many requests'
        throw new Error(
          `${message}. Please try again in ${retryMinutes} minute${retryMinutes !== 1 ? 's' : ''}.`
        )
      } catch (parseError) {
        const retryAfter = response.headers.get('Retry-After')
        const retrySeconds = retryAfter ? parseInt(retryAfter) : 60
        const retryMinutes = Math.ceil(retrySeconds / 60)
        throw new Error(
          `Too many requests. Please try again in ${retryMinutes} minute${
            retryMinutes !== 1 ? 's' : ''
          }.`
        )
      }
    }

    const errorData = await response
      .json()
      .catch(() => ({ message: 'Submission failed with an unknown error.' }))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }
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

async function bulkConvertToRoadmap(
  feedbackIds: string[],
  conversionData: ConversionData
): Promise<any> {
  return apiClient.post('/feedback/bulk-convert', {
    feedback_ids: feedbackIds,
    ...conversionData,
  })
}

export const feedbackApi = {
  submit,
  getActionableFeedback,
  getConversionPreview,
  convertToRoadmap,
  bulkConvertToRoadmap,
}

export type { FeedbackPayload, ConversionData, ConversionPreview }
