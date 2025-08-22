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
  ownerId: string
  members: OrganizationMember[]
  subscription: Subscription
  createdAt: Date
  updatedAt: Date
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
  organizationId: string
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
  createdAt: Date
  updatedAt: Date
}

export interface Widget {
  id: string
  projectId: string
  name: string
  isActive: boolean
  modules: {
    feedback: boolean
    reviews: boolean
    bugReporting: boolean
    featureRequests: boolean
  }
  primaryType: 'nps' | 'csat' | 'ces' | 'custom'
  content: {
    headerTitle: string
    mainQuestion: string
    submitButtonText: string
    thankYouTitle: string
    thankYouMessage: string
  }
  appearance: {
    theme: 'default' | 'midnight' | 'minimal-light' | 'minimal-dark'
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
    colors: {
      primary: string
      headerGradientEnd?: string
      background: string
      text: string
      buttonColor: string
      buttonTextColor: string
    }
    showBranding: boolean
  }
  behavior: {
    triggerType: 'immediate' | 'delay' | 'exit-intent' | 'scroll'
    triggerDelay?: number
    urlTargeting: {
      includeUrls: string[]
      excludeUrls: string[]
    }
    deviceTypes: {
      desktop: boolean
      mobile: boolean
      tablet: boolean
    }
  }
  createdAt: Date
  updatedAt: Date
}

export type FeedbackType = 'survey' | 'review' | 'bug' | 'feature'

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
  surveyType: 'nps' | 'csat' | 'ces' | 'custom'
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
  type: 'bug'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'investigating' | 'confirmed' | 'resolved' | 'wont-fix'
  browser?: string
  os?: string
  url?: string
  screenshot?: string
}

export interface FeatureRequest extends BaseFeedback {
  type: 'feature'
  title: string
  description: string
  status: 'new' | 'under-review' | 'planned' | 'in-progress' | 'completed' | 'declined'
  upvotes: number
  roadmapColumnId?: string
  submitterName?: string
  submitterEmail?: string
  tags?: RoadmapTag[]
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

export interface RoadmapFeatureTag {
  id: string
  feature_id: string
  tag_id: string
  tag: RoadmapTag
  created_at: Date | string
  updated_at: Date | string
}

export interface RoadmapFeature {
  id: string
  column_id: string
  title: string
  description?: string
  order: number
  vote_count: number
  submitter_name?: string
  submitter_email?: string
  tags: RoadmapTag[]
  feature_tags?: RoadmapFeatureTag[]
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
  features: RoadmapFeature[]
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
}

export interface RecentActivity {
  id: string
  type: FeedbackType
  summary: string
  submittedBy: string
  timestamp: Date
}

export interface NotificationSettings {
  newSurveyResponses: boolean
  newReviews: boolean
  newBugReports: boolean
  newFeatureRequests: boolean
}
