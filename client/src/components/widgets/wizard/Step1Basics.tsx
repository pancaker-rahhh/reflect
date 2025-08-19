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

const modules = [
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

export function Step1Basics({ form }: Step1BasicsProps) {
  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Widget Name</FormLabel>
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
          <h3 className="text-base font-semibold mb-4">Widget Modules</h3>
          <div className="space-y-4">
            {modules.map((module) => {
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

        {form.watch('modules.feedback') && (
          <FormField
            control={form.control}
            name="primaryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Feedback Type</FormLabel>
                <FormDescription>Choose the main type of feedback to collect</FormDescription>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a feedback type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="feedback">General Feedback</SelectItem>
                    <SelectItem value="nps">NPS Survey</SelectItem>
                    <SelectItem value="csat">CSAT Survey</SelectItem>
                    <SelectItem value="ces">CES Survey</SelectItem>
                    <SelectItem value="survey">Custom Survey</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </Form>
  )
}
