import React from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { type WidgetFormData } from '@/pages/WidgetCreate'

interface Step2ContentProps {
  form: UseFormReturn<WidgetFormData>
}

export function Step2Content({ form }: Step2ContentProps) {
  const primaryType = form.watch('primaryType')
  const isScoringType = ['NPS', 'CSAT', 'CES'].includes(primaryType)

  const getTypeDefaults = React.useCallback(() => {
    switch (primaryType) {
      case 'NPS':
        return {
          headerTitle: 'We value your feedback',
          mainQuestion: 'How likely are you to recommend our product to a friend or colleague?',
          submitButtonText: 'Submit Rating',
          thankYouTitle: 'Thank you for your feedback!',
          thankYouMessage: 'Your rating helps us improve our product and service.',
        }
      case 'CSAT':
        return {
          headerTitle: 'How satisfied are you?',
          mainQuestion: 'Please rate your overall satisfaction with our service',
          submitButtonText: 'Submit Rating',
          thankYouTitle: 'Thank you!',
          thankYouMessage: 'Your satisfaction rating helps us serve you better.',
        }
      case 'CES':
        return {
          headerTitle: 'Help us improve',
          mainQuestion: 'How easy was it to get the help you needed?',
          submitButtonText: 'Submit Rating',
          thankYouTitle: 'Thank you!',
          thankYouMessage: 'Your feedback helps us make our service easier to use.',
        }
      case 'REVIEW':
        return {
          headerTitle: 'Share your experience',
          mainQuestion: 'How would you rate your overall experience with us?',
          submitButtonText: 'Submit Review',
          thankYouTitle: 'Thanks for your review!',
          thankYouMessage: 'Your review helps others make informed decisions.',
        }
      case 'BUG_REPORT':
        return {
          headerTitle: 'Report an Issue',
          mainQuestion: 'Please describe the issue you encountered',
          submitButtonText: 'Report Bug',
          thankYouTitle: 'Bug report submitted!',
          thankYouMessage: 'Thank you for helping us improve. We will investigate this issue.',
        }
      case 'FEATURE_REQUEST':
        return {
          headerTitle: 'Suggest a Feature',
          mainQuestion: 'What feature would you like to see added?',
          submitButtonText: 'Submit Request',
          thankYouTitle: 'Thanks for your suggestion!',
          thankYouMessage: 'We appreciate your input and will consider this feature for future updates.',
        }
      case 'SURVEY':
        return {
          headerTitle: 'Quick Survey',
          mainQuestion: 'Help us understand your needs better',
          submitButtonText: 'Complete Survey',
          thankYouTitle: 'Survey completed!',
          thankYouMessage: 'Thank you for taking the time to complete our survey.',
        }
      default:
        return {
          headerTitle: 'We value your feedback',
          mainQuestion: 'How can we improve?',
          submitButtonText: 'Submit Feedback',
          thankYouTitle: 'Thank you!',
          thankYouMessage: 'Your feedback helps us improve.',
        }
    }
  }, [primaryType])

  // Update form defaults when primaryType changes
  React.useEffect(() => {
    const currentValues = form.getValues('content')
    const defaults = getTypeDefaults()
    
    // Only update if the current values appear to be defaults (to avoid overriding user changes)
    const isUsingDefaults = !currentValues?.headerTitle || 
                           currentValues.headerTitle === 'We value your feedback' ||
                           currentValues.headerTitle === 'How satisfied are you?' ||
                           currentValues.headerTitle === 'Help us improve' ||
                           currentValues.headerTitle === 'Share your experience' ||
                           currentValues.headerTitle === 'Report an Issue' ||
                           currentValues.headerTitle === 'Suggest a Feature' ||
                           currentValues.headerTitle === 'Quick Survey'
    
    if (isUsingDefaults) {
      form.setValue('content.headerTitle', defaults.headerTitle)
      form.setValue('content.mainQuestion', defaults.mainQuestion)
      form.setValue('content.submitButtonText', defaults.submitButtonText)
      form.setValue('content.thankYouTitle', defaults.thankYouTitle)
      form.setValue('content.thankYouMessage', defaults.thankYouMessage)
    }
  }, [primaryType, form, getTypeDefaults])

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="content.headerTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold mb-4">Widget Header Title</FormLabel>
              <FormDescription>The main title shown at the top of your widget</FormDescription>
              <FormControl>
                <Input placeholder="We value your feedback" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content.mainQuestion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold mb-4">Main Question</FormLabel>
              <FormDescription>The primary question you want to ask your users</FormDescription>
              <FormControl>
                <Textarea
                  placeholder={getTypeDefaults().mainQuestion}
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="content.submitButtonText"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold mb-4">Submit Button Text</FormLabel>
              <FormDescription>Text displayed on the submit button</FormDescription>
              <FormControl>
                <Input
                  placeholder={getTypeDefaults().submitButtonText}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-medium">Thank You Screen</h4>

          <FormField
            control={form.control}
            name="content.thankYouTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thank You Title</FormLabel>
                <FormDescription className="text-sm">Title shown after submission</FormDescription>
                <FormControl>
                  <Input placeholder="Thank you!" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content.thankYouMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thank You Message</FormLabel>
                <FormDescription className="text-sm">
                  Message shown after submission
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder={getTypeDefaults().thankYouMessage}
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Type-specific configuration sections */}
        {primaryType === 'REVIEW' && (
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-medium flex items-center gap-2">
              <span>⭐</span>
              Review Settings
            </h4>
            
            <FormField
              control={form.control}
              name="content.reviewPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Prompt (Optional)</FormLabel>
                  <FormDescription className="text-sm">
                    Additional text to encourage detailed reviews
                  </FormDescription>
                  <FormControl>
                    <Input 
                      placeholder="Share your thoughts about your experience"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content.requireReviewText"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Require written review</FormLabel>
                    <FormDescription>
                      Force users to write a text review along with star rating
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        {primaryType === 'BUG_REPORT' && (
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-medium flex items-center gap-2">
              <span>🐛</span>
              Bug Report Settings
            </h4>

            <FormField
              control={form.control}
              name="content.requireStepsToReproduce"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Require reproduction steps</FormLabel>
                    <FormDescription>
                      Make the "Steps to Reproduce" field mandatory
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Bug reports automatically include category selection, severity rating, title, and description fields.
              </p>
            </div>
          </div>
        )}

        {primaryType === 'FEATURE_REQUEST' && (
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-medium flex items-center gap-2">
              <span>✨</span>
              Feature Request Settings
            </h4>

            <FormField
              control={form.control}
              name="content.requireUseCase"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Require use case description</FormLabel>
                    <FormDescription>
                      Make the "Use Case & Benefits" field mandatory
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Note:</strong> Feature requests automatically include title, category, priority, description, and use case fields.
              </p>
            </div>
          </div>
        )}
      </div>
    </Form>
  )
}
