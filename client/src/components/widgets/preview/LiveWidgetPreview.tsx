import { useState, useMemo, useCallback } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { WidgetFormData } from '@/pages/WidgetCreate'
import { TriggerIconPreview } from './TriggerIconPreview'
import { WidgetCore } from '@/components/widgets/core/WidgetCore'
import { DeviceFrame } from './DeviceFrame'
import { PreviewControls } from './PreviewControls'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import type {
  WidgetConfiguration,
  WidgetState,
  FeedbackData,
  FeedbackType,
} from '@/components/widgets/core/types'

export type PreviewState = 'closed' | 'open' | 'interactive' | 'thankyou'
export type DeviceType = 'desktop' | 'tablet' | 'mobile'

// Transform WidgetFormData to WidgetConfiguration for WidgetCore
function transformFormDataToConfig(formData: WidgetFormData): WidgetConfiguration {
  return {
    modules: formData.modules || {
      feedback: true,
      reviews: false,
      bugReporting: false,
      featureRequests: false,
    },
    primaryType: (formData.primaryType as FeedbackType) || 'FEEDBACK',
    content: formData.content || {
      headerTitle: 'We value your feedback',
      mainQuestion: 'How can we improve?',
      submitButtonText: 'Submit Feedback',
      thankYouTitle: 'Thank you!',
      thankYouMessage: 'Your feedback helps us improve.',
    },
    appearance: formData.appearance || {
      theme: 'default',
      position: 'bottom_right',
      colors: {
        primary: '#6B46C1',
        background: '#FFFFFF',
        text: '#1F2937',
        buttonColor: '#6B46C1',
        buttonTextColor: '#FFFFFF',
      },
      showBranding: true,
    },
    behavior: formData.behavior || {
      triggerType: 'immediate',
      urlTargeting: { includeUrls: [], excludeUrls: [] },
      deviceTypes: { desktop: true, mobile: true, tablet: true },
    },
  }
}

// Map preview state to widget state
function mapPreviewStateToWidgetState(
  previewState: PreviewState,
  config: WidgetConfiguration
): WidgetState {
  switch (previewState) {
    case 'closed':
      return { type: 'closed' }
    case 'open': {
      // Check if multiple modules are enabled for initial menu display
      const enabledModules = Object.entries(config.modules || {}).filter(([, enabled]) => enabled)
      if (enabledModules.length > 1) {
        const availableTypes = enabledModules.map(([key]) => {
          switch (key) {
            case 'feedback':
              return config.primaryType || ('FEEDBACK' as FeedbackType) // Use actual primary type
            case 'reviews':
              return 'REVIEW' as FeedbackType
            case 'bugReporting':
              return 'BUG_REPORT' as FeedbackType
            case 'featureRequests':
              return 'FEATURE_REQUEST' as FeedbackType
            default:
              return 'FEEDBACK' as FeedbackType
          }
        })
        return { type: 'menu', availableTypes }
      } else {
        // For single module, directly show the primary type
        return { type: 'active', feedbackType: config.primaryType }
      }
    }
    case 'interactive':
      return { type: 'active', feedbackType: config.primaryType }
    case 'thankyou':
      return { type: 'success' }
    default:
      return { type: 'closed' }
  }
}

interface LiveWidgetPreviewProps {
  form: UseFormReturn<WidgetFormData>
}

