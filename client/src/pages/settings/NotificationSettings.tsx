import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell, MessageSquare, Star, Bug, Lightbulb } from 'lucide-react'
import type { NotificationSettings as NotificationSettingsType } from '@/types'

const notificationTypes = [
  {
    key: 'newSurveyResponses' as keyof NotificationSettingsType,
    title: 'New Survey Responses',
    description: 'Alerts for NPS, CSAT, and custom survey submissions',
    icon: MessageSquare
  },
  {
    key: 'newReviews' as keyof NotificationSettingsType,
    title: 'New Reviews & Testimonials',
    description: 'Alerts for user-submitted reviews and testimonials',
    icon: Star
  },
  {
    key: 'newBugReports' as keyof NotificationSettingsType,
    title: 'New Bug Reports',
    description: 'Alerts for issues and bugs submitted by users',
    icon: Bug
  },
  {
    key: 'newFeatureRequests' as keyof NotificationSettingsType,
    title: 'New Feature Requests',
    description: 'Alerts for new user ideas and suggestions',
    icon: Lightbulb
  }
]

export function NotificationSettings() {
  const queryClient = useQueryClient()
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => api.getNotificationSettings()
  })

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: NotificationSettingsType) => 
      api.updateNotificationSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] })
    },
    onError: () => {
      console.error('Failed to update notification preferences')
    }
  })

  const handleToggle = (key: keyof NotificationSettingsType, value: boolean) => {
    if (!settings) return
    
    const newSettings = {
      ...settings,
      [key]: value
    }
    
    updateSettingsMutation.mutate(newSettings)
  }

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure which email notifications you'd like to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which feedback types trigger team notification emails. Changes are saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationTypes.map((notification) => {
            const Icon = notification.icon
            const isEnabled = settings[notification.key]
            
            return (
              <div key={notification.key} className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <Label 
                      htmlFor={notification.key}
                      className="text-base font-medium cursor-pointer"
                    >
                      {notification.title}
                    </Label>
                    <Switch
                      id={notification.key}
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleToggle(notification.key, checked)}
                      disabled={updateSettingsMutation.isPending}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}