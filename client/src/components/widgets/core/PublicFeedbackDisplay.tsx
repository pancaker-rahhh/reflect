import { useEffect, useState } from 'react'

interface PublicFeedbackData {
  id: string
  feedback_type?: string
  rating?: number
  message?: string
  created_at?: string
  feedback_votes?: number
  overall_rating?: number
  pros?: string
  cons?: string
  title?: string
  severity?: string
  severity_level?: string // Add missing property
  steps_to_reproduce?: string
  expected_result?: string
  actual_result?: string
  // Feature request specific fields (from FeatureRequestPublic)
  description?: string
  category?: string
  priority?: string
  upvotes?: number
  hasUserUpvoted?: boolean
}

interface PublicFeedbackDisplayProps {
  feedbackType: 'REVIEW' | 'BUG_REPORT' | 'FEEDBACK' | 'FEATURE_REQUEST'
  widgetKey: string
  colors: {
    primary: string
    background: string
    text: string
    buttonColor: string
    buttonTextColor: string
  }
}

export function PublicFeedbackDisplay({
  feedbackType,
  widgetKey,
  colors,
}: PublicFeedbackDisplayProps) {
  const [data, setData] = useState<PublicFeedbackData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votingItems, setVotingItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPublicData()
  }, [feedbackType, widgetKey])

  const fetchPublicData = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
      let endpoint = ''

      switch (feedbackType) {
        case 'REVIEW':
          endpoint = `${apiBaseUrl}/public/widgets/${widgetKey}/reviews`
          break
        case 'BUG_REPORT':
          endpoint = `${apiBaseUrl}/public/widgets/${widgetKey}/bug-reports`
          break
        case 'FEATURE_REQUEST':
          endpoint = `${apiBaseUrl}/public/widgets/${widgetKey}/features`
          break
        case 'FEEDBACK':
        default:
          endpoint = `${apiBaseUrl}/public/widgets/${widgetKey}/feedback?feedback_type=${feedbackType.toLowerCase()}`
          break
      }

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const voteFeedback = async (feedbackId: string) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

      let endpoint = ''
      let payload: any = { widgetKey, feedbackId }

      if (feedbackType === 'FEATURE_REQUEST') {
        endpoint = `${apiBaseUrl}/public/features/upvote`
        payload = { widgetKey, featureId: feedbackId }
      } else {
        endpoint = `${apiBaseUrl}/public/feedback/upvote`
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.')
        }
        throw new Error('Failed to vote. Please try again.')
      }

      const result = await response.json()
      return result
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Vote failed')
    }
  }

  const handleVote = async (featureId: string) => {
    if (votingItems.has(featureId)) return

    const currentItem = data.find((item) => item.id === featureId)
    if (!currentItem) return

    setVotingItems((prev) => new Set(prev).add(featureId))

    const currentVotes =
      feedbackType === 'FEATURE_REQUEST'
        ? currentItem.upvotes || 0
        : currentItem.feedback_votes || 0
    const hasVoted = currentItem.hasUserUpvoted

    const optimisticUpdate = {
      [feedbackType === 'FEATURE_REQUEST' ? 'upvotes' : 'feedback_votes']: hasVoted
        ? currentVotes - 1
        : currentVotes + 1,
      hasUserUpvoted: !hasVoted,
    }

    setData((prevData) =>
      prevData.map((item) => (item.id === featureId ? { ...item, ...optimisticUpdate } : item))
    )

    try {
      const result = await voteFeedback(featureId)

      setData((prevData) =>
        prevData.map((item) =>
          item.id === featureId
            ? {
                ...item,
                [feedbackType === 'FEATURE_REQUEST' ? 'upvotes' : 'feedback_votes']:
                  result.newVoteCount,
                hasUserUpvoted: result.hasUserVoted,
              }
            : item
        )
      )
    } catch (err) {
      setData((prevData) =>
        prevData.map((item) => (item.id === featureId ? { ...item, ...currentItem } : item))
      )
      console.error('Vote failed:', err)
    } finally {
      setVotingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(featureId)
        return newSet
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'Unknown date'
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: colors.primary }}
        ></div>
        <span className="ml-3 text-gray-600">Loading {feedbackType.toLowerCase()}s...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">⚠️ {error}</div>
        <button
          onClick={fetchPublicData}
          className="px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: colors.primary, color: colors.buttonTextColor }}
        >
          Try Again
        </button>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📝</div>
        <div>No {feedbackType.toLowerCase()}s yet</div>
        <div className="text-sm mt-1">Be the first to share your thoughts!</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-1" style={{ color: colors.text }}>
          Recent{' '}
          {feedbackType === 'REVIEW'
            ? 'Reviews'
            : feedbackType === 'BUG_REPORT'
              ? 'Bug Reports'
              : feedbackType === 'FEATURE_REQUEST'
                ? 'Feature Requests'
                : 'Feedback'}
        </h3>
        <p className="text-sm text-gray-600">
          Showing {data.length} {feedbackType.toLowerCase()}
          {data.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {data.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-lg border border-gray-200 bg-white/50 backdrop-blur-sm"
            style={{ borderColor: `${colors.primary}20` }}
          >
            {/* Header with rating and date */}
            <div className="flex items-center justify-between mb-3">
              {item.rating && (
                <div className="flex items-center space-x-2">{renderStars(item.rating)}</div>
              )}
              {item.created_at && (
                <span className="text-xs text-gray-500">{formatDate(item.created_at)}</span>
              )}
            </div>

            {/* Content */}
            {item.title && (
              <h4 className="font-medium mb-2" style={{ color: colors.text }}>
                {item.title}
              </h4>
            )}

            {item.message && <p className="text-sm text-gray-700 mb-2">{item.message}</p>}

            {/* Type-specific fields */}
            {feedbackType === 'REVIEW' && (
              <div className="space-y-2">
                {item.pros && (
                  <div className="text-sm">
                    <span className="font-medium text-green-600">👍 Pros:</span> {item.pros}
                  </div>
                )}
                {item.cons && (
                  <div className="text-sm">
                    <span className="font-medium text-red-600">👎 Cons:</span> {item.cons}
                  </div>
                )}
              </div>
            )}

            {feedbackType === 'BUG_REPORT' && (
              <div className="space-y-2">
                {(item.severity_level || item.severity) && (
                  <div className="text-sm">
                    <span className="font-medium">Severity:</span>{' '}
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        (item.severity_level || item.severity) === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : (item.severity_level || item.severity) === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : (item.severity_level || item.severity) === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.severity_level || item.severity}
                    </span>
                  </div>
                )}
                {item.actual_result && (
                  <div className="text-sm">
                    <span className="font-medium">Issue:</span> {item.actual_result}
                  </div>
                )}
                {item.steps_to_reproduce && (
                  <div className="text-sm">
                    <span className="font-medium">Steps:</span> {item.steps_to_reproduce}
                  </div>
                )}
              </div>
            )}

            {feedbackType === 'FEATURE_REQUEST' && (
              <div className="space-y-2">
                {item.priority && (
                  <div className="text-sm">
                    <span className="font-medium">Priority:</span>{' '}
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : item.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                )}
                {item.category && (
                  <div className="text-sm">
                    <span className="font-medium">Category:</span> {item.category}
                  </div>
                )}
                {item.description && (
                  <div className="text-sm">
                    <span className="font-medium">Description:</span> {item.description}
                  </div>
                )}
              </div>
            )}

            {/* Footer with votes */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-1 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                <span className="text-sm transition-all duration-200">
                  {feedbackType === 'FEATURE_REQUEST'
                    ? item.upvotes || 0
                    : item.feedback_votes || 0}{' '}
                  votes
                </span>
              </div>

              <button
                onClick={() => handleVote(item.id)}
                disabled={votingItems.has(item.id)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  item.hasUserUpvoted
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${votingItems.has(item.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  backgroundColor: item.hasUserUpvoted ? `${colors.primary}20` : undefined,
                  color: item.hasUserUpvoted ? colors.primary : undefined,
                }}
              >
                {votingItems.has(item.id) ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                )}
                <span>{item.hasUserUpvoted ? 'Voted' : 'Vote'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Refresh button */}
      <div className="text-center pt-4">
        <button
          onClick={fetchPublicData}
          className="px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 transition-colors"
          style={{ color: colors.text }}
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  )
}
