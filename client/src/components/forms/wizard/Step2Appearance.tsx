import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Step2AppearanceProps {
  appearance: {
    theme: string
    primaryColor: string
    headerGradientEnd: string
    backgroundColor: string
    textColor: string
    buttonTextColor: string
    pageBackground?: string
  }
  setAppearance: (appearance: Step2AppearanceProps['appearance']) => void
}

const themes = [
  { value: 'default', label: 'Default', description: 'Clean and modern' },
  { value: 'midnight', label: 'Midnight', description: 'Dark and elegant' },
  { value: 'minimal-dark', label: 'Minimal Dark', description: 'Subtle dark theme' },
  { value: 'minimal-light', label: 'Minimal Light', description: 'Clean light theme' },
]

const backgroundPatterns = [
  {
    value: 'none',
    label: 'None',
    preview: '#f9fafb',
    style: {},
  },
  {
    value: 'dots',
    label: 'Subtle Dots',
    preview: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
    style: {
      backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    },
  },
  {
    value: 'grid',
    label: 'Grid',
    preview:
      'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
    style: {
      backgroundImage:
        'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
      backgroundSize: '30px 30px',
    },
  },
  {
    value: 'diagonal',
    label: 'Diagonal',
    preview:
      'repeating-linear-gradient(45deg, transparent, transparent 10px, #e5e7eb 10px, #e5e7eb 11px)',
    style: {
      backgroundImage:
        'repeating-linear-gradient(45deg, transparent, transparent 10px, #e5e7eb 10px, #e5e7eb 11px)',
    },
  },
  {
    value: 'waves',
    label: 'Waves',
    preview:
      'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 25%, transparent 25%), linear-gradient(225deg, rgba(99, 102, 241, 0.05) 25%, transparent 25%), linear-gradient(45deg, rgba(99, 102, 241, 0.05) 25%, transparent 25%), linear-gradient(315deg, rgba(99, 102, 241, 0.05) 25%, transparent 25%)',
    style: {
      backgroundImage:
        'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 25%, transparent 25%), linear-gradient(225deg, rgba(99, 102, 241, 0.05) 25%, transparent 25%), linear-gradient(45deg, rgba(99, 102, 241, 0.05) 25%, transparent 25%), linear-gradient(315deg, rgba(99, 102, 241, 0.05) 25%, transparent 25%)',
      backgroundSize: '40px 40px',
      backgroundPosition: '0 0, 20px 0, 20px -20px, 0px 20px',
    },
  },
  {
    value: 'gradient-soft',
    label: 'Soft Gradient',
    preview: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
    style: {
      backgroundImage:
        'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
    },
  },
]

function getThemeColors(theme: string) {
  switch (theme) {
    case 'midnight':
      return {
        primaryColor: '#9333EA',
        headerGradientEnd: '#7C3AED',
        backgroundColor: 'rgba(24, 24, 27, 0.95)',
        textColor: '#F4F4F5',
        buttonTextColor: '#FFFFFF',
      }
    case 'minimal-dark':
      return {
        primaryColor: '#9CA3AF',
        headerGradientEnd: '',
        backgroundColor: '#111827',
        textColor: '#F3F4F6',
        buttonTextColor: '#111827',
      }
    case 'minimal-light':
      return {
        primaryColor: '#6B7280',
        headerGradientEnd: '',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        buttonTextColor: '#FFFFFF',
      }
    case 'default':
    default:
      return {
        primaryColor: '#0066FF',
        headerGradientEnd: '',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        buttonTextColor: '#FFFFFF',
      }
  }
}

