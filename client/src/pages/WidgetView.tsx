import { useEffect, useState } from 'react'
import { feedbackApi } from '@/lib/api/feedback'
import { WidgetCore } from '@/components/widgets/core/WidgetCore'
import type {
  WidgetConfiguration,
  WidgetState,
  FeedbackData,
  FeedbackType,
} from '@/components/widgets/core/types'

// Use actual colors from configuration
function getConfigColors(themeConfig: any) {
  return {
    primary: themeConfig?.primary || '#0066FF',
    headerGradientEnd: themeConfig?.headerGradientEnd,
    background: themeConfig?.background || '#FFFFFF',
    text: themeConfig?.text || '#000000',
    buttonColor: themeConfig?.buttonColor || '#0066FF',
    buttonTextColor: themeConfig?.buttonTextColor || '#FFFFFF',
  }
}

// API function to get widget data
async function getWidgetData(key: string) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  const response = await fetch(`${apiBaseUrl}/public/widgets/${key}`)
  if (!response.ok) throw new Error('Failed to fetch widget configuration')
  return response.json()
}

// Convert backend widget config to WidgetConfiguration format
function transformWidgetConfig(backendConfig: Record<string, any>): WidgetConfiguration {
  const theme = backendConfig.theme_configuration || {}
  const content = backendConfig.configuration?.content || {}
  const modules = backendConfig.configuration?.modules || {}

  return {
    modules: {
      feedback: modules.feedback ?? true,
      reviews: modules.reviews ?? false,
      bugReporting: modules.bugReporting ?? false,
      featureRequests: modules.featureRequests ?? false,
    },
    primaryType: (backendConfig.widget_type?.toUpperCase() || 'FEEDBACK') as FeedbackType,
    content: {
      headerTitle: content.headerTitle || 'We value your feedback',
      mainQuestion: content.mainQuestion || getDefaultQuestionForType(backendConfig.widget_type),
      submitButtonText: content.submitButtonText || 'Submit Feedback',
      thankYouTitle: content.thankYouTitle || 'Thank you!',
      thankYouMessage: content.thankYouMessage || 'Your feedback helps us improve.',
    },
    appearance: {
      theme: theme.theme_name || 'default',
      position: backendConfig.position || 'bottom_right',
      colors: getConfigColors(theme),
      showBranding: theme.show_branding !== false,
    },
    behavior: {
      triggerType: 'immediate',
      deviceTypes: { desktop: true, mobile: true, tablet: true },
    },
    publicKey: backendConfig.public_key,
  }
}

function getDefaultQuestionForType(type: string) {
  switch (type) {
    case 'nps':
      return 'How likely are you to recommend us to a friend or colleague?'
    case 'csat':
      return 'How satisfied are you with our service?'
    case 'ces':
      return 'How easy was it to use our service?'
    default:
      return 'How can we improve?'
  }
}

export function WidgetView() {
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfiguration | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [widgetState, setWidgetState] = useState<WidgetState>({ type: 'loading' })

  // --- DATA FETCHING ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const key = params.get('key')
    if (!key) {
      setWidgetState({ type: 'error', message: 'Public key is missing.' })
      return
    }
    setPublicKey(key)
    getWidgetData(key)
      .then((data) => {
        const config = transformWidgetConfig(data)
        setWidgetConfig(config)
        setWidgetState({ type: 'closed' })
      })
      .catch((err) => {
        console.error(err)
        setWidgetState({ type: 'error', message: 'Could not load widget configuration.' })
      })
  }, [])

  // --- SUBMISSION HANDLERS ---
  const handleSubmit = async (data: FeedbackData) => {
    if (!publicKey) return

    try {
      await feedbackApi.submit({
        widgetKey: publicKey,
        response: data.response,
      })
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Submission failed')
    }
  }

  const handleClose = () => {
    // Send close message to parent window (for iframe communication)
    window.parent?.postMessage({ type: 'WIDGET_CLOSE' }, '*')
  }

  if (!widgetConfig) {
    return null // Loading and error states are handled by WidgetCore
  }

  return (
    <WidgetCore
      config={widgetConfig}
      mode="production"
      state={widgetState}
      onSubmit={handleSubmit}
      onClose={handleClose}
      onStateChange={setWidgetState}
    />
  )
}