export function LiveWidgetPreview({ form }: LiveWidgetPreviewProps) {
  const [previewState, setPreviewState] = useState<PreviewState>('closed')
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [_widgetState, setWidgetState] = useState<WidgetState>({ type: 'closed' })

  // Watch specific form fields to minimize re-renders
  const formData = form.watch(['appearance', 'content', 'primaryType', 'modules', 'behavior'])

  // Convert watched array to object structure
  const structuredFormData = useMemo(() => {
    if (!Array.isArray(formData) || formData.length < 5) return null
    return {
      appearance: formData[0],
      content: formData[1],
      primaryType: formData[2],
      modules: formData[3],
      behavior: formData[4],
    } as Pick<WidgetFormData, 'appearance' | 'content' | 'primaryType' | 'modules' | 'behavior'>
  }, [formData])

  // Debounce form changes to prevent excessive re-renders
  const debouncedFormData = useDebounce(structuredFormData, 300)

  // Memoize widget configuration to prevent recreation on every render
  const widgetConfig = useMemo(() => {
    if (!debouncedFormData || typeof debouncedFormData !== 'object') return null
    // Ensure all required properties exist before transformation
    if (!Array.isArray(debouncedFormData) && typeof debouncedFormData === 'object') {
      return transformFormDataToConfig(debouncedFormData as WidgetFormData)
    }
    return null
  }, [debouncedFormData])

  // Memoize widget state mapping
  const mappedWidgetState = useMemo(() => {
    if (!widgetConfig) return { type: 'closed' as const }
    return mapPreviewStateToWidgetState(previewState, widgetConfig)
  }, [previewState, widgetConfig])

  // Use useCallback to memoize event handlers and prevent child re-renders
  const handleTriggerClick = useCallback(() => {
    setPreviewState((current) => (current === 'closed' ? 'open' : 'closed'))
  }, [])

  const handleWidgetSubmit = useCallback(
    async (_data: FeedbackData) => {
      // Mock submission delay for preview
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Check if widget has multiple modules to show menu or go to success
          if (
            widgetConfig &&
            widgetConfig.modules &&
            Object.values(widgetConfig.modules).filter(Boolean).length > 1
          ) {
            setPreviewState('interactive')
          } else {
            setPreviewState('thankyou')
          }
          resolve()
        }, 1000)
      })
    },
    [widgetConfig]
  )

  const handleWidgetClose = useCallback(() => {
    setPreviewState('closed')
  }, [])

  const handleWidgetStateChange = useCallback((newState: WidgetState) => {
    setWidgetState(newState)
    // Map widget state back to preview state for controls synchronization
    switch (newState.type) {
      case 'closed':
        setPreviewState('closed')
        break
      case 'menu':
      case 'active':
        setPreviewState('interactive')
        break
      case 'success':
        setPreviewState('thankyou')
        break
    }
  }, [])

  const handleStateReset = useCallback(() => {
    setPreviewState('closed')
    setWidgetState({ type: 'closed' })
  }, [])

  return (
    <div
      className={cn(
        'h-full flex flex-col bg-gray-50',
        isFullscreen && 'fixed inset-0 z-50 bg-white'
      )}
    >
      {/* Preview Controls */}
      <PreviewControls
        previewState={previewState}
        deviceType={deviceType}
        isFullscreen={isFullscreen}
        onStateChange={setPreviewState}
        onDeviceChange={setDeviceType}
        onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
        onReset={handleStateReset}
      />

      {/* Preview Area */}
      <div className="flex-1 p-4">
        <DeviceFrame deviceType={deviceType}>
          <div className="relative w-full h-full bg-white">
            {/* Simulated Website Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-50" />
            <div className="absolute top-4 left-4 right-4">
              <div className="h-12 bg-white rounded-lg shadow-sm flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <div className="ml-4 text-sm text-gray-600">example.com</div>
              </div>
            </div>

            {/* Page Content Simulation */}
            <div className="absolute top-20 left-4 right-4 bottom-20 bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-20 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>

            {/* Trigger Icon */}
            {debouncedFormData && (
              <TriggerIconPreview
                formData={debouncedFormData as WidgetFormData}
                onClick={handleTriggerClick}
                isActive={previewState !== 'closed'}
              />
            )}

            {/* Widget Dialog */}
            {previewState !== 'closed' && widgetConfig && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-sm h-full max-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <WidgetCore
                    config={widgetConfig}
                    mode="preview"
                    state={mappedWidgetState}
                    onSubmit={handleWidgetSubmit}
                    onClose={handleWidgetClose}
                    onStateChange={handleWidgetStateChange}
                  />
                </div>
              </div>
            )}
          </div>
        </DeviceFrame>
      </div>
    </div>
  )
}
