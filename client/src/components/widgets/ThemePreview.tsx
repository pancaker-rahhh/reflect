import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ThemePreviewProps {
  theme: string
  position: string
  colors: Record<string, string>
  content: Record<string, string>
  widgetType?: string
}

export function ThemePreview({ theme, position, colors, content, widgetType }: ThemePreviewProps) {
  const getThemeStyles = () => {
    switch (theme) {
      case 'midnight':
        return 'bg-surface-1 text-foreground border border-border'
      case 'minimal-light':
        return 'bg-surface-2 text-foreground border border-border'
      case 'minimal-dark':
        return 'bg-surface-1 text-foreground border border-border'
      default:
        return 'bg-surface-2 text-foreground shadow-lg border border-border'
    }
  }

  return (
    <Card className="h-[500px] relative overflow-hidden bg-secondary">
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-sm mb-2">Widget Preview</p>
          <div
            className={cn('w-80 rounded-lg p-6 transition-all', getThemeStyles())}
            style={{
              backgroundColor: theme === 'default' ? colors.background : undefined,
              color: theme === 'default' ? colors.text : undefined,
            }}
          >
            <h3 className="text-lg font-semibold mb-4">{content.headerTitle}</h3>
            <p className="mb-6 text-sm opacity-90">{content.mainQuestion}</p>
            {/* Rating Scale */}
            <div className="mb-4">
              {widgetType === 'nps' && (
                <div className="grid grid-cols-10 gap-1">
                  {[...Array(10)].map((_, i) => {
                    const score = i + 1
                    return (
                      <button
                        key={score}
                        className={cn(
                          'aspect-square rounded text-xs font-medium',
                          score === 9 && 'ring-2'
                        )}
                        style={{
                          backgroundColor: score === 9 ? colors.primary : colors.primary + '20',
                          color: score === 9 ? 'white' : colors.primary,
                          borderColor: colors.primary,
                        }}
                      >
                        {score}
                      </button>
                    )
                  })}
                </div>
              )}

              {(widgetType === 'csat' || widgetType === 'ces') && (
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      className={cn(
                        'text-2xl transition-transform hover:scale-110',
                        rating === 4 && 'filter drop-shadow-md'
                      )}
                      style={{
                        color: rating === 4 ? '#FCD34D' : '#E5E7EB',
                      }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              )}

              {(widgetType === 'feedback' ||
                widgetType === 'survey' ||
                widgetType === 'review') && (
                <div className="space-y-3">
                  <textarea
                    placeholder="Tell us what you think... Share your thoughts, suggestions, or concerns."
                    className="w-full h-16 p-3 border rounded-lg resize-none text-sm"
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: theme === 'default' ? colors.text : undefined,
                    }}
                    disabled
                  />
                  {widgetType === 'review' && (
                    <div className="flex justify-center space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <span
                          key={rating}
                          className="text-lg"
                          style={{
                            color: rating <= 4 ? '#FCD34D' : '#E5E7EB',
                          }}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
