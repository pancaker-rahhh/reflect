import { type UseFormReturn } from 'react-hook-form'
import { type WidgetFormData } from '@/pages/WidgetCreate'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PositionSelector } from '../PositionSelector'
import { FeatureGateWithDisabledState } from '@/components/common/FeatureGateWithDisabledState'
import { ProFeatureBadge } from '@/components/common/ProFeatureBadge'

interface Step3AppearanceProps {
  form: UseFormReturn<WidgetFormData>
}

const themes = [
  { value: 'default', label: 'Default', description: 'Clean and modern' },
  { value: 'midnight', label: 'Midnight', description: 'Dark and elegant' },
  { value: 'minimal-light', label: 'Minimal Light', description: 'Simple and bright' },
  { value: 'minimal-dark', label: 'Minimal Dark', description: 'Simple and dark' },
]

function getThemeColors(theme: string) {
  switch (theme) {
    case 'midnight':
      return {
        primary: '#9333EA',
        headerGradientEnd: '#7C3AED',
        background: 'rgba(24, 24, 27, 0.95)',
        text: '#F4F4F5',
        buttonColor: '#9333EA',
        buttonTextColor: '#FFFFFF',
      }
    case 'minimal-dark':
      return {
        primary: '#9CA3AF',
        headerGradientEnd: '',
        background: '#111827',
        text: '#F3F4F6',
        buttonColor: '#9CA3AF',
        buttonTextColor: '#111827',
      }
    case 'minimal-light':
      return {
        primary: '#6B7280',
        headerGradientEnd: '',
        background: '#FFFFFF',
        text: '#111827',
        buttonColor: '#6B7280',
        buttonTextColor: '#FFFFFF',
      }
    case 'default':
    default:
      return {
        primary: '#0066FF',
        headerGradientEnd: '',
        background: '#FFFFFF',
        text: '#000000',
        buttonColor: '#0066FF',
        buttonTextColor: '#FFFFFF',
      }
  }
}

export function Step3Appearance({ form }: Step3AppearanceProps) {
  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="appearance.theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value)
                    const themeColors = getThemeColors(value)
                    form.setValue('appearance.colors.primary', themeColors.primary)
                    form.setValue(
                      'appearance.colors.headerGradientEnd',
                      themeColors.headerGradientEnd
                    )
                    form.setValue('appearance.colors.background', themeColors.background)
                    form.setValue('appearance.colors.text', themeColors.text)
                    form.setValue('appearance.colors.buttonColor', themeColors.buttonColor)
                    form.setValue('appearance.colors.buttonTextColor', themeColors.buttonTextColor)
                  }}
                  defaultValue={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  {themes.map((theme) => (
                    <div key={theme.value}>
                      <RadioGroupItem
                        value={theme.value}
                        id={theme.value}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor={theme.value}
                        className="flex cursor-pointer flex-col rounded-lg border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <span className="font-semibold">{theme.label}</span>
                        <span className="text-sm text-muted-foreground">{theme.description}</span>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appearance.position"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold mb-4">Widget Position</FormLabel>
              <FormDescription>Choose where the widget appears on your page</FormDescription>
              <FormControl>
                <PositionSelector value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Colors</h3>
            <p className="text-sm text-muted-foreground">
              Customize the look to match your brand identity.
            </p>

            <FormField
              control={form.control}
              name="appearance.colors.primary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" className="w-16 p-1 h-10" {...field} />
                      <Input placeholder="#0066FF" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appearance.colors.headerGradientEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Header Gradient End (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" className="w-16 p-1 h-10" {...field} />
                      <Input placeholder="#7C3AED" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appearance.colors.background"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" className="w-16 p-1 h-10" {...field} />
                      <Input placeholder="#FFFFFF" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appearance.colors.text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text Color</FormLabel>
                  <FormDescription className="text-xs">
                    Color for regular text content
                  </FormDescription>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" className="w-16 p-1 h-10" {...field} />
                      <Input placeholder="#000000" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appearance.colors.buttonTextColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button & Header Text Color</FormLabel>
                  <FormDescription className="text-xs">
                    Color for text on buttons and in the header
                  </FormDescription>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" className="w-16 p-1 h-10" {...field} />
                      <Input placeholder="#FFFFFF" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FeatureGateWithDisabledState feature="branding_removal">
          <FormField
            control={form.control}
            name="appearance.showBranding"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <FormLabel className="text-base">
                      Show &quot;Powered by&quot; branding
                    </FormLabel>
                    <ProFeatureBadge feature="branding_removal" />
                  </div>
                  <FormDescription>
                    Remove the "Powered by Reflect" branding from your widget. Perfect for
                    maintaining a clean, professional look on your website.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </FeatureGateWithDisabledState>
      </div>
    </Form>
  )
}
