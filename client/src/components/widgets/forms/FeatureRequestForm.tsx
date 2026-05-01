import { useState, useEffect } from 'react'
import { Lightbulb, ChevronUp, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExistingFeature {
  id: string
  title: string
  description: string
  category: string
  priority: string
  upvotes: number
  hasUserUpvoted: boolean
}

interface FeatureRequestFormProps {
  onSubmit: (data: { description: string; priority: string; useCase: string }) => Promise<void>
  onUpvote?: (featureId: string) => Promise<void>
  widgetKey?: string
  isSubmitting?: boolean
  showExistingFeatures?: boolean
  colors: {
    primary: string
    background: string
    text: string
    buttonColor: string
    buttonTextColor: string
  }
  content: {
    mainQuestion: string
    submitButtonText: string
  }
}

const priorityOptions = [
  {
    value: 'low',
    label: 'Nice to Have',
    icon: '😌',
    description: 'Would be helpful but not essential',
  },
  {
    value: 'medium',
    label: 'Important',
    icon: '😊',
    description: 'Would significantly improve experience',
  },
  {
    value: 'high',
    label: 'Critical',
    icon: '🚀',
    description: 'Essential for workflow/success',
  },
]

const categoryOptions = [
  { value: 'ui_ux', label: 'Interface & Design', icon: '🎨' },
  { value: 'functionality', label: 'New Feature', icon: '⚡' },
  { value: 'integration', label: 'Integration', icon: '🔗' },
  { value: 'performance', label: 'Performance', icon: '📈' },
  { value: 'mobile', label: 'Mobile Experience', icon: '📱' },
  { value: 'accessibility', label: 'Accessibility', icon: '♿' },
  { value: 'automation', label: 'Automation', icon: '🤖' },
  { value: 'analytics', label: 'Analytics & Reporting', icon: '📊' },
  { value: 'security', label: 'Security & Privacy', icon: '🔒' },
  { value: 'other', label: 'Other', icon: '💡' },
]

export function FeatureRequestForm({
  onSubmit,
  widgetKey,
  isSubmitting,
  showExistingFeatures = true,
  colors,
  content,
}: FeatureRequestFormProps) {
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('')
  const [existingFeatures, setExistingFeatures] = useState<ExistingFeature[]>([])
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true)
  const [votingFeatures, setVotingFeatures] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadExistingFeatures()
  }, [widgetKey])

  const loadExistingFeatures = async () => {
    if (!widgetKey || widgetKey.trim() === '') {
      setIsLoadingFeatures(false)
      return
    }

    try {
      const apiBaseUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://reflect-production-9b79.up.railway.app/api/v1'
          : 'http://localhost:8000/api/v1'

      const response = await fetch(`${apiBaseUrl}/public/widgets/features/${widgetKey}`)

      if (response.ok) {
        const features = await response.json()
        setExistingFeatures(features)
      } else {
        // Fallback to sample data if API fails
        setExistingFeatures([
          {
            id: '1',
            title: 'Dark Mode Support',
            description: 'Add a dark theme option for better nighttime usage',
            category: 'ui_ux',
            priority: 'medium',
            upvotes: 23,
            hasUserUpvoted: false,
          },
          {
            id: '2',
            title: 'Mobile App',
            description: 'Create a mobile application for iOS and Android',
            category: 'functionality',
            priority: 'high',
            upvotes: 45,
            hasUserUpvoted: true,
          },
        ])
      }
    } catch (error) {
      console.error('Failed to load features:', error)
      // Fallback to empty array
      setExistingFeatures([])
    } finally {
      setIsLoadingFeatures(false)
    }
  }

  const handleUpvote = async (featureId: string) => {
    if (!widgetKey || widgetKey.trim() === '' || votingFeatures.has(featureId)) return

    // Add feature to voting set to prevent duplicate clicks
    setVotingFeatures((prev) => new Set([...prev, featureId]))

    try {
      const apiBaseUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://reflect-production-9b79.up.railway.app/api/v1'
          : 'http://localhost:8000/api/v1'

      const response = await fetch(`${apiBaseUrl}/public/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: featureId,
          itemType: 'feature_request',
          widgetKey,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // Update local state with exact response from server
        setExistingFeatures((prev) =>
          prev.map((feature) =>
            feature.id === featureId
              ? {
                  ...feature,
                  upvotes: result.newVoteCount,
                  hasUserUpvoted: result.hasUserVoted,
                }
              : feature
          )
        )
      } else {
        console.error('Failed to upvote feature')
      }
    } catch (error) {
      console.error('Failed to upvote feature:', error)
    } finally {
      // Remove feature from voting set
      setVotingFeatures((prev) => {
        const newSet = new Set(prev)
        newSet.delete(featureId)
        return newSet
      })
    }
  }

  const handleSubmit = async () => {
    if (!description.trim() || !priority) return

    await onSubmit({
      description: description.trim(),
      priority: priority,
      useCase: description.trim(),
    })
  }

  const isFormValid = description.trim() && priority

  const getCategoryIcon = (categoryValue: string) => {
    const category = categoryOptions.find((opt) => opt.value === categoryValue)
    return category?.icon || '💡'
  }

  // Render existing features list section
  const renderFeatureList = () => {
    if (isLoadingFeatures) {
      return (
        <div className="space-y-3 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      )
    }

    if (existingFeatures.length === 0) {
      return null
    }

    return (
      <div className="mb-6 pb-6 border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center gap-2 mb-3">
          <List className="w-4 h-4" style={{ color: colors.primary }} />
          <h3 className="text-sm font-semibold" style={{ color: colors.text }}>
            Requested Features
          </h3>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {existingFeatures.map((feature) => (
            <div
              key={feature.id}
              className="p-3 border rounded-lg transition-all hover:shadow-sm"
              style={{
                borderColor: '#E5E7EB',
                backgroundColor: colors.background,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{getCategoryIcon(feature.category)}</span>
                    <h4 className="font-medium text-xs truncate" style={{ color: colors.text }}>
                      {feature.title}
                    </h4>
                  </div>
                  <p className="text-xs opacity-70 line-clamp-2" style={{ color: colors.text }}>
                    {feature.description}
                  </p>
                </div>
                <button
                  onClick={() => handleUpvote(feature.id)}
                  disabled={votingFeatures.has(feature.id)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md transition-all flex-shrink-0',
                    !votingFeatures.has(feature.id) && 'hover:scale-105',
                    votingFeatures.has(feature.id) && 'opacity-50 cursor-not-allowed'
                  )}
                  style={{
                    backgroundColor: feature.hasUserUpvoted ? `${colors.primary}20` : '#F3F4F6',
                    color: feature.hasUserUpvoted ? colors.primary : colors.text,
                  }}
                >
                  {votingFeatures.has(feature.id) ? (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ChevronUp className="w-3 h-3" />
                  )}
                  <span className="text-xs font-semibold">{feature.upvotes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render create form
  const renderCreateForm = () => (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" style={{ color: colors.primary }} />
          <p className="text-sm font-medium" style={{ color: colors.text }}>
            Request a Feature
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Feature Description */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            <span className="flex items-center gap-2">
              💡 What feature do you want? <span className="text-red-500">*</span>
            </span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the feature you'd like to see. What would it do? How would it help you?"
            className="w-full h-32 p-4 border-2 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm"
            style={{
              borderColor: description.trim() ? colors.primary : '#E5E7EB',
              backgroundColor: colors.background,
              color: colors.text,
              boxShadow: description.trim() ? `0 0 0 3px ${colors.primary}20` : 'none',
            }}
            disabled={isSubmitting}
            maxLength={400}
          />
          <div className="text-right text-xs mt-1 opacity-60" style={{ color: colors.text }}>
            {description.length}/400
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
            Priority *
          </label>
          <div className="space-y-2">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPriority(option.value)}
                disabled={isSubmitting}
                className={cn(
                  'w-full p-3 rounded-lg border text-left transition-all',
                  priority === option.value ? 'border-2' : 'border hover:border-gray-300'
                )}
                style={{
                  borderColor: priority === option.value ? colors.primary : '#E5E7EB',
                  backgroundColor:
                    priority === option.value ? `${colors.primary}10` : colors.background,
                  color: colors.text,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{option.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs opacity-70">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transform"
          style={{
            backgroundColor: colors.buttonColor,
            color: colors.buttonTextColor,
            boxShadow: `0 4px 12px ${colors.buttonColor}30`,
          }}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            content.submitButtonText
          )}
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {showExistingFeatures && renderFeatureList()}
      {renderCreateForm()}
    </div>
  )
}
