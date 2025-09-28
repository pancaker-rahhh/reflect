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
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'upvotes' | 'newest' | 'oldest'>('upvotes')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetchPublicData()
  }, [feedbackType, widgetKey])

  const fetchPublicData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!widgetKey || widgetKey.trim() === '') {
        setData([])
        setLoading(false)
        return
      }

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
        // If 404 or empty, just set empty array instead of error
        if (response.status === 404) {
          setData([])
          return
        }
        throw new Error(`Failed to fetch data: ${response.status}`)
      }

      const result = await response.json()
      setData(Array.isArray(result) ? result : [])
    } catch (err) {
      // Don't set error for network issues, just show empty state
      setData([])
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

  const PlaceholderCard = () => (
    <div
      className="p-4 rounded-lg border border-gray-200 bg-white/50 backdrop-blur-sm animate-pulse"
      style={{ borderColor: `${colors.primary}20` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-3/5 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-4/5 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-2/5 bg-gray-200 rounded" />
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-7 w-16 bg-gray-200 rounded-full" />
      </div>
    </div>
  )

  const shouldShowPlaceholders = loading

  // Filter and sort data
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.message?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower)
    )
  })

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'upvotes':
        const aVotes = feedbackType === 'FEATURE_REQUEST' ? a.upvotes || 0 : a.feedback_votes || 0
        const bVotes = feedbackType === 'FEATURE_REQUEST' ? b.upvotes || 0 : b.feedback_votes || 0
        return bVotes - aVotes
      case 'newest':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      case 'oldest':
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      default:
        return 0
    }
  })

  const displayData = showAll ? sortedData : sortedData.slice(0, 10)

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder={`Search ${
            feedbackType === 'BUG_REPORT'
              ? 'bugs'
              : feedbackType === 'FEATURE_REQUEST'
                ? 'features'
                : 'items'
          }...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            borderColor: '#E5E7EB',
            backgroundColor: colors.background,
            color: colors.text,
          }}
        />

        <div className="flex items-center justify-between">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'upvotes' | 'newest' | 'oldest')}
            className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: colors.background,
              color: colors.text,
            }}
          >
            <option value="upvotes">Most Upvoted</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <div className="text-sm text-gray-600">
            {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {shouldShowPlaceholders ? (
          [1, 2, 3].map((i) => <PlaceholderCard key={i} />)
        ) : displayData.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">
              {searchTerm
                ? '🔍'
                : feedbackType === 'BUG_REPORT'
                  ? '🐛'
                  : feedbackType === 'FEATURE_REQUEST'
                    ? '💡'
                    : '📝'}
            </div>
            <h4 className="text-xl font-bold mb-3" style={{ color: colors.text }}>
              {searchTerm
                ? 'No matching items found'
                : feedbackType === 'BUG_REPORT'
                  ? 'No bug reports yet'
                  : feedbackType === 'FEATURE_REQUEST'
                    ? 'No feature requests yet'
                    : 'No items yet'}
            </h4>
            <p className="text-base text-gray-600 mb-4">
              {searchTerm
                ? 'Try a different search term or check your spelling'
                : feedbackType === 'BUG_REPORT'
                  ? "🎉 You're the first! Help others by reporting bugs you encounter"
                  : feedbackType === 'FEATURE_REQUEST'
                    ? "🚀 You're the first! Share features you'd love to see"
                    : 'Be the first to share your feedback!'}
            </p>
            {!searchTerm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong>{' '}
                  {feedbackType === 'BUG_REPORT'
                    ? 'Include steps to reproduce the bug for faster fixes'
                    : 'Describe how the feature would help you and others'}
                </p>
              </div>
            )}
          </div>
        ) : (
          displayData.map((item) => (
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

              {/* Footer with votes and quick actions */}
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

                <div className="flex items-center space-x-2">
                  {/* Quick Upvote Button */}
                  <button
                    onClick={() => handleVote(item.id)}
                    disabled={votingItems.has(item.id)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      item.hasUserUpvoted
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${
                      votingItems.has(item.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    style={{
                      backgroundColor: item.hasUserUpvoted ? `${colors.primary}20` : undefined,
                      color: item.hasUserUpvoted ? colors.primary : undefined,
                    }}
                  >
                    {votingItems.has(item.id) ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    )}
                    <span className="font-semibold">
                      {item.hasUserUpvoted ? '👍 Voted' : '👍 Vote'}
                    </span>
                  </button>

                  {/* Quick View Button */}
                  <button className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More / Refresh buttons */}
      <div className="flex justify-center gap-2 pt-4">
        {!showAll && sortedData.length > 10 && (
          <button
            onClick={() => setShowAll(true)}
            className="px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 transition-colors"
            style={{ color: colors.text }}
          >
            Load More ({sortedData.length - 10} more)
          </button>
        )}
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
