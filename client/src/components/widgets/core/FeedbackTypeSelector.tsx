import { cn } from '@/lib/utils'
import type {
  FeedbackTypeSelectorProps,
  FeedbackType,
} from './types'
import { FEEDBACK_TYPE_INFO } from './types'

interface EnhancedMenuButtonProps {
  onClick: () => void
  icon: string
  title: string
  description: string
  color: string
  bgColor: string
  index: number
  textColor: string
}

function EnhancedMenuButton({
  onClick,
  icon,
  title,
  description,
  color,
  bgColor,
  index,
  textColor,
}: EnhancedMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left p-5 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95 border-2 overflow-hidden"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: '#E5E7EB',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        animationDelay: `${index * 100}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = bgColor
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.boxShadow = `0 10px 25px ${color}20, 0 4px 10px rgba(0,0,0,0.1)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
        e.currentTarget.style.borderColor = '#E5E7EB'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      {/* Background gradient effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${bgColor}, ${color}10)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center space-x-4">
        {/* Icon with animation */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {icon}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold text-base transition-colors duration-300"
            style={{ color: textColor }}
          >
            {title}
          </div>
          <div
            className="text-sm mt-1 opacity-70 transition-colors duration-300"
            style={{ color: textColor }}
          >
            {description}
          </div>
        </div>

        {/* Arrow indicator */}
        <div
          className="flex-shrink-0 transition-all duration-300 group-hover:translate-x-1 opacity-60"
          style={{ color: textColor }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="transition-transform duration-300 group-hover:scale-110"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Ripple effect */}
      <div
        className="absolute inset-0 rounded-2xl animate-ping opacity-0 group-hover:opacity-30 transition-opacity duration-300"
        style={{ backgroundColor: color }}
      />
    </button>
  )
}

export function FeedbackTypeSelector({ 
  availableTypes, 
  onSelectType, 
  config 
}: FeedbackTypeSelectorProps) {
  const theme = config.appearance
  const textColor = theme.colors.text

  const getTypeColor = (type: FeedbackType): { color: string; bgColor: string } => {
    switch (type) {
      case 'BUG_REPORT':
        return { color: 'hsl(var(--metric-pink))', bgColor: 'hsl(var(--metric-pink))' }
      case 'FEATURE_REQUEST':
        return { color: 'hsl(var(--metric-orange))', bgColor: 'hsl(var(--metric-orange))' }
      case 'REVIEW':
        return { color: 'hsl(var(--metric-green))', bgColor: 'hsl(var(--metric-green))' }
      case 'NPS':
        return { color: 'hsl(var(--metric-purple))', bgColor: 'hsl(var(--metric-purple))' }
      case 'CSAT':
        return { color: 'hsl(var(--metric-blue))', bgColor: 'hsl(var(--metric-blue))' }
      case 'CES':
        return { color: 'hsl(var(--metric-amber))', bgColor: 'hsl(var(--metric-amber))' }
      case 'FEEDBACK':
      case 'SURVEY':
      default:
        return { color: theme.colors.primary, bgColor: 'hsl(var(--secondary))' }
    }
  }

  const availableModules = availableTypes.map(type => {
    const info = FEEDBACK_TYPE_INFO[type]
    const colors = getTypeColor(type)
    return {
      type,
      title: info.title,
      description: info.description,
      icon: info.icon,
      ...colors,
    }
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="text-3xl mb-2">🎯</div>
        <h3 className="text-xl font-semibold" style={{ color: textColor }}>
          What can we help with?
        </h3>
        <p className="text-sm opacity-70" style={{ color: textColor }}>
          Choose an option below to get started
        </p>
      </div>

      {/* Enhanced Grid Layout */}
      <div
        className={cn(
          'grid gap-4',
          availableModules.length === 1 && 'grid-cols-1',
          availableModules.length === 2 && 'grid-cols-2',
          availableModules.length > 2 && 'grid-cols-1 sm:grid-cols-2'
        )}
      >
        {availableModules.map((module, index) => (
          <EnhancedMenuButton
            key={module.type}
            onClick={() => onSelectType(module.type)}
            icon={module.icon}
            title={module.title}
            description={module.description}
            color={module.color}
            bgColor={module.bgColor}
            index={index}
            textColor={textColor}
          />
        ))}
      </div>

      {/* Skip Section - Only show if we have the primary survey type available */}
      {availableTypes.includes(config.primaryType) && (
        <div className="pt-6 border-t border-gray-100 text-center">
          <button
            onClick={() => onSelectType(config.primaryType)}
            className="inline-flex items-center space-x-2 text-sm font-medium opacity-70 hover:opacity-100 transition-all duration-200 px-4 py-2 rounded-lg hover:bg-gray-50"
            style={{ color: textColor }}
          >
            <span>{FEEDBACK_TYPE_INFO[config.primaryType].icon}</span>
            <span>Start with {FEEDBACK_TYPE_INFO[config.primaryType].title}</span>
          </button>
        </div>
      )}

      {/* Alternative: Skip all feedback */}
      <div className="text-center">
        <p className="text-xs opacity-60" style={{ color: textColor }}>
          Or you can close this widget if you don&apos;t need to provide feedback right now
        </p>
      </div>
    </div>
  )
}

// Simple version for basic use cases
export function SimpleFeedbackTypeSelector({ 
  availableTypes, 
  onSelectType, 
  config 
}: FeedbackTypeSelectorProps) {
  const theme = config.appearance
  const textColor = theme.colors.text

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold text-center" style={{ color: textColor }}>
        How can we help?
      </h3>
      
      <div className="space-y-2">
        {availableTypes.map((type) => {
          const info = FEEDBACK_TYPE_INFO[type]
          return (
            <button
              key={type}
              onClick={() => onSelectType(type)}
              className="w-full flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              style={{ borderColor: theme.colors.primary + '20' }}
            >
              <span className="text-xl">{info.icon}</span>
              <div className="text-left">
                <div className="font-medium" style={{ color: textColor }}>
                  {info.title}
                </div>
                <div className="text-sm opacity-70" style={{ color: textColor }}>
                  {info.description}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}