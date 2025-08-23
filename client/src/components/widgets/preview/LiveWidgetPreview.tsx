import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { WidgetFormData } from '@/pages/WidgetCreate'
import { TriggerIconPreview } from './TriggerIconPreview'
import { WidgetRenderer } from './WidgetRenderer'
import { DeviceFrame } from './DeviceFrame'
import { PreviewControls } from './PreviewControls'
import { cn } from '@/lib/utils'

export type PreviewState = 'closed' | 'open' | 'interactive' | 'thankyou'
export type DeviceType = 'desktop' | 'tablet' | 'mobile'

interface LiveWidgetPreviewProps {
  form: UseFormReturn<WidgetFormData>
}

export function LiveWidgetPreview({ form }: LiveWidgetPreviewProps) {
  const [previewState, setPreviewState] = useState<PreviewState>('closed')
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Subscribe to form changes
  const formData = form.watch()

  const handleTriggerClick = () => {
    setPreviewState(previewState === 'closed' ? 'open' : 'closed')
  }

  const handleWidgetInteraction = () => {
    if (previewState === 'open') {
      setPreviewState('interactive')
    }
  }

  const handleWidgetSubmit = () => {
    setPreviewState('thankyou')
  }

  const handleStateReset = () => {
    setPreviewState('closed')
  }

  return (
    <div className={cn(
      'h-full flex flex-col bg-gray-50',
      isFullscreen && 'fixed inset-0 z-50 bg-white'
    )}>
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
            <TriggerIconPreview
              formData={formData}
              onClick={handleTriggerClick}
              isActive={previewState !== 'closed'}
            />

            {/* Widget Dialog */}
            {previewState !== 'closed' && (
              <WidgetRenderer
                formData={formData}
                state={previewState}
                onInteraction={handleWidgetInteraction}
                onSubmit={handleWidgetSubmit}
                onClose={() => setPreviewState('closed')}
              />
            )}
          </div>
        </DeviceFrame>
      </div>
    </div>
  )
}