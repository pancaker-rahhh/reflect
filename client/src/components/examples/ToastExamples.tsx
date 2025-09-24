import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToastNotifications } from '@/hooks/useToastNotifications'

export function ToastExamples() {
  const toast = useToastNotifications()

  const handleSuccess = () => {
    toast.showSuccess('Operation completed successfully!', 'Success')
  }

  const handleError = () => {
    toast.showError('Something went wrong. Please try again.', 'Error')
  }

  const handleWarning = () => {
    toast.showWarning('This action cannot be undone.', 'Warning')
  }

  const handleInfo = () => {
    toast.showInfo('New features are available in the latest update.', 'Information')
  }

  const handleLoading = () => {
    const loadingToast = toast.showLoading('Processing your request...', 'Loading')

    // Simulate async operation
    setTimeout(() => {
      loadingToast.dismiss()
      toast.showSuccess('Request processed successfully!')
    }, 3000)
  }

  const handlePromise = async () => {
    const simulateAsyncOperation = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          Math.random() > 0.5 ? resolve('Success!') : reject(new Error('Failed!'))
        }, 2000)
      })
    }

    await toast.promise(simulateAsyncOperation(), {
      loading: 'Processing request...',
      success: (data) => `Operation completed: ${data}`,
      error: (error) => `Operation failed: ${error.message}`,
    })
  }

  const handleCustomToast = () => {
    toast.success({
      title: 'Custom Toast',
      description: 'This is a custom toast with specific duration and no auto-dismiss.',
      duration: 10000,
      autoDismiss: false,
    })
  }

  const handleMultipleToasts = () => {
    toast.showInfo('First toast')
    setTimeout(() => toast.showSuccess('Second toast'), 500)
    setTimeout(() => toast.showWarning('Third toast'), 1000)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Toast System Examples</CardTitle>
          <CardDescription>
            Demonstrating the comprehensive toast notification system with multiple variants,
            auto-dismiss, and advanced features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Toast Variants */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Toast Variants</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={handleSuccess} className="bg-green-600 hover:bg-green-700">
                Success Toast
              </Button>
              <Button onClick={handleError} className="bg-red-600 hover:bg-red-700">
                Error Toast
              </Button>
              <Button onClick={handleWarning} className="bg-yellow-600 hover:bg-yellow-700">
                Warning Toast
              </Button>
              <Button onClick={handleInfo} className="bg-blue-600 hover:bg-blue-700">
                Info Toast
              </Button>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Advanced Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={handleLoading} variant="outline">
                Loading Toast
              </Button>
              <Button onClick={handlePromise} variant="outline">
                Promise Toast
              </Button>
              <Button onClick={handleCustomToast} variant="outline">
                Custom Toast
              </Button>
              <Button onClick={handleMultipleToasts} variant="outline">
                Multiple Toasts
              </Button>
            </div>
          </div>

          {/* Utility Functions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Utility Functions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => toast.dismissAll()} variant="destructive">
                Dismiss All Toasts
              </Button>
              <Button
                onClick={() => {
                  const t = toast.showInfo('This toast will be dismissed in 2 seconds')
                  setTimeout(() => t.dismiss(), 2000)
                }}
                variant="secondary"
              >
                Dismiss Specific Toast
              </Button>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Usage Examples</h3>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {`// Basic usage
const toast = useToastNotifications()

// Simple notifications
toast.showSuccess('Operation completed!')
toast.showError('Something went wrong!')
toast.showWarning('Please be careful!')
toast.showInfo('New update available!')

// Advanced usage
toast.success({
  title: 'Custom Title',
  description: 'Custom description',
  duration: 10000,
  autoDismiss: false
})

// Promise-based
await toast.promise(
  fetch('/api/data'),
  {
    loading: 'Loading data...',
    success: 'Data loaded successfully!',
    error: 'Failed to load data'
  }
)`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
