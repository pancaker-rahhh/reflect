import { useState, useEffect } from 'react'
import { Lightbulb, ChevronUp, Plus, List } from 'lucide-react'
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
  onSubmit: (data: { 
    title: string
    description: string
    category: string
    priority: string
    useCase: string
  }) => Promise<void>
  onUpvote?: (featureId: string) => Promise<void>
  widgetKey?: string
  isSubmitting?: boolean
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
    description: 'Would be helpful but not essential' 
  },
  { 
    value: 'medium', 
    label: 'Important', 
    icon: '😊', 
    description: 'Would significantly improve experience' 
  },
  { 
    value: 'high', 
    label: 'Critical', 
    icon: '🚀', 
    description: 'Essential for workflow/success' 
  }
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
  { value: 'other', label: 'Other', icon: '💡' }
]

export function FeatureRequestForm({ 
  onSubmit, 
  widgetKey,
  isSubmitting, 
  colors, 
  content 
}: FeatureRequestFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [useCase, setUseCase] = useState('')
  const [view, setView] = useState<'list' | 'create'>('list')
  const [existingFeatures, setExistingFeatures] = useState<ExistingFeature[]>([])
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true)
  const [votingFeatures, setVotingFeatures] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadExistingFeatures()
  }, [widgetKey])

  const loadExistingFeatures = async () => {
    if (!widgetKey) {
      setIsLoadingFeatures(false)
      return
    }
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
      
      const response = await fetch(`${apiBaseUrl}/public/widgets/${widgetKey}/features`)
      
      if (response.ok) {
        const features = await response.json()
        setExistingFeatures(features)
      } else {
        // Fallback to mock data if API fails
        setExistingFeatures([
          {
            id: '1',
            title: 'Dark Mode Support',
            description: 'Add a dark theme option for better nighttime usage',
            category: 'ui_ux',
            priority: 'medium',
            upvotes: 23,
            hasUserUpvoted: false
          },
          {
            id: '2', 
            title: 'Mobile App',
            description: 'Create a mobile application for iOS and Android',
            category: 'functionality',
            priority: 'high',
            upvotes: 45,
            hasUserUpvoted: true
          }
        ])
      }
    } catch (error) {
      console.error('Failed to load features:', error)
      // Fallback to empty array or mock data
      setExistingFeatures([])
    } finally {
      setIsLoadingFeatures(false)
    }
  }

  const handleUpvote = async (featureId: string) => {
    if (!widgetKey || votingFeatures.has(featureId)) return
    
    // Add feature to voting set to prevent duplicate clicks
    setVotingFeatures(prev => new Set([...prev, featureId]))
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
      
      const response = await fetch(`${apiBaseUrl}/public/features/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetKey,
          featureId
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Update local state with exact response from server
        setExistingFeatures(prev => prev.map(feature => 
          feature.id === featureId 
            ? { 
                ...feature, 
                upvotes: result.newVoteCount,
                hasUserUpvoted: result.hasUserVoted
              }
            : feature
        ))
      } else {
        console.error('Failed to upvote feature')
      }
    } catch (error) {
      console.error('Failed to upvote feature:', error)
    } finally {
      // Remove feature from voting set
      setVotingFeatures(prev => {
        const newSet = new Set(prev)
        newSet.delete(featureId)
        return newSet
      })
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category || !priority || !useCase.trim()) return
    
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      useCase: useCase.trim()
    })
  }

  const isFormValid = title.trim() && description.trim() && category && priority && useCase.trim()

  const getCategoryIcon = (categoryValue: string) => {
    const category = categoryOptions.find(opt => opt.value === categoryValue)
    return category?.icon || '💡'
  }

  const getPriorityColor = (priorityValue: string) => {
    const colorMap = {
      low: '#10B981',
      medium: '#F59E0B', 
      high: '#EF4444'
    }
    return colorMap[priorityValue as keyof typeof colorMap] || '#6B7280'
  }

  // Render feature list view
  const renderFeatureList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <List className="w-5 h-5" style={{ color: colors.primary }} />
          <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
            Requested Features
          </h3>
        </div>
        <button
          onClick={() => setView('create')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
          style={{ backgroundColor: colors.primary, color: colors.buttonTextColor }}
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {isLoadingFeatures ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : existingFeatures.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {existingFeatures.map((feature) => (
            <div
              key={feature.id}
              className="p-4 border-2 rounded-xl transition-all hover:shadow-md"
              style={{
                borderColor: '#E5E7EB',
                backgroundColor: colors.background,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getCategoryIcon(feature.category)}</span>
                    <h4 className="font-semibold text-sm" style={{ color: colors.text }}>
                      {feature.title}
                    </h4>
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${getPriorityColor(feature.priority)}20`,
                        color: getPriorityColor(feature.priority)
                      }}
                    >
                      {feature.priority}
                    </span>
                  </div>
                  <p className="text-xs opacity-70 mb-3" style={{ color: colors.text }}>
                    {feature.description}
                  </p>
                </div>
                <button
                  onClick={() => handleUpvote(feature.id)}
                  disabled={votingFeatures.has(feature.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
                    !votingFeatures.has(feature.id) && 'hover:scale-105',
                    feature.hasUserUpvoted ? 'bg-blue-100' : 'bg-gray-100',
                    votingFeatures.has(feature.id) && 'opacity-50 cursor-not-allowed'
                  )}
                  style={{
                    backgroundColor: feature.hasUserUpvoted ? `${colors.primary}20` : '#F3F4F6',
                    color: feature.hasUserUpvoted ? colors.primary : colors.text
                  }}
                >
                  {votingFeatures.has(feature.id) ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                  <span className="text-xs font-semibold">{feature.upvotes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: colors.text }} />
          <p className="text-sm opacity-70" style={{ color: colors.text }}>
            No feature requests yet. Be the first to suggest one!
          </p>
        </div>
      )}
    </div>
  )

  // Render create form view
  const renderCreateForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" style={{ color: colors.primary }} />
          <p className="text-sm font-medium" style={{ color: colors.text }}>
            {content.mainQuestion}
          </p>
        </div>
        <button
          onClick={() => setView('list')}
          className="text-sm opacity-70 hover:opacity-100 transition-all"
          style={{ color: colors.text }}
        >
          ← Back to list
        </button>
      </div>

      <div className="space-y-4">
        {/* Feature Title */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
            Feature Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief, descriptive name for your feature idea"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm"
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: colors.background,
              color: colors.text,
            }}
            disabled={isSubmitting}
            maxLength={80}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
            Category *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categoryOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategory(option.value)}
                disabled={isSubmitting}
                className={cn(
                  'p-2 rounded-lg border text-left transition-all text-xs',
                  category === option.value
                    ? 'border-2'
                    : 'border hover:border-gray-300'
                )}
                style={{
                  borderColor: category === option.value ? colors.primary : '#E5E7EB',
                  backgroundColor: category === option.value ? `${colors.primary}10` : colors.background,
                  color: colors.text,
                }}
              >
                <div className="flex items-center gap-2">
                  <span>{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
              </button>
            ))}
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
                  priority === option.value
                    ? 'border-2'
                    : 'border hover:border-gray-300'
                )}
                style={{
                  borderColor: priority === option.value ? colors.primary : '#E5E7EB',
                  backgroundColor: priority === option.value ? `${colors.primary}10` : colors.background,
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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
            Feature Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this feature would do and how it would work..."
            className="w-full h-20 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm"
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: colors.background,
              color: colors.text,
            }}
            disabled={isSubmitting}
            maxLength={400}
          />
          <div className="text-right text-xs mt-1 opacity-60" style={{ color: colors.text }}>
            {description.length}/400
          </div>
        </div>

        {/* Use Case */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
            Use Case & Benefits *
          </label>
          <textarea
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            placeholder="How would this feature help you? What problem would it solve? Who would benefit?"
            className="w-full h-16 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm"
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: colors.background,
              color: colors.text,
            }}
            disabled={isSubmitting}
            maxLength={300}
          />
          <div className="text-right text-xs mt-1 opacity-60" style={{ color: colors.text }}>
            {useCase.length}/300
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: colors.buttonColor, 
            color: colors.buttonTextColor 
          }}
        >
          {isSubmitting ? 'Submitting...' : content.submitButtonText}
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {view === 'list' ? renderFeatureList() : renderCreateForm()}
    </div>
  )
}