export function Step2Appearance({ appearance, setAppearance }: Step2AppearanceProps) {
  const handleThemeChange = (theme: string) => {
    const themeColors = getThemeColors(theme)
    setAppearance({
      ...appearance,
      theme,
      ...themeColors,
    })
  }

  return (
    <div className="space-y-6">
  <Card className="p-6 hover:!translate-y-0">
        <h2 className="text-lg font-semibold mb-4">Theme</h2>
        <RadioGroup
          value={appearance.theme}
          onValueChange={handleThemeChange}
          className="grid grid-cols-2 gap-4"
        >
          {themes.map((theme) => (
            <div key={theme.value}>
              <RadioGroupItem value={theme.value} id={theme.value} className="peer sr-only" />
              <label
                htmlFor={theme.value}
                className="flex cursor-pointer flex-col rounded-lg border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-colors"
              >
                <span className="font-semibold">{theme.label}</span>
                <span className="text-sm text-muted-foreground">{theme.description}</span>
              </label>
            </div>
          ))}
        </RadioGroup>
      </Card>

  <Card className="p-6 hover:!translate-y-0">
        <h2 className="text-lg font-semibold mb-2">Page Background</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a background pattern for the page surrounding your form
        </p>
        <RadioGroup
          value={appearance.pageBackground || 'none'}
          onValueChange={(value) => setAppearance({ ...appearance, pageBackground: value })}
          className="grid grid-cols-3 gap-4"
        >
          {backgroundPatterns.map((pattern) => (
            <div key={pattern.value}>
              <RadioGroupItem
                value={pattern.value}
                id={`bg-${pattern.value}`}
                className="peer sr-only"
              />
              <label
                htmlFor={`bg-${pattern.value}`}
                className="flex cursor-pointer flex-col rounded-lg border-2 border-muted p-3 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-colors"
              >
                <div
                  className="w-full h-16 rounded mb-2 border border-border"
                  style={{
                    background: pattern.preview,
                    backgroundColor: '#f9fafb',
                    ...pattern.style,
                  }}
                />
                <span className="text-xs font-medium text-center">{pattern.label}</span>
              </label>
            </div>
          ))}
        </RadioGroup>
      </Card>

  <Card className="p-6 hover:!translate-y-0">
        <h2 className="text-lg font-semibold mb-2">Custom Colors</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Customize the look to match your brand identity
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex items-center gap-3 mt-1.5">
              <Input
                type="color"
                value={appearance.primaryColor}
                onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                className="w-16 h-10 cursor-pointer"
              />
              <Input
                id="primary-color"
                value={appearance.primaryColor}
                onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                placeholder="#0066FF"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gradient-end">Header Gradient End (Optional)</Label>
            <p className="text-xs text-muted-foreground mt-1">Leave empty for solid color header</p>
            <div className="flex items-center gap-3 mt-1.5">
              <Input
                type="color"
                value={appearance.headerGradientEnd || '#0066FF'}
                onChange={(e) =>
                  setAppearance({ ...appearance, headerGradientEnd: e.target.value })
                }
                className="w-16 h-10 cursor-pointer"
              />
              <Input
                id="gradient-end"
                value={appearance.headerGradientEnd}
                onChange={(e) =>
                  setAppearance({ ...appearance, headerGradientEnd: e.target.value })
                }
                placeholder="#7C3AED"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="background-color">Background Color</Label>
            <div className="flex items-center gap-3 mt-1.5">
              <Input
                type="color"
                value={appearance.backgroundColor}
                onChange={(e) => setAppearance({ ...appearance, backgroundColor: e.target.value })}
                className="w-16 h-10 cursor-pointer"
              />
              <Input
                id="background-color"
                value={appearance.backgroundColor}
                onChange={(e) => setAppearance({ ...appearance, backgroundColor: e.target.value })}
                placeholder="#FFFFFF"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="text-color">Text Color</Label>
            <p className="text-xs text-muted-foreground mt-1">Color for regular text content</p>
            <div className="flex items-center gap-3 mt-1.5">
              <Input
                type="color"
                value={appearance.textColor}
                onChange={(e) => setAppearance({ ...appearance, textColor: e.target.value })}
                className="w-16 h-10 cursor-pointer"
              />
              <Input
                id="text-color"
                value={appearance.textColor}
                onChange={(e) => setAppearance({ ...appearance, textColor: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="button-text-color">Button & Header Text Color</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Color for text on buttons and in the header
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <Input
                type="color"
                value={appearance.buttonTextColor}
                onChange={(e) => setAppearance({ ...appearance, buttonTextColor: e.target.value })}
                className="w-16 h-10 cursor-pointer"
              />
              <Input
                id="button-text-color"
                value={appearance.buttonTextColor}
                onChange={(e) => setAppearance({ ...appearance, buttonTextColor: e.target.value })}
                placeholder="#FFFFFF"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
