import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ThemePreviewProps {
  theme: string
  position: string
  colors: any
  content: any
}

export function ThemePreview({ theme, position, colors, content }: ThemePreviewProps) {
  const getThemeStyles = () => {
    switch (theme) {
      case 'midnight':
        return 'bg-gray-900 text-white'
      case 'minimal-light':
        return 'bg-white text-gray-900 border'
      case 'minimal-dark':
        return 'bg-gray-800 text-white'
      default:
        return 'bg-white text-gray-900 shadow-lg'
    }
  }

  return (
    <Card className="h-[500px] relative overflow-hidden bg-gray-100">
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-sm mb-2">Widget Preview</p>
          <div 
            className={cn(
              "w-80 rounded-lg p-6 transition-all",
              getThemeStyles()
            )}
            style={{
              backgroundColor: theme === 'default' ? colors.background : undefined,
              color: theme === 'default' ? colors.text : undefined,
            }}
          >
            <h3 className="text-lg font-semibold mb-4">
              {content.headerTitle}
            </h3>
            <p className="mb-6 text-sm opacity-90">
              {content.mainQuestion}
            </p>
            <div className="flex justify-between mb-4">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  className={cn(
                    "w-8 h-8 rounded text-xs font-medium",
                    i === 9 && "ring-2"
                  )}
                  style={{
                    backgroundColor: i === 9 ? colors.primary : colors.primary + '20',
                    color: i === 9 ? 'white' : colors.primary,
                    borderColor: colors.primary
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
            <button
              className="w-full py-2 px-4 rounded font-medium"
              style={{
                backgroundColor: colors.buttonColor,
                color: colors.buttonTextColor,
              }}
            >
              {content.submitButtonText}
            </button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
        Position: {position.replace('-', ' ')}
      </div>
    </Card>
  )
}