import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { widgetApi } from '@/lib/api/widget' // Use the real API
import { PageLoading } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { CheckCircle, Copy, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export function WidgetGetCode() {
  const { widgetId } = useParams<{ widgetId: string }>()
  const [copied, setCopied] = useState(false)

  const {
    data: widget,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['widget', widgetId],
    queryFn: () => widgetApi.getWidget(widgetId!),
    enabled: !!widgetId,
  })

  if (isLoading) {
    return <PageLoading />
  }

  if (error || !widget) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-destructive mb-4">Error loading widget</h2>
        <p className="text-muted-foreground mb-6">
          Could not find the widget you're looking for. It might have been deleted.
        </p>
        <Button asChild>
          <Link to="/widgets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Widgets
          </Link>
        </Button>
      </div>
    )
  }

  const handleCopy = () => {
    if (widget.embed_code) {
      navigator.clipboard.writeText(widget.embed_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold tracking-tight mb-2">Done!</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Congratulations, your widget is ready to be embedded.
      </p>

      <div className="bg-card border rounded-lg p-6 text-left space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">
            {' '}
            Add this widget to your website in 3 simple steps:
          </h2>

          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 mt-2">
            <li>Copy the code below using the "Copy Code" button.</li>
            <li>
              Paste it just before the closing <strong>&lt;/body&gt;</strong> tag of your website.
            </li>
            <li>Save your changes and refresh your website.</li>
          </ol>
        </div>

        <div className="bg-muted rounded-md p-4 relative">
          <pre className="text-sm overflow-x-auto">
            <code>{widget.embed_code}</code>
          </pre>
          <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={handleCopy}>
            {copied ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="ml-2">{copied ? 'Copied!' : 'Copy Code'}</span>
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-1">Step 1: Add to Website</h4>
            <p className="text-sm text-muted-foreground">Copy and paste the embed code.</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-1">Step 2: Test Widget</h4>
            <p className="text-sm text-muted-foreground">Preview and test your widget in action.</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-1">Step 3: Reconfigure</h4>
            <p className="text-sm text-muted-foreground">Reconfigure the widget as needed.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to="/widgets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Widgets
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">View Dashboard</Link>
          </Button>
          <Button asChild>
            <Link to="/widgets/new">Create Another Widget</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
