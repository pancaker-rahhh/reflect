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
import { NPSRating } from '@/components/widgets/scoring/NPSRating'
import { CSATRating } from '@/components/widgets/scoring/CSATRating'
import { CESRating } from '@/components/widgets/scoring/CESRating'
import { type WidgetFormData } from '@/pages/WidgetCreate'

interface Step2ContentProps {
  form: UseFormReturn<WidgetFormData>
}

export function Step2Content({ form }: Step2ContentProps) {
  const primaryType = form.watch('primaryType')
  const isScoringType = ['NPS', 'CSAT', 'CES'].includes(primaryType)

  const getScoringDefaults = React.useCallback(() => {
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
    if (isScoringType) {
      const defaults = getScoringDefaults()
      form.setValue('content.headerTitle', defaults.headerTitle)
      form.setValue('content.mainQuestion', defaults.mainQuestion)
      form.setValue('content.submitButtonText', defaults.submitButtonText)
      form.setValue('content.thankYouTitle', defaults.thankYouTitle)
      form.setValue('content.thankYouMessage', defaults.thankYouMessage)
    }
  }, [primaryType, form, isScoringType, getScoringDefaults])

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="content.headerTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Widget Header Title</FormLabel>
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
              <FormLabel>Main Question</FormLabel>
              <FormDescription>The primary question you want to ask your users</FormDescription>
              <FormControl>
                <Textarea
                  placeholder={
                    primaryType === 'NPS'
                      ? 'How likely are you to recommend our product to a friend or colleague?'
                      : primaryType === 'CSAT'
                        ? 'Please rate your overall satisfaction with our service'
                        : primaryType === 'CES'
                          ? 'How easy was it to get the help you needed?'
                          : 'How can we improve?'
                  }
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Interactive Scoring Preview */}
        {isScoringType && (
          <div className="space-y-4 rounded-lg border p-6 bg-gray-50">
            <div className="flex items-center justify-end">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                Preview Only
              </span>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium mb-4 text-center">
                {form.watch('content.mainQuestion') || getScoringDefaults().mainQuestion}
              </h4>
              {primaryType === 'NPS' && (
                <NPSRating value={undefined} onChange={() => {}} disabled={true} />
              )}
              {primaryType === 'CSAT' && (
                <CSATRating value={undefined} onChange={() => {}} disabled={true} />
              )}
              {primaryType === 'CES' && (
                <CESRating value={undefined} onChange={() => {}} disabled={true} />
              )}
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="content.submitButtonText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Submit Button Text</FormLabel>
              <FormDescription>Text displayed on the submit button</FormDescription>
              <FormControl>
                <Input
                  placeholder={isScoringType ? 'Submit Rating' : 'Submit Feedback'}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">Thank You Screen</h3>

          <FormField
            control={form.control}
            name="content.thankYouTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thank You Title</FormLabel>
                <FormDescription>Title shown after submission</FormDescription>
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
                <FormDescription>Message shown after submission</FormDescription>
                <FormControl>
                  <Textarea
                    placeholder={
                      isScoringType
                        ? 'Your rating helps us improve our product and service.'
                        : 'Your feedback helps us improve our product and provide better service.'
                    }
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>
  )
}
