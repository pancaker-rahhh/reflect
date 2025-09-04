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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Code, Info } from 'lucide-react'

import type { WidgetFormData } from '@/pages/WidgetCreate'

interface Step4BehaviorProps {
  form: UseFormReturn<WidgetFormData>
}

export function Step4Behavior({ form }: Step4BehaviorProps) {
  const triggerType = form.watch('behavior.triggerType')

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="behavior.triggerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Widget Trigger Type</FormLabel>
              <FormDescription>Choose when the widget should appear to users</FormDescription>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="immediate">Show Immediately</SelectItem>
                  <SelectItem value="delay">Show After Delay</SelectItem>
                  <SelectItem value="exit-intent">Exit Intent</SelectItem>
                  <SelectItem value="scroll">After Scrolling</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {triggerType === 'delay' && (
          <FormField
            control={form.control}
            name="behavior.triggerDelay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delay (seconds)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="5"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-4">
          <h3 className="font-medium">URL Targeting</h3>

          <FormField
            control={form.control}
            name="behavior.urlTargeting.includeUrls"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Show on specific URLs</FormLabel>
                <FormDescription>
                  Enter URL patterns separated by commas (e.g., /dashboard/*, /products/*)
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="/dashboard/*, /products/*"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    value={field.value?.join(', ') || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="behavior.urlTargeting.excludeUrls"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exclude on specific URLs</FormLabel>
                <FormDescription>Enter URL patterns to exclude separated by commas</FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="/admin/*, /checkout/*"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    value={field.value?.join(', ') || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Device Types</h3>
          <div className="space-y-3">
            {['desktop', 'mobile', 'tablet'].map((device) => (
              <FormField
                key={device}
                control={form.control}
                name={`behavior.deviceTypes.${device}` as any}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal capitalize">{device}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <Card className="p-4 bg-muted/50">
          <div className="flex gap-3">
            <Code className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-2 flex-1">
              <h4 className="font-medium">User Identification</h4>
              <p className="text-sm text-muted-foreground">
                Identify users to track their feedback history and provide personalized experiences.
              </p>
              <pre className="bg-background rounded p-3 text-xs overflow-x-auto">
                {`window.reflectIdentify = {
  userId: 'user123',
  email: 'user@example.com',
  name: 'John Doe'
}`}
              </pre>
            </div>
          </div>
        </Card>

        <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-900 dark:text-blue-100">
            Multi-language support is automatically enabled. The widget will detect the user&apos;s
            browser language and display content accordingly.
          </p>
        </div>
      </div>
    </Form>
  )
}
