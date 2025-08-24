import React, { useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MessageSquare, Star, Bug, Lightbulb } from 'lucide-react'

interface Step1BasicsProps {
  form: UseFormReturn<WidgetFormData>
}

const MODULE_DEFINITIONS = [
  {
    id: 'feedback',
    label: 'Collect Feedback/Surveys',
    description: 'Gather NPS, CSAT, CES and custom surveys',
    icon: MessageSquare,
  },
  {
    id: 'reviews',
    label: 'Reviews',
    description: 'Collect and display customer reviews',
    icon: Star,
  },
  {
    id: 'bugReporting',
    label: 'Bug Reporting',
    description: 'Let users report issues and bugs',
    icon: Bug,
  },
  {
    id: 'featureRequests',
    label: 'Feature Suggestions',
    description: 'Collect feature requests and ideas',
    icon: Lightbulb,
  },
]

interface PrimaryTypeSelectorProps {
  modules: Record<string, boolean> | undefined
  form: UseFormReturn<WidgetFormData>
}

function PrimaryTypeSelector({ modules, form }: PrimaryTypeSelectorProps) {
  const safeModules = modules || { feedback: true, reviews: false, bugReporting: false, featureRequests: false }
  const enabledModules = Object.entries(safeModules).filter(([, enabled]) => Boolean(enabled))
  const showSelector = enabledModules.length > 1 || (enabledModules.length === 1 && enabledModules[0][0] === 'feedback')
  
  if (!showSelector) return null

  const moduleTypeMap: Record<string, { value: string; label: string }[]> = {
    feedback: [
      { value: 'FEEDBACK', label: 'General Feedback' },
      { value: 'NPS', label: 'NPS Survey' },
      { value: 'CSAT', label: 'CSAT Survey' },
      { value: 'CES', label: 'CES Survey' },
      { value: 'SURVEY', label: 'Custom Survey' }
    ],
    reviews: [{ value: 'REVIEW', label: 'Customer Review' }],
    bugReporting: [{ value: 'BUG_REPORT', label: 'Bug Report' }],
    featureRequests: [{ value: 'FEATURE_REQUEST', label: 'Feature Request' }]
  }
  
  const allOptions: { value: string; label: string }[] = []
  enabledModules.forEach(([moduleKey]) => {
    const options = moduleTypeMap[moduleKey] || []
    allOptions.push(...options)
  })

  return (
    <FormField
      control={form.control}
      name="primaryType"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg font-semibold mb-4">
            {enabledModules.length > 1 ? 'Primary Widget Type' : 'Feedback Type'}
          </FormLabel>
          <FormDescription>
            {enabledModules.length > 1 
              ? 'Choose the main type users will see first' 
              : 'Choose the type of feedback to collect'
            }
          </FormDescription>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {allOptions.length > 0 
                ? allOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                : (
                    <SelectItem value="FEEDBACK">
                      General Feedback
                    </SelectItem>
                  )
              }
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function Step1Basics({ form }: Step1BasicsProps) {
  const modules = form.watch('modules') || { feedback: true, reviews: false, bugReporting: false, featureRequests: false }
  
  // Auto-select primaryType based on enabled modules
  useEffect(() => {
    if (!modules || typeof modules !== 'object') return
    
    const enabledModules = Object.entries(modules).filter(([, enabled]) => Boolean(enabled))
    
    if (enabledModules.length === 1) {
      const [moduleKey] = enabledModules[0]
      const moduleTypeMap: Record<string, string> = {
        feedback: 'FEEDBACK',
        reviews: 'REVIEW', 
        bugReporting: 'BUG_REPORT',
        featureRequests: 'FEATURE_REQUEST'
      }
      
      const newPrimaryType = moduleTypeMap[moduleKey]
      if (newPrimaryType && form.getValues('primaryType') !== newPrimaryType) {
        form.setValue('primaryType', newPrimaryType as any)
      }
    } else if (enabledModules.length === 0) {
      // Default to feedback if no modules selected
      form.setValue('modules.feedback', true)
      form.setValue('primaryType', 'FEEDBACK')
    }
  }, [modules, form])

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold mb-4">Widget Name</FormLabel>
              <FormDescription>
                Internal name to identify this widget (not visible to users)
              </FormDescription>
              <FormControl>
                <Input placeholder="e.g., Main App Feedback Widget" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <h3 className="text-lg font-semibold mb-4">Widget Modules</h3>
          <div className="space-y-4">
            {MODULE_DEFINITIONS.map((module) => {
              type ModuleFieldName =
                | 'modules.feedback'
                | 'modules.reviews'
                | 'modules.bugReporting'
                | 'modules.featureRequests'
              const fieldName = `modules.${module.id}` as ModuleFieldName
              return (
                <FormField
                  key={module.id}
                  control={form.control}
                  name={fieldName}
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border p-4">
                      <FormControl>
                        <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none flex-1">
                        <FormLabel className="flex items-center gap-2">
                          <module.icon className="h-4 w-4" />
                          {module.label}
                        </FormLabel>
                        <FormDescription>{module.description}</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )
            })}
          </div>
        </div>

<PrimaryTypeSelector modules={modules} form={form} />
      </div>
    </Form>
  )
}
