import { useState } from 'react'
import { Copy, CheckCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { config } from '@/config'

interface Step3GetCodeProps {
  publicLink: string
  formName: string
  embedCode?: string | null
}

export function Step3GetCode({
  publicLink,
  formName,
  embedCode: embedCodeFromApi,
}: Step3GetCodeProps) {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  // Use current environment URL (localhost in dev, production in prod)
  // Use /public/forms/ to match roadmap pattern (/public/roadmap/)
  const publicUrl = `${config.frontendUrl}/public/forms/${publicLink}`

  // Use CDN embed code from API if available, otherwise fallback to iframe
  const embedCode =
    embedCodeFromApi ||
    `<!-- ${formName} Form Embed -->
<iframe
  src="${publicUrl}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto py-12 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold tracking-tight mb-2">Done!</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Congratulations, your form is ready to be shared.
      </p>

      <div className="bg-card border rounded-lg p-6 text-left space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Share your form with users:</h2>

          <div className="space-y-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Public Link:</strong> Share this URL directly
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted rounded-md p-3 font-mono text-sm break-all">
                  {publicUrl}
                </div>
                <Button variant="ghost" size="sm" onClick={handleCopyUrl} className="shrink-0">
                  {copiedUrl ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(publicUrl, '_blank')}
                  className="shrink-0"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Embed Code:</strong> Add to your website
              </p>
              <div className="bg-muted rounded-md p-4 relative">
                <div className="pr-28">
                  <pre className="text-sm overflow-x-auto">
                    <code className="whitespace-pre-wrap break-words">{embedCode}</code>
                  </pre>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm"
                  onClick={handleCopyCode}
                >
                  {copiedCode ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
              {embedCodeFromApi && (
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Paste this code just before the closing &lt;/body&gt; tag of your website
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4">What&apos;s Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-2">Share Your Form</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Share the public link directly or embed it on your website using the embed code.
            </p>
            <p className="text-xs text-blue-600">💡 Works with any website or platform</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-2">Create More Forms</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Build different forms for different purposes - surveys, feedback, registrations, or
              applications.
            </p>
            <p className="text-xs text-green-600">
              🎯 Collect responses and manage them all in one place
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-2">Monitor & Improve</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Track responses in your dashboard and adjust your forms based on user feedback.
            </p>
            <p className="text-xs text-purple-600">📊 View all responses and export data</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button asChild variant="outline">
            <a href="/app/forms">Back to Forms</a>
          </Button>
          <Button asChild>
            <a href="/app/forms/new">Create Another Form</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
