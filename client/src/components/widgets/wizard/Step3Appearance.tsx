import { type UseFormReturn } from 'react-hook-form'
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
import { ThemePreview } from '../ThemePreview'
import { PositionSelector } from '../PositionSelector'

interface Step3AppearanceProps {
  form: UseFormReturn<any>
}

const themes = [
  { value: 'default', label: 'Default', description: 'Clean and modern' },
  { value: 'midnight', label: 'Midnight', description: 'Dark and elegant' },
  { value: 'minimal-light', label: 'Minimal Light', description: 'Simple and bright' },
  { value: 'minimal-dark', label: 'Minimal Dark', description: 'Simple and dark' },
]

export function Step3Appearance({ form }: Step3AppearanceProps) {
  const selectedTheme = form.watch('appearance.theme')
  const selectedPosition = form.watch('appearance.position')
  const colors = form.watch('appearance.colors')

  return (
    <Form {...form}>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="appearance.theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
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
                          <span className="text-sm text-muted-foreground">
                            {theme.description}
                          </span>
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
                <FormLabel>Widget Position</FormLabel>
                <FormDescription>
                  Choose where the widget appears on your page
                </FormDescription>
                <FormControl>
                  <PositionSelector
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h3 className="font-medium">Colors</h3>
            
            <FormField
              control={form.control}
              name="appearance.colors.primary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" className="w-16 p-1 h-10" {...field} />
                      <Input placeholder="#6B46C1" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appearance.colors.buttonColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" className="w-16 p-1 h-10" {...field} />
                      <Input placeholder="#6B46C1" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="appearance.showBranding"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Show "Powered by" branding
                  </FormLabel>
                  <FormDescription>
                    Pro plan required to remove branding
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="lg:sticky lg:top-0">
          <h3 className="font-medium mb-4">Preview</h3>
          <ThemePreview
            theme={selectedTheme}
            position={selectedPosition}
            colors={colors}
            content={form.getValues('content')}
          />
        </div>
      </div>
    </Form>
  )
}