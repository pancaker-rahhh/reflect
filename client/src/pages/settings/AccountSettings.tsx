import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type UserProfileUpdateRequest } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, Mail, Info } from 'lucide-react'

export function AccountSettings() {
  const [name, setName] = useState('')
  const [isEdited, setIsEdited] = useState(false)
  
  const queryClient = useQueryClient()
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.getCurrentUser()
  })

  // Set name when user data is loaded
  useEffect(() => {
    if (user?.name) {
      setName(user.name)
    } else if (user) {
      // If user exists but has no name, initialize with empty string
      setName('')
    }
  }, [user])

  const updateProfileMutation = useMutation({
    mutationFn: (data: UserProfileUpdateRequest) => api.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      setIsEdited(false)
    },
    onError: (error) => {
      console.error('Failed to update profile:', error)
    }
  })

  const handleNameChange = (value: string) => {
    setName(value)
    setIsEdited(value !== user?.name)
  }

  const handleSave = () => {
    if (name.trim()) {
      updateProfileMutation.mutate({ name: name.trim() })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isEdited) {
      handleSave()
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your personal information and account preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-20 bg-muted animate-pulse rounded" />
            <div className="h-20 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your personal information and account preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your display name"
              className="w-full sm:max-w-md"
            />
            <p className="text-sm text-muted-foreground">
              This is the name that will be displayed across the platform
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative w-full sm:max-w-md">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="pl-10 bg-muted w-full"
              />
            </div>
            <Alert className="w-full sm:max-w-md">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Email addresses cannot be changed. Contact support if you need to update your email.
              </AlertDescription>
            </Alert>
          </div>

          {isEdited && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t">
              <Button 
                onClick={handleSave}
                disabled={updateProfileMutation.isPending || !name.trim()}
                className="min-w-[120px]"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setName(user?.name || '')
                  setIsEdited(false)
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}