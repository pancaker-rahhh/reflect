/**
 * API service for handling public feedback submissions.
 */

// Define the shape of the data we'll send to the backend
interface FeedbackPayload {
  widgetKey: string
  response: string // The actual feedback text
  // You could add more data here later, like user agent, current URL, etc.
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
    // Try to get a meaningful error message from the backend
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Submission failed with an unknown error.' }))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  // We don't need to return anything on success
}

export const feedbackApi = {
  submit,
}
