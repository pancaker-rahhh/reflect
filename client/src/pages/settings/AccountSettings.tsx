import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type UserProfileUpdateRequest } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, Mail, Info, User, CreditCard } from 'lucide-react'
import { BillingPageContent } from './BillingPageContent'

type Tab = 'account' | 'billing'

export function AccountSettings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [name, setName] = useState('')
  const [isEdited, setIsEdited] = useState(false)

  const tabParam = searchParams.get('tab')
  const isValidTab = (tab: string | null): tab is Tab => tab === 'account' || tab === 'billing'
  const activeTab: Tab = isValidTab(tabParam) ? tabParam : 'account'

  const handleTabChange = (tab: Tab) => {
    setSearchParams({ tab })
  }

  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.getCurrentUser(),
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
    },
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

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ]

  const renderAccountSettings = () => (
    <div className="p-6 space-y-6">
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
          <Input id="email" value={user?.email || ''} disabled className="pl-10 bg-muted w-full" />
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
    </div>
  )

  const renderBillingSettings = () => (
    <div className="p-6">
      <BillingPageContent />
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountSettings()
      case 'billing':
        return renderBillingSettings()
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Loading Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted/30 rounded-full mx-auto animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 bg-muted/30 rounded-lg w-64 mx-auto animate-pulse"></div>
              <div className="h-4 bg-muted/30 rounded w-96 mx-auto animate-pulse"></div>
            </div>
          </div>

          {/* Loading Cards */}
          {[1, 2].map((i) => (
            <div key={i} className="bg-muted/20 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-muted/30 rounded w-48 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted/30 rounded w-full"></div>
                <div className="h-4 bg-muted/30 rounded w-3/4"></div>
                <div className="h-4 bg-muted/30 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center space-y-6 mb-12">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your personal information and account preferences
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-tertiary rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-border">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as Tab)}
                  className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors relative ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="min-h-[400px]">{renderTabContent()}</div>
      </div>
    </div>
  )
}
