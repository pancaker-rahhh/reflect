import { MessageCircle, Star, Bug, Lightbulb } from 'lucide-react'
import type { WidgetFormData } from '@/pages/WidgetCreate'
import { cn } from '@/lib/utils'

interface TriggerIconPreviewProps {
  formData: WidgetFormData
  onClick: () => void
  isActive: boolean
}

export function TriggerIconPreview({ formData, onClick, isActive }: TriggerIconPreviewProps) {
  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'bottom_right':
        return 'bottom-6 right-6'
      case 'bottom_left':
        return 'bottom-6 left-6'
      case 'top_right':
        return 'top-6 right-6'
      case 'top_left':
        return 'top-6 left-6'
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      default:
        return 'bottom-6 right-6'
    }
  }

  const getWidgetIcon = () => {
    const { modules } = formData
    
    if (modules?.reviews) return <Star className="w-5 h-5" />
    if (modules?.bugReporting) return <Bug className="w-5 h-5" />
    if (modules?.featureRequests) return <Lightbulb className="w-5 h-5" />
    
    // Default to feedback icon
    return <MessageCircle className="w-5 h-5" />
  }

  const getTriggerText = () => {
    const { modules, primaryType } = formData
    
    if (modules?.reviews) return 'Review'
    if (modules?.bugReporting) return 'Report Bug'
    if (modules?.featureRequests) return 'Suggest'
    
    // Check primary type for specific feedback types
    if (primaryType === 'NPS') return 'Rate Us'
    if (primaryType === 'CSAT') return 'Feedback'
    if (primaryType === 'CES') return 'Help Us'
    
    return 'Feedback'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute z-10 flex items-center space-x-2 px-4 py-3 rounded-full shadow-lg',
        'transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2',
        'text-white font-medium text-sm',
        isActive && 'scale-110 shadow-xl',
        getPositionClasses(formData.appearance?.position || 'bottom_right')
      )}
      style={{
        backgroundColor: formData.appearance?.colors?.primary || '#6B46C1',
        color: formData.appearance?.colors?.buttonTextColor || '#FFFFFF',
        boxShadow: isActive 
          ? `0 20px 25px -5px ${formData.appearance?.colors?.primary || '#6B46C1'}20, 0 10px 10px -5px ${formData.appearance?.colors?.primary || '#6B46C1'}10`
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
    >
      <span className={cn('transition-transform duration-200', isActive && 'rotate-12')}>
        {getWidgetIcon()}
      </span>
      <span className="hidden sm:inline">{getTriggerText()}</span>
    </button>
  )
}