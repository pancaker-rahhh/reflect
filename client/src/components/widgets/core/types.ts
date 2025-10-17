export type FeedbackType =
  | 'FEEDBACK'
  | 'SURVEY'
  | 'REVIEW'
  | 'BUG_REPORT'
  | 'FEATURE_REQUEST'
  | 'NPS'
  | 'CSAT'
  | 'CES'

export type WidgetMode = 'preview' | 'production'

export type WidgetState =
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'closed' }
  | { type: 'menu'; availableTypes: FeedbackType[] }
  | { type: 'active'; feedbackType: FeedbackType }
  | { type: 'submitting' }
  | { type: 'success' }

export interface ModuleConfig {
  feedback: boolean
  reviews: boolean
  bugReporting: boolean
  featureRequests: boolean
}

export interface ContentConfig {
  headerTitle: string
  mainQuestion: string
  submitButtonText: string
  thankYouTitle: string
  thankYouMessage: string
  npsScore?: number
  csatScore?: number
  cesScore?: number
}

export interface AppearanceColors {
  primary: string
  headerGradientEnd?: string
  background: string
  text: string
  buttonColor: string
  buttonTextColor: string
}

export interface AppearanceConfig {
  theme: 'default' | 'midnight' | 'minimal-light' | 'minimal-dark'
  position: 'bottom_right' | 'bottom_left' | 'mid_right' | 'mid_left'
  colors: AppearanceColors
  showBranding: boolean
}

export interface BehaviorConfig {
  triggerType: 'immediate' | 'delay' | 'exit-intent' | 'scroll'
  triggerDelay?: number
  deviceTypes: {
    desktop: boolean
    mobile: boolean
    tablet: boolean
  }
  urlTargeting?: {
    includeUrls: string[]
    excludeUrls: string[]
  }
}

export interface WidgetConfiguration {
  modules: ModuleConfig
  primaryType: FeedbackType
  content: ContentConfig
  appearance: AppearanceConfig
  behavior: BehaviorConfig
  publicKey?: string
  widgetKey?: string
  // Optional per-type content overrides. When present, the widget should use
  // these values for the corresponding active feedback type, falling back to
  // the base `content` fields when an override is missing.
  contentByType?: Partial<Record<FeedbackType, Partial<ContentConfig>>>
}

// Type-specific data interfaces
export interface NPSFeedbackData {
  nps_score: number
  promoter_category: 'promoter' | 'passive' | 'detractor'
}

export interface CSATFeedbackData {
  csat_score: number
  satisfaction_level:
    | 'very_dissatisfied'
    | 'dissatisfied'
    | 'neutral'
    | 'satisfied'
    | 'very_satisfied'
}

export interface CESFeedbackData {
  ces_score: number
  ease_level: 'very_difficult' | 'difficult' | 'neutral' | 'easy' | 'very_easy'
}

export interface ReviewFeedbackData {
  overall_rating: number
}

export interface BugReportFeedbackData {
  severity: string
}

export interface FeatureRequestFeedbackData {}

export interface GeneralFeedbackData {
  message: string
}

export interface FeedbackData {
  response?: string
  rating?: number
  feedbackType: FeedbackType
  typeSpecificData?:
    | NPSFeedbackData
    | CSATFeedbackData
    | CESFeedbackData
    | ReviewFeedbackData
    | BugReportFeedbackData
    | FeatureRequestFeedbackData
    | GeneralFeedbackData
}

export interface WidgetCoreProps {
  config: WidgetConfiguration
  mode: WidgetMode
  state?: WidgetState
  onSubmit?: (data: FeedbackData) => Promise<void>
  onClose?: () => void
  onStateChange?: (state: WidgetState) => void
}

export interface FeedbackTypeSelectorProps {
  availableTypes: FeedbackType[]
  onSelectType: (type: FeedbackType) => void
  config: WidgetConfiguration
}

export interface FeedbackTypeInfo {
  type: FeedbackType
  title: string
  description: string
  icon: string
}

export const FEEDBACK_TYPE_INFO: Record<FeedbackType, FeedbackTypeInfo> = {
  FEEDBACK: {
    type: 'FEEDBACK',
    title: 'General Feedback',
    description: 'Share your thoughts and suggestions',
    icon: '💬',
  },
  SURVEY: {
    type: 'SURVEY',
    title: 'Survey',
    description: 'Answer a quick survey',
    icon: '📝',
  },
  REVIEW: {
    type: 'REVIEW',
    title: 'Leave a Review',
    description: 'Rate your experience',
    icon: '⭐',
  },
  BUG_REPORT: {
    type: 'BUG_REPORT',
    title: 'Report a Bug',
    description: 'Tell us about any issues you found',
    icon: '🐛',
  },
  FEATURE_REQUEST: {
    type: 'FEATURE_REQUEST',
    title: 'Request Feature',
    description: 'Suggest new features or improvements',
    icon: '✨',
  },
  NPS: {
    type: 'NPS',
    title: 'Rate Recommendation',
    description: 'How likely are you to recommend us?',
    icon: '📊',
  },
  CSAT: {
    type: 'CSAT',
    title: 'Satisfaction Rating',
    description: 'How satisfied are you with our service?',
    icon: '😊',
  },
  CES: {
    type: 'CES',
    title: 'Effort Rating',
    description: 'How easy was it to get help?',
    icon: '⚡',
  },
}
