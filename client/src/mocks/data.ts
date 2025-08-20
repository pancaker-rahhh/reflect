import type {
  User,
  Organization,
  Project,
  Widget,
  Feedback,
  DashboardMetrics,
  RecentActivity,
  NotificationSettings,
  Roadmap,
  Review,
  BugReport,
  FeatureRequest,
  SurveyResponse,
} from '@/types'

const currentUser: User = {
  id: 'user-1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
  role: 'admin',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const organizations: Organization[] = [
  {
    id: 'org-1',
    name: 'webapp',
    slug: 'webapp',
    ownerId: 'user-1',
    members: [
      {
        userId: 'user-1',
        role: 'owner',
        joinedAt: new Date('2024-01-01'),
      },
    ],
    subscription: {
      plan: 'free',
      status: 'active',
      currentPeriodEnd: new Date('2024-12-31'),
      projectLimit: 1,
      widgetLimit: 1,
      responseLimit: 20,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

const projects: Project[] = [
  {
    id: 'project-1',
    organizationId: 'org-1',
    name: 'Main App',
    displayName: 'Main Application',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=mainapp',
    mainWebsiteUrl: 'https://example.com',
    description: 'Our main web application for customers',
    publicReviewsEnabled: false,
    allowNewReviews: true,
    reviewSortOrder: 'newest',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

const widgets: Widget[] = [
  {
    id: 'widget-1',
    projectId: 'project-1',
    name: 'webapp feedback widget',
    isActive: true,
    modules: {
      feedback: true,
      reviews: true,
      bugReporting: true,
      featureRequests: true,
    },
    primaryType: 'nps',
    content: {
      headerTitle: 'We value your feedback',
      mainQuestion: 'How likely are you to recommend our product to a friend or colleague?',
      submitButtonText: 'Submit Feedback',
      thankYouTitle: 'Thank you!',
      thankYouMessage: 'Your feedback helps us improve.',
    },
    appearance: {
      theme: 'default',
      position: 'bottom-right',
      colors: {
        primary: '#6B46C1',
        background: '#FFFFFF',
        text: '#1F2937',
        buttonColor: '#6B46C1',
        buttonTextColor: '#FFFFFF',
      },
      showBranding: true,
    },
    behavior: {
      triggerType: 'immediate',
      urlTargeting: {
        includeUrls: [],
        excludeUrls: [],
      },
      deviceTypes: {
        desktop: true,
        mobile: true,
        tablet: true,
      },
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

const generateFeedback = (): Feedback[] => {
  const feedback: Feedback[] = []

  // Generate survey responses
  for (let i = 0; i < 15; i++) {
    const survey: SurveyResponse = {
      id: `survey-${i}`,
      projectId: 'project-1',
      widgetId: 'widget-1',
      type: 'survey',
      surveyType: 'NPS',
      score: Math.floor(Math.random() * 10) + 1,
      comment: i % 3 === 0 ? 'Great product! Love using it.' : undefined,
      userEmail: `user${i}@example.com`,
      userName: `User ${i}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    }
    feedback.push(survey)
  }

  // Generate reviews
  const reviewTitles = [
    'Excellent Service',
    'Could be better',
    'Amazing product!',
    'Satisfied customer',
  ]
  for (let i = 0; i < 8; i++) {
    const review: Review = {
      id: `review-${i}`,
      projectId: 'project-1',
      widgetId: 'widget-1',
      type: 'review',
      rating: Math.floor(Math.random() * 3) + 3,
      title: reviewTitles[i % reviewTitles.length],
      content: 'This product has really helped streamline our workflow. The team loves it!',
      isPublished: i < 5,
      publishedAt: i < 5 ? new Date(Date.now() - i * 24 * 60 * 60 * 1000) : undefined,
      userEmail: `reviewer${i}@example.com`,
      userName: `Reviewer ${i}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    }
    feedback.push(review)
  }

  // Generate bug reports
  const bugTitles = [
    'Login button not working',
    'Page loads slowly',
    'Error on checkout',
    'Mobile layout issue',
  ]
  for (let i = 0; i < 5; i++) {
    const bug: BugReport = {
      id: `bug-${i}`,
      projectId: 'project-1',
      widgetId: 'widget-1',
      type: 'bug',
      title: bugTitles[i % bugTitles.length],
      description:
        'When I try to click the button, nothing happens. This started happening after the last update.',
      severity: (['low', 'medium', 'high', 'critical'] as const)[Math.floor(Math.random() * 4)],
      status: (['new', 'investigating', 'confirmed'] as const)[Math.floor(Math.random() * 3)],
      browser: 'Chrome 120',
      os: 'Windows 11',
      url: 'https://example.com/dashboard',
      userEmail: `reporter${i}@example.com`,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    }
    feedback.push(bug)
  }

  // Generate feature requests
  const featureTitles = [
    'Dark mode support',
    'Export to PDF',
    'Team collaboration',
    'API access',
    'Mobile app',
  ]
  for (let i = 0; i < 7; i++) {
    const feature: FeatureRequest = {
      id: `feature-${i}`,
      projectId: 'project-1',
      widgetId: 'widget-1',
      type: 'feature',
      title: featureTitles[i % featureTitles.length],
      description:
        'It would be great if we could have this feature. It would really help our team be more productive.',
      status: (['new', 'under-review', 'planned', 'in-progress'] as const)[
        Math.floor(Math.random() * 4)
      ],
      upvotes: Math.floor(Math.random() * 50) + 1,
      userEmail: `requester${i}@example.com`,
      userName: `Requester ${i}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    }
    feedback.push(feature)
  }

  return feedback
}

const feedback = generateFeedback()

const dashboardMetrics: DashboardMetrics = {
  totalFeedback: feedback.length,
  feedbackChange: 12.5,
  averageRating: 4.2,
  ratingChange: 0.3,
  newBugReports: feedback.filter((f) => f.type === 'bug').length,
  bugReportsChange: -2,
  newFeatureRequests: feedback.filter((f) => f.type === 'feature').length,
  featureRequestsChange: 5,
}

const recentActivity: RecentActivity[] = feedback
  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  .slice(0, 10)
  .map((f) => ({
    id: f.id,
    type: f.type,
    summary:
      f.type === 'survey'
        ? `NPS Score: ${(f as SurveyResponse).score}`
        : 'title' in f
          ? f.title
          : 'New feedback',
    submittedBy: f.userName || f.userEmail || 'Anonymous',
    timestamp: f.createdAt,
  }))

const roadmaps: Roadmap[] = [
  {
    id: 'roadmap-1',
    projectId: 'project-1',
    name: 'Product Roadmap',
    isPublic: true,
    subdomain: 'roadmap',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=roadmap',
    columns: [
      {
        id: 'col-1',
        roadmapId: 'roadmap-1',
        name: 'New',
        status: 'new',
        color: '#94A3B8',
        order: 0,
      },
      {
        id: 'col-2',
        roadmapId: 'roadmap-1',
        name: 'In Progress',
        status: 'in-progress',
        color: '#3B82F6',
        order: 1,
      },
      {
        id: 'col-3',
        roadmapId: 'roadmap-1',
        name: 'Planned',
        status: 'planned',
        color: '#8B5CF6',
        order: 2,
      },
      {
        id: 'col-4',
        roadmapId: 'roadmap-1',
        name: 'Under Review',
        status: 'under-review',
        color: '#F59E0B',
        order: 3,
      },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

const notificationSettings: NotificationSettings = {
  newSurveyResponses: true,
  newReviews: true,
  newBugReports: true,
  newFeatureRequests: false,
}

export const mockData = {
  currentUser,
  organizations,
  projects,
  widgets,
  feedback,
  dashboardMetrics,
  recentActivity,
  roadmaps,
  notificationSettings,
}
