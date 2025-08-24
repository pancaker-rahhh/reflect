import type { DeviceType } from './LiveWidgetPreview'

interface DeviceFrameProps {
  deviceType: DeviceType
  children: React.ReactNode
}

export function DeviceFrame({ deviceType, children }: DeviceFrameProps) {
  const getFrameStyles = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          container: 'w-80 h-[600px] mx-auto',
          frame: 'w-full h-full bg-gray-900 rounded-3xl p-2 shadow-2xl',
          screen: 'w-full h-full bg-black rounded-2xl overflow-hidden relative',
          notch: true
        }
      case 'tablet':
        return {
          container: 'w-96 h-[500px] mx-auto',
          frame: 'w-full h-full bg-gray-800 rounded-2xl p-3 shadow-2xl',
          screen: 'w-full h-full bg-black rounded-xl overflow-hidden relative',
          notch: false
        }
      case 'desktop':
      default:
        return {
          container: 'w-full max-w-4xl h-[600px] mx-auto',
          frame: 'w-full h-full bg-gray-900 rounded-lg p-4 shadow-2xl',
          screen: 'w-full h-full bg-white rounded overflow-hidden relative border',
          notch: false
        }
    }
  }

  const frameStyles = getFrameStyles()

  return (
    <div className={frameStyles.container}>
      <div className={frameStyles.frame}>
        {/* Mobile Notch */}
        {frameStyles.notch && deviceType === 'mobile' && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
        )}
        
        {/* Screen */}
        <div className={frameStyles.screen}>
          {children}
        </div>
        
        {/* Mobile Home Indicator */}
        {deviceType === 'mobile' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full" />
        )}
      </div>
      
      {/* Device Label */}
      <div className="text-center mt-2 text-xs text-gray-500 capitalize">
        {deviceType} Preview
      </div>
    </div>
  )
}