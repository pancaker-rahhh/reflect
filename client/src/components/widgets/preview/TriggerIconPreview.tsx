// Using inline SVGs to mirror the production live widget shapes exactly
import type { WidgetFormData } from '@/pages/WidgetCreate'
import { cn } from '@/lib/utils'

interface TriggerIconPreviewProps {
  formData: WidgetFormData
  onClick: () => void
  isActive: boolean
}

export function TriggerIconPreview({
  formData,
  onClick,
  isActive: _isActive,
}: TriggerIconPreviewProps) {
  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'bottom_right':
        return 'bottom-4 right-4'
      case 'bottom_left':
        return 'bottom-4 left-4'
      case 'mid_right':
        return 'top-1/2 right-0 -translate-y-1/2'
      case 'mid_left':
        return 'top-1/2 left-0 -translate-y-1/2'
      default:
        return 'bottom-4 right-4'
    }
  }

  const getWidgetIcon = () => {
    // Always show chat/message icon to match production launcher
    const baseProps = {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
      className: 'w-5 h-5',
    }
    // Always use feedback icon (message circle)
    return (
      <svg {...baseProps}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h8.5" />
        <path d="M18 13a3 3 0 1 0-3.5-3.5" />
      </svg>
    )
  }

  // Text is intentionally not shown in preview launcher to match live widget

  const isMidPosition =
    formData.appearance?.position === 'mid_left' || formData.appearance?.position === 'mid_right'

  if (isMidPosition) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'absolute z-10 flex items-center justify-center w-16 h-16 rounded-full',
          'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2',
          'text-white',
          getPositionClasses(formData.appearance?.position || 'bottom_right')
        )}
        style={{
          backgroundColor: formData.appearance?.colors?.primary || '#6B46C1',
          color: formData.appearance?.colors?.buttonTextColor || '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        {getWidgetIcon()}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute z-10 flex items-center justify-center w-16 h-16 rounded-full',
        'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2',
        'text-white',
        getPositionClasses(formData.appearance?.position || 'bottom_right')
      )}
      style={{
        backgroundColor: formData.appearance?.colors?.primary || '#6B46C1',
        color: formData.appearance?.colors?.buttonTextColor || '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      {getWidgetIcon()}
    </button>
  )
}
