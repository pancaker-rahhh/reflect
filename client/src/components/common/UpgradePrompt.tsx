import React from 'react'
import { AlertCircle, Zap } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface UpgradePromptProps {
  message: string
  onUpgrade?: () => void
}

export function UpgradePrompt({ message, onUpgrade }: UpgradePromptProps) {
  const navigate = useNavigate()

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      navigate('/settings/billing')
    }
  }

  return (
    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900 dark:text-blue-100">Upgrade Required</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-blue-800 dark:text-blue-200">{message}</p>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleUpgrade} className="gap-2">
            <Zap className="h-4 w-4" />
            Upgrade to Pro
          </Button>
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Unlock unlimited features
          </span>
        </div>
      </AlertDescription>
    </Alert>
  )
}
