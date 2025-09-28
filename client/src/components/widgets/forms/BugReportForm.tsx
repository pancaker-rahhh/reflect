import { useState } from 'react'
import { Bug } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BugReportFormProps {
  onSubmit: (data: {
    title: string
    description: string
    severity: string
    category: string
    stepsToReproduce?: string
  }) => Promise<void>
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

const severityOptions = [
  { value: 'low', label: 'Low', icon: '🟢', description: 'Minor issue, workaround available' },
  {
    value: 'medium',
    label: 'Medium',
    icon: '🟡',
    description: 'Noticeable issue affecting some users',
  },
  { value: 'high', label: 'High', icon: '🟠', description: 'Major issue affecting many users' },
  {
    value: 'critical',
    label: 'Critical',
    icon: '🔴',
    description: 'Blocking issue, needs immediate attention',
  },
]

const categoryOptions = [
  { value: 'ui', label: 'User Interface', icon: '🎨' },
  { value: 'functionality', label: 'Functionality', icon: '⚙️' },
  { value: 'performance', label: 'Performance', icon: '⚡' },
  { value: 'data', label: 'Data/Content', icon: '📊' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'other', label: 'Other', icon: '❓' },
]

export function BugReportForm({ onSubmit, isSubmitting, colors, content }: BugReportFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('')
  const [category, setCategory] = useState('')
  const [stepsToReproduce, setStepsToReproduce] = useState('')

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !severity || !category) return

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      severity,
      category,
      stepsToReproduce: stepsToReproduce.trim() || undefined,
    })
  }

  const isFormValid = title.trim() && description.trim() && severity && category

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
          style={{
            backgroundColor: `${colors.primary}15`,
            border: `2px solid ${colors.primary}30`,
          }}
        >
          <Bug className="w-8 h-8" style={{ color: colors.primary }} />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
          Report a Bug
        </h3>
        <p className="text-sm opacity-70" style={{ color: colors.text }}>
          Help us fix issues by providing detailed information
        </p>
      </div>

      <div className="space-y-5">
        {/* Bug Title */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
            <span className="flex items-center gap-2">
              📝 Issue Title <span className="text-red-500">*</span>
            </span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief, clear description of the bug (e.g., 'Login button not working')..."
            className="w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm"
            style={{
              borderColor: title.trim() ? colors.primary : '#E5E7EB',
              backgroundColor: colors.background,
              color: colors.text,
              boxShadow: title.trim() ? `0 0 0 3px ${colors.primary}20` : 'none',
            }}
            disabled={isSubmitting}
            maxLength={100}
          />
          <div className="text-right text-xs mt-1 opacity-60" style={{ color: colors.text }}>
            {title.length}/100
          </div>
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
                  'p-3 rounded-lg border text-left transition-all text-xs',
                  category === option.value ? 'border-2' : 'border hover:border-gray-300'
                )}
                style={{
                  borderColor: category === option.value ? colors.primary : '#E5E7EB',
                  backgroundColor:
                    category === option.value ? `${colors.primary}10` : colors.background,
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

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
            Severity *
          </label>
          <div className="space-y-2">
            {severityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSeverity(option.value)}
                disabled={isSubmitting}
                className={cn(
                  'w-full p-3 rounded-lg border text-left transition-all',
                  severity === option.value ? 'border-2' : 'border hover:border-gray-300'
                )}
                style={{
                  borderColor: severity === option.value ? colors.primary : '#E5E7EB',
                  backgroundColor:
                    severity === option.value ? `${colors.primary}10` : colors.background,
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
            Detailed Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened when you encountered the bug. What did you expect to happen instead?"
            className="w-full h-24 p-4 border-2 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm"
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: colors.background,
              color: colors.text,
            }}
            disabled={isSubmitting}
            maxLength={500}
          />
          <div className="text-right text-xs mt-1 opacity-60" style={{ color: colors.text }}>
            {description.length}/500
          </div>
        </div>

        {/* Steps to Reproduce */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
            Steps to Reproduce (Optional)
          </label>
          <textarea
            value={stepsToReproduce}
            onChange={(e) => setStepsToReproduce(e.target.value)}
            placeholder="1. Go to the login page&#10;2. Enter your email and password&#10;3. Click the login button&#10;4. Notice the error message appears"
            className="w-full h-24 p-4 border-2 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm"
            style={{
              borderColor: '#E5E7EB',
              backgroundColor: colors.background,
              color: colors.text,
            }}
            disabled={isSubmitting}
            maxLength={300}
          />
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
              <span>Submitting Bug Report...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Bug className="w-5 h-5" />
              <span>{content.submitButtonText}</span>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
