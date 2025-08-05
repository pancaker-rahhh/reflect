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

interface Step2ContentProps {
  form: UseFormReturn<any>
}

export function Step2Content({ form }: Step2ContentProps) {
  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="content.headerTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Widget Header Title</FormLabel>
              <FormDescription>
                The main title shown at the top of your widget
              </FormDescription>
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
              <FormDescription>
                The primary question you want to ask your users
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="How likely are you to recommend our product to a friend or colleague?"
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
              <FormLabel>Submit Button Text</FormLabel>
              <FormDescription>
                Text displayed on the submit button
              </FormDescription>
              <FormControl>
                <Input placeholder="Submit Feedback" {...field} />
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
                <FormDescription>
                  Title shown after submission
                </FormDescription>
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
                <FormDescription>
                  Message shown after submission
                </FormDescription>
                <FormControl>
                  <Textarea 
                    placeholder="Your feedback helps us improve our product and provide better service."
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