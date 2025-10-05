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
import { type WidgetFormData } from '@/pages/WidgetCreate'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Step2ContentProps {
  form: UseFormReturn<WidgetFormData>
}

export function Step2Content({ form }: Step2ContentProps) {
  const primaryType = form.watch('primaryType')
  const modules = form.watch('modules') || {
    feedback: true,
    reviews: false,
    bugReporting: false,
    featureRequests: false,
  }

  // Build enabled types list based on modules (only those selected in Step 1)
  const enabledTypes = React.useMemo(() => {
    const typeLabel = (t: WidgetFormData['primaryType']) => {
      switch (t) {
        case 'FEEDBACK':
          return 'Feedback'
        case 'NPS':
          return 'NPS'
        case 'CSAT':
          return 'CSAT'
        case 'CES':
          return 'CES'
        case 'SURVEY':
          return 'Survey'
        case 'REVIEW':
          return 'Reviews'
        case 'BUG_REPORT':
          return 'Bug Reports'
        case 'FEATURE_REQUEST':
          return 'Feature Requests'
      }
    }

    const list: { value: WidgetFormData['primaryType']; label: string }[] = []

    if (modules.feedback) {
      list.push({ value: primaryType, label: typeLabel(primaryType) })

      if (primaryType !== 'FEEDBACK') {
        list.push({ value: 'FEEDBACK', label: typeLabel('FEEDBACK') })
      }
    }
    if (modules.reviews) list.push({ value: 'REVIEW', label: typeLabel('REVIEW') })
    if (modules.bugReporting) list.push({ value: 'BUG_REPORT', label: typeLabel('BUG_REPORT') })
    if (modules.featureRequests)
      list.push({ value: 'FEATURE_REQUEST', label: typeLabel('FEATURE_REQUEST') })

    // de-dup
    return Array.from(new Map(list.map((t) => [t.value, t])).values())
  }, [modules, primaryType])

  // Active type selector state
  const [activeType, setActiveType] = React.useState<WidgetFormData['primaryType']>(primaryType)

  React.useEffect(() => {
    if (!enabledTypes.find((t) => t.value === activeType)) {
      setActiveType(primaryType)
    }
  }, [enabledTypes, primaryType, activeType])

  const getTypeDefaults = React.useCallback(
    (type: WidgetFormData['primaryType'] = primaryType) => {
      switch (type) {
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
            thankYouMessage:
              'We appreciate your input and will consider this feature for future updates.',
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
    },
    [primaryType]
  )

  // Update base content defaults when primaryType changes
  React.useEffect(() => {
    const currentValues = form.getValues('content')
    const defaults = getTypeDefaults()

    // Only update if the current values appear to be defaults (to avoid overriding user changes)
    const isUsingDefaults =
      !currentValues?.headerTitle ||
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

  // Seed defaults for new per-type entries when switching active type
  React.useEffect(() => {
    const pathBase = activeType === primaryType ? 'content' : `contentByType.${activeType}`
    const cur = form.getValues(pathBase as any) as any

    // Check if this type has any content configured
    const hasContent =
      cur &&
      (cur.headerTitle ||
        cur.mainQuestion ||
        cur.submitButtonText ||
        cur.thankYouTitle ||
        cur.thankYouMessage)

    // If no content exists, seed with defaults for this type
    if (!hasContent) {
      const d = getTypeDefaults(activeType)
      if (activeType === primaryType) {
        form.setValue('content.headerTitle', d.headerTitle)
        form.setValue('content.mainQuestion', d.mainQuestion)
        form.setValue('content.submitButtonText', d.submitButtonText)
        form.setValue('content.thankYouTitle', d.thankYouTitle)
        form.setValue('content.thankYouMessage', d.thankYouMessage)
      } else {
        form.setValue(`contentByType.${activeType}.headerTitle` as any, d.headerTitle)
        form.setValue(`contentByType.${activeType}.mainQuestion` as any, d.mainQuestion)
        form.setValue(`contentByType.${activeType}.submitButtonText` as any, d.submitButtonText)
        form.setValue(`contentByType.${activeType}.thankYouTitle` as any, d.thankYouTitle)
        form.setValue(`contentByType.${activeType}.thankYouMessage` as any, d.thankYouMessage)
      }
    }
  }, [activeType, primaryType, form, getTypeDefaults])

  // Helper to map field names for active type
  function fieldName(base: string) {
    return activeType === primaryType
      ? (`content.${base}` as const)
      : (`contentByType.${activeType}.${base}` as const)
  }

  // Get current values for the active type
  function getCurrentValues() {
    if (activeType === primaryType) {
      return form.getValues('content')
    } else {
      return form.getValues(`contentByType.${activeType}` as any) || {}
    }
  }

  return (
    <Form {...form}>
      <div className="space-y-6" key={activeType}>
        {/* Type dropdown */}
        <div>
          <FormLabel className="text-lg font-semibold mb-2">Select Feedback Type</FormLabel>
          <FormDescription className="mb-2">
            Choose a type to configure its content. Primary type updates base content.
          </FormDescription>
          <Select value={activeType} onValueChange={(v) => setActiveType(v as any)}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {enabledTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                  {t.value === primaryType ? ' (Primary)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <FormField
          control={form.control}
          name={fieldName('headerTitle') as any}
          render={({ field }) => {
            const currentValues = getCurrentValues()
            return (
              <FormItem>
                <FormLabel className="text-lg font-semibold mb-4">Widget Header Title</FormLabel>
                <FormDescription>The main title shown at the top of your widget</FormDescription>
                <FormControl>
                  <Input
                    placeholder="We value your feedback"
                    value={field.value || currentValues.headerTitle || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name={fieldName('mainQuestion') as any}
          render={({ field }) => {
            const currentValues = getCurrentValues()
            return (
              <FormItem>
                <FormLabel className="text-lg font-semibold mb-4">Main Question</FormLabel>
                <FormDescription>The primary question you want to ask your users</FormDescription>
                <FormControl>
                  <Textarea
                    placeholder={getTypeDefaults(activeType).mainQuestion}
                    className="min-h-[100px]"
                    value={field.value || currentValues.mainQuestion || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name={fieldName('submitButtonText') as any}
          render={({ field }) => {
            const currentValues = getCurrentValues()
            return (
              <FormItem>
                <FormLabel className="text-lg font-semibold mb-4">Submit Button Text</FormLabel>
                <FormDescription>Text displayed on the submit button</FormDescription>
                <FormControl>
                  <Input
                    placeholder={getTypeDefaults(activeType).submitButtonText}
                    value={field.value || currentValues.submitButtonText || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-medium">Thank You Screen</h4>

          <FormField
            control={form.control}
            name={fieldName('thankYouTitle') as any}
            render={({ field }) => {
              const currentValues = getCurrentValues()
              return (
                <FormItem>
                  <FormLabel>Thank You Title</FormLabel>
                  <FormDescription className="text-sm">
                    Title shown after submission
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder="Thank you!"
                      value={field.value || currentValues.thankYouTitle || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          <FormField
            control={form.control}
            name={fieldName('thankYouMessage') as any}
            render={({ field }) => {
              const currentValues = getCurrentValues()
              return (
                <FormItem>
                  <FormLabel>Thank You Message</FormLabel>
                  <FormDescription className="text-sm">
                    Message shown after submission
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder={getTypeDefaults(activeType).thankYouMessage}
                      className="min-h-[80px]"
                      value={field.value || currentValues.thankYouMessage || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        </div>
      </div>
    </Form>
  )
}
