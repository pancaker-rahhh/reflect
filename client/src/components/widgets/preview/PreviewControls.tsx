import { Monitor, Tablet, Smartphone, RotateCcw, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PreviewState, DeviceType } from './LiveWidgetPreview'

interface PreviewControlsProps {
  previewState: PreviewState
  deviceType: DeviceType
  isFullscreen: boolean
  onStateChange: (state: PreviewState) => void
  onDeviceChange: (device: DeviceType) => void
  onFullscreenToggle: () => void
  onReset: () => void
}

export function PreviewControls({
  previewState,
  deviceType,
  isFullscreen,
  onStateChange,
  onDeviceChange,
  onFullscreenToggle,
  onReset
}: PreviewControlsProps) {
  const stateButtons = [
    { state: 'closed' as PreviewState, label: 'Closed', description: 'Trigger icon only' },
    { state: 'open' as PreviewState, label: 'Open', description: 'Widget opened' },
    { state: 'interactive' as PreviewState, label: 'Interactive', description: 'User interacting' },
    { state: 'thankyou' as PreviewState, label: 'Thank You', description: 'After submission' }
  ]

  const deviceButtons = [
    { device: 'desktop' as DeviceType, icon: Monitor, label: 'Desktop' },
    { device: 'tablet' as DeviceType, icon: Tablet, label: 'Tablet' },
    { device: 'mobile' as DeviceType, icon: Smartphone, label: 'Mobile' }
  ]

  return (
    <div className="border-b bg-white p-3 space-y-3">
      {/* Device Selection */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Device:</span>
        <div className="flex space-x-1">
          {deviceButtons.map(({ device, icon: Icon, label }) => (
            <Button
              key={device}
              variant={deviceType === device ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDeviceChange(device)}
              className="h-8 px-3"
            >
              <Icon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* State Selection */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">State:</span>
        <div className="flex space-x-1 flex-wrap">
          {stateButtons.map(({ state, label, description }) => (
            <Button
              key={state}
              variant={previewState === state ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStateChange(state)}
              className="h-8 px-3"
              title={description}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-8 px-3"
            title="Reset to initial state"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onFullscreenToggle}
          className="h-8 px-3"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  )
}