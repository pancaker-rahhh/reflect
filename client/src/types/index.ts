export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user'
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  slug: string
  subscription_tier: string
  settings: Record<string, unknown>
  created_at: string
  updated_at?: string
  members_count?: number
  projects_count?: number
}

export interface OrganizationMember {
  userId: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joinedAt: Date
}

export interface Subscription {
  plan: 'free' | 'pro'
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodEnd: Date
  projectLimit: number
  widgetLimit: number
  responseLimit: number
}

export interface Project {
  id: string
  organization_id: string // Corrected from workspaceId
  name: string
  displayName: string
  logoUrl?: string
  mainWebsiteUrl?: string
  description?: string
  publicReviewsEnabled: boolean
  publicReviewsSlug?: string
  allowNewReviews: boolean
  reviewSortOrder: 'newest' | 'oldest' | 'highest' | 'lowest'
  seoTitleSuffix?: string
  seoMetaDescription?: string
  settings: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface Widget {
  id: string
  project_id: string
  name: string
  description?: string
  widget_type:
    | 'FEEDBACK'
    | 'SURVEY'
    | 'REVIEW'
    | 'BUG_REPORT'
    | 'FEATURE_REQUEST'
    | 'NPS'
    | 'CSAT'
    | 'CES'
  status: 'draft' | 'active' | 'inactive' | 'archived'
  configuration: {
    modules?: {
      feedback?: boolean
      reviews?: boolean
      bugReporting?: boolean
      featureRequests?: boolean
    }
    content?: {
      headerTitle?: string
      mainQuestion?: string
      submitButtonText?: string
      thankYouTitle?: string
      thankYouMessage?: string
      reviewPrompt?: string
      requireReviewText?: boolean
      requireStepsToReproduce?: boolean
      requireUseCase?: boolean
    }
    typeSpecificSettings?: {
      reviewPrompt?: string
      requireReviewText?: boolean
      requireStepsToReproduce?: boolean
      requireUseCase?: boolean
    }
  }
  theme_configuration: {
    primary?: string
    headerGradientEnd?: string
    background?: string
    text?: string
    buttonColor?: string
    buttonTextColor?: string
    theme_name?: 'default' | 'midnight' | 'minimal-light' | 'minimal-dark'
    show_branding?: boolean
  }
  targeting_rules: Array<Record<string, unknown>>
  embed_code?: string
  public_key: string
  position: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left' | 'center'
  is_active: boolean
  created_at: string
  updated_at: string
}

export type FeedbackType =
  | 'general'
  | 'survey'
  | 'review'
  | 'bug_report'
  | 'feature_request'
  | 'nps'
  | 'csat'
  | 'ces'

export interface BaseFeedback {
  id: string
  projectId: string
  widgetId: string
  type: FeedbackType
  userEmail?: string
  userName?: string
  userId?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface SurveyResponse extends BaseFeedback {
  type: 'survey'
  surveyType: 'NPS' | 'CSAT' | 'CES' | 'CUSTOM'
  score: number
  comment?: string
}

export interface Review extends BaseFeedback {
  type: 'review'
  rating: number
  title: string
  content: string
  isPublished: boolean
  publishedAt?: Date
}

export interface BugReport extends BaseFeedback {
  type: 'bug_report'
  severity: 'low' | 'medium' | 'high' | 'critical'
  stepsToReproduce?: string
  expectedBehavior?: string
  actualBehavior?: string
  attachments?: string[]
}

export interface FeatureRequest extends BaseFeedback {
  type: 'feature_request'
  useCase?: string
  suggestedSolution?: string
  benefits?: string
  implementationStatus?: 'backlog' | 'planned' | 'in-progress' | 'completed'
}

export type Feedback = SurveyResponse | Review | BugReport | FeatureRequest

export interface RoadmapTag {
  id: string
  roadmap_id: string
  name: string
  color: string
  created_at: Date | string
  updated_at: Date | string
}

export interface RoadmapActionItemTag {
  id: string
  feature_id: string
  tag_id: string
  tag: RoadmapTag
  created_at: Date | string
  updated_at: Date | string
}

export interface RoadmapActionItem {
  id: string
  column_id: string
  feedback_id?: string
  title: string
  description?: string
  order: number
  vote_count: number
  submitter_name?: string
  submitter_email?: string
  tags: RoadmapTag[]
  feature_tags?: RoadmapActionItemTag[]
  created_at: Date | string
  updated_at: Date | string
}

export interface RoadmapColumn {
  id: string
  roadmap_id: string
  name: string
  status: 'new' | 'in-progress' | 'planned' | 'under-review'
  color: string
  order: number
  features: RoadmapActionItem[]
}

export interface Roadmap {
  id: string
  project_id: string
  name: string
  is_public: boolean
  subdomain: string
  public_slug?: string
  logo_url?: string
  columns: RoadmapColumn[]
  tags: RoadmapTag[]
  created_at: Date | string
  updated_at: Date | string
}

export interface PaginatedProjects {
  items: Project[]
  meta: {
    total: number
    page: number
    limit: number
  }
}

export interface DashboardMetrics {
  totalFeedback: number
  feedbackChange: number
  averageRating: number
  ratingChange: number
  newBugReports: number
  bugReportsChange: number
  newFeatureRequests: number
  featureRequestsChange: number
  pendingFeedbackReview?: number
  feedbackConversionRate?: number
}

export interface RecentActivity {
  id: string
  type: FeedbackType
  summary: string
  submittedBy: string
  timestamp: Date
  converted_to_action_item_id?: string | null
  is_actionable?: boolean
}

export interface NotificationSettings {
  newSurveyResponses: boolean
  newReviews: boolean
  newBugReports: boolean
  newFeatureRequests: boolean
}
