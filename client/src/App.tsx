import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { OnboardingGuard } from '@/components/onboarding/OnboardingGuard'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/context/AppContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { DirectionProvider } from '@radix-ui/react-direction'
import { PostHogProvider } from 'posthog-js/react'
import { lazy, Suspense, useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'

// Lazy widget loader that uses requestIdleCallback to defer loading
function LazyWidgetLoader() {
  useEffect(() => {
    // Use requestIdleCallback to load widget when browser is idle
    // Fallback to setTimeout if not available
    const loadWidget = () => {
      // Dynamically import and execute widget loader
      import('@/components/ReflectWidgetLoader')
    }

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(loadWidget, { timeout: 2000 })
      } else {
        setTimeout(loadWidget, 2000)
      }
    }
  }, [])

  // Render nothing - widget loader handles its own rendering
  return null
}

// Eagerly load core components (required for initial render)
import { AppLayout } from '@/components/layout/AppLayout'
import { Toaster } from '@/components/ui/toaster'

// Lazy load all page-level components for route-based code splitting
const AuthCallback = lazy(() =>
  import('@/pages/auth/AuthCallback').then((m) => ({ default: m.AuthCallback }))
)
const Login = lazy(() => import('@/pages/auth/Login').then((m) => ({ default: m.Login })))
const VerifyOtp = lazy(() =>
  import('@/pages/auth/VerifyOtp').then((m) => ({ default: m.VerifyOtp }))
)
const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const InvitationAcceptancePage = lazy(() =>
  import('@/pages/InvitationAcceptancePage').then((m) => ({ default: m.InvitationAcceptancePage }))
)
const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage }))
)
const OnboardingPage = lazy(() =>
  import('@/pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage }))
)

// Lazy load secondary pages
const WidgetView = lazy(() => import('@/pages/WidgetView').then((m) => ({ default: m.WidgetView })))
const Widgets = lazy(() => import('@/pages/Widgets').then((m) => ({ default: m.Widgets })))
const WidgetCreate = lazy(() =>
  import('@/pages/WidgetCreate').then((m) => ({ default: m.WidgetCreate }))
)
const WidgetGetCode = lazy(() =>
  import('@/pages/WidgetGetCode').then((m) => ({ default: m.WidgetGetCode }))
)
const Responses = lazy(() => import('@/pages/Responses').then((m) => ({ default: m.Responses })))
const Reviews = lazy(() => import('@/pages/Reviews').then((m) => ({ default: m.Reviews })))
const BugReports = lazy(() => import('@/pages/BugReports').then((m) => ({ default: m.BugReports })))
const FeatureRequests = lazy(() =>
  import('@/pages/FeatureRequests').then((m) => ({ default: m.FeatureRequests }))
)
const RoadmapPage = lazy(() => import('@/pages/Roadmap').then((m) => ({ default: m.RoadmapPage })))
const PublicRoadmap = lazy(() =>
  import('@/pages/PublicRoadmap').then((m) => ({ default: m.PublicRoadmap }))
)
const PublicFormView = lazy(() =>
  import('@/pages/PublicFormView').then((m) => ({ default: m.PublicFormView }))
)
const Forms = lazy(() => import('@/pages/Forms').then((m) => ({ default: m.Forms })))
const FormCreate = lazy(() => import('@/pages/FormCreate').then((m) => ({ default: m.FormCreate })))
const FormResponses = lazy(() =>
  import('@/pages/FormResponses').then((m) => ({ default: m.FormResponses }))
)
const AccountSettings = lazy(() =>
  import('@/pages/settings/AccountSettings').then((m) => ({ default: m.AccountSettings }))
)
const PaymentStatus = lazy(() =>
  import('@/pages/PaymentStatus').then((m) => ({ default: m.default }))
)
const LifetimeOfferPage = lazy(() =>
  import('@/pages/billing/LifetimeOfferPage').then((m) => ({ default: m.default }))
)
const ProjectSettings = lazy(() =>
  import('@/pages/settings/ProjectSettings').then((m) => ({ default: m.ProjectSettings }))
)
const RoadmapSettings = lazy(() =>
  import('@/pages/settings/RoadmapSettings').then((m) => ({ default: m.RoadmapSettings }))
)
const OrganizationSettings = lazy(() =>
  import('@/pages/settings/OrganizationSettings').then((m) => ({ default: m.OrganizationSettings }))
)
const TermsOfService = lazy(() =>
  import('@/pages/legal/TermsOfService').then((m) => ({ default: m.TermsOfService }))
)
const PrivacyPolicy = lazy(() =>
  import('@/pages/legal/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy }))
)
const CookiePolicy = lazy(() =>
  import('@/pages/legal/CookiePolicy').then((m) => ({ default: m.CookiePolicy }))
)
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const ContactPage = lazy(() =>
  import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage }))
)
const BlogPage = lazy(() => import('@/pages/BlogPage').then((m) => ({ default: m.BlogPage })))
const FeaturesPage = lazy(() =>
  import('@/pages/FeaturesPage').then((m) => ({ default: m.default }))
)
const FeedbackWidgetPage = lazy(() =>
  import('@/pages/FeedbackWidgetPage').then((m) => ({ default: m.default }))
)
const BugReportingPage = lazy(() =>
  import('@/pages/BugReportingPage').then((m) => ({ default: m.default }))
)
const FeatureRequestsPage = lazy(() =>
  import('@/pages/FeatureRequestsPage').then((m) => ({ default: m.default }))
)
const PricingPage = lazy(() => import('@/pages/PricingPage').then((m) => ({ default: m.default })))
// Comparison pages
const ReflectVsCannyPage = lazy(() =>
  import('@/pages/comparisons/ReflectVsCannyPage').then((m) => ({ default: m.default }))
)
const ReflectVsUserVoicePage = lazy(() =>
  import('@/pages/comparisons/ReflectVsUserVoicePage').then((m) => ({ default: m.default }))
)
const ReflectVsSleekplanPage = lazy(() =>
  import('@/pages/comparisons/ReflectVsSleekplanPage').then((m) => ({ default: m.default }))
)
const ReflectVsFrillPage = lazy(() =>
  import('@/pages/comparisons/ReflectVsFrillPage').then((m) => ({ default: m.default }))
)
const ReflectVsNooraPage = lazy(() =>
  import('@/pages/comparisons/ReflectVsNooraPage').then((m) => ({ default: m.default }))
)
const ReflectVsProductBoardPage = lazy(() =>
  import('@/pages/comparisons/ReflectVsProductBoardPage').then((m) => ({ default: m.default }))
)
// Integration pages
const ReflectSlackPage = lazy(() =>
  import('@/pages/integrations/ReflectSlackPage').then((m) => ({ default: m.default }))
)
const ReflectLinearPage = lazy(() =>
  import('@/pages/integrations/ReflectLinearPage').then((m) => ({ default: m.default }))
)
const ReflectGitHubPage = lazy(() =>
  import('@/pages/integrations/ReflectGitHubPage').then((m) => ({ default: m.default }))
)
const ReflectNotionPage = lazy(() =>
  import('@/pages/integrations/ReflectNotionPage').then((m) => ({ default: m.default }))
)
const ReflectJiraPage = lazy(() =>
  import('@/pages/integrations/ReflectJiraPage').then((m) => ({ default: m.default }))
)
const ReflectTrelloPage = lazy(() =>
  import('@/pages/integrations/ReflectTrelloPage').then((m) => ({ default: m.default }))
)
// Blog posts
const CollectInAppFeedbackPost = lazy(() =>
  import('@/pages/blog/posts/01-collect-in-app-feedback').then((m) => ({ default: m.default }))
)
const GetBetterBugReportsPost = lazy(() =>
  import('@/pages/blog/posts/05-get-better-bug-reports').then((m) => ({ default: m.default }))
)
const FeatureRequestPrioritizationPost = lazy(() =>
  import('@/pages/blog/posts/10-feature-request-prioritization').then((m) => ({
    default: m.default,
  }))
)
const PsychologyOfFeedbackPost = lazy(() =>
  import('@/pages/blog/posts/02-psychology-of-feedback').then((m) => ({ default: m.default }))
)
const BestInAppFeedbackToolsPost = lazy(() =>
  import('@/pages/blog/posts/03-best-in-app-feedback-tools').then((m) => ({ default: m.default }))
)
const InAppVsEmailFeedbackPost = lazy(() =>
  import('@/pages/blog/posts/04-inapp-vs-email-feedback').then((m) => ({ default: m.default }))
)
const ScreenshotBugReportingPost = lazy(() =>
  import('@/pages/blog/posts/06-screenshot-bug-reporting').then((m) => ({ default: m.default }))
)
const BugWorkflowsSaaSPost = lazy(() =>
  import('@/pages/blog/posts/07-bug-workflows-saas').then((m) => ({ default: m.default }))
)
const ReportBugsInsideYourAppPost = lazy(() =>
  import('@/pages/blog/posts/08-report-bugs-inside-your-app').then((m) => ({ default: m.default }))
)
const HowFeedbackWidgetsWorkPost = lazy(() =>
  import('@/pages/blog/posts/09-how-feedback-widgets-work').then((m) => ({ default: m.default }))
)
const BuildPublicRoadmapPost = lazy(() =>
  import('@/pages/blog/posts/11-build-public-roadmap').then((m) => ({ default: m.default }))
)
const FeatureVotingVsRequestsPost = lazy(() =>
  import('@/pages/blog/posts/12-feature-voting-vs-requests').then((m) => ({ default: m.default }))
)
const WhyPMsFailPrioritizationPost = lazy(() =>
  import('@/pages/blog/posts/13-why-pms-fail-prioritization').then((m) => ({ default: m.default }))
)
const CloseFeedbackLoopPost = lazy(() =>
  import('@/pages/blog/posts/14-close-feedback-loop').then((m) => ({ default: m.default }))
)
const RightFeedbackQuestionsPost = lazy(() =>
  import('@/pages/blog/posts/15-right-feedback-questions').then((m) => ({ default: m.default }))
)
const CustomerFeedbackForSaaSPost = lazy(() =>
  import('@/pages/blog/posts/16-customer-feedback-for-saas').then((m) => ({ default: m.default }))
)
const CustomerDrivenProductPost = lazy(() =>
  import('@/pages/blog/posts/17-customer-driven-product').then((m) => ({ default: m.default }))
)
const LeanFeedbackLoopPost = lazy(() =>
  import('@/pages/blog/posts/18-lean-feedback-loop').then((m) => ({ default: m.default }))
)
const ValidateFeaturesInappSurveysPost = lazy(() =>
  import('@/pages/blog/posts/19-validate-features-inapp-surveys').then((m) => ({
    default: m.default,
  }))
)
const FeedbackLoopsReduceChurnPost = lazy(() =>
  import('@/pages/blog/posts/20-feedback-loops-reduce-churn').then((m) => ({ default: m.default }))
)
const DocsPage = lazy(() => import('@/pages/DocsPage').then((m) => ({ default: m.DocsPage })))
const DocsApiPage = lazy(() =>
  import('@/pages/DocsApiPage').then((m) => ({ default: m.DocsApiPage }))
)
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: '2025-05-24',
} as const

function App() {
  return (
    <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={options}>
      <ErrorBoundary>
        <HelmetProvider>
          <DirectionProvider dir="ltr">
            <TooltipProvider>
              <BrowserRouter>
                <AuthProvider>
                  <AppProvider>
                    <Suspense fallback={<></>}>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/auth/verify-otp" element={<VerifyOtp />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/invite" element={<InvitationAcceptancePage />} />
                        <Route path="/invitation/accept" element={<InvitationAcceptancePage />} />
                        <Route path="/public/roadmap/:publicSlug" element={<PublicRoadmap />} />
                        <Route path="/public/r/:subdomain" element={<PublicRoadmap />} />
                        <Route path="/public/forms/:publicLink" element={<PublicFormView />} />
                        <Route path="/widget-view" element={<WidgetView />} />
                        <Route path="/payment-status" element={<PaymentStatus />} />
                        <Route path="/terms" element={<TermsOfService />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/cookies" element={<CookiePolicy />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/features" element={<FeaturesPage />} />
                        <Route path="/feedback-widget" element={<FeedbackWidgetPage />} />
                        <Route path="/bug-reporting" element={<BugReportingPage />} />
                        <Route path="/feature-requests" element={<FeatureRequestsPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        {/* Comparison pages */}
                        <Route
                          path="/comparisons/reflect-vs-canny"
                          element={<ReflectVsCannyPage />}
                        />
                        <Route
                          path="/comparisons/reflect-vs-uservoice"
                          element={<ReflectVsUserVoicePage />}
                        />
                        <Route
                          path="/comparisons/reflect-vs-sleekplan"
                          element={<ReflectVsSleekplanPage />}
                        />
                        <Route
                          path="/comparisons/reflect-vs-frill"
                          element={<ReflectVsFrillPage />}
                        />
                        <Route
                          path="/comparisons/reflect-vs-noora"
                          element={<ReflectVsNooraPage />}
                        />
                        <Route
                          path="/comparisons/reflect-vs-productboard"
                          element={<ReflectVsProductBoardPage />}
                        />
                        {/* Integration pages */}
                        <Route path="/integrations/slack" element={<ReflectSlackPage />} />
                        <Route path="/integrations/linear" element={<ReflectLinearPage />} />
                        <Route path="/integrations/github" element={<ReflectGitHubPage />} />
                        <Route path="/integrations/notion" element={<ReflectNotionPage />} />
                        <Route path="/integrations/jira" element={<ReflectJiraPage />} />
                        <Route path="/integrations/trello" element={<ReflectTrelloPage />} />
                        {/* Blog posts */}
                        <Route
                          path="/blog/posts/01-collect-in-app-feedback"
                          element={<CollectInAppFeedbackPost />}
                        />
                        <Route
                          path="/blog/posts/02-psychology-of-feedback"
                          element={<PsychologyOfFeedbackPost />}
                        />
                        <Route
                          path="/blog/posts/03-best-in-app-feedback-tools"
                          element={<BestInAppFeedbackToolsPost />}
                        />
                        <Route
                          path="/blog/posts/04-inapp-vs-email-feedback"
                          element={<InAppVsEmailFeedbackPost />}
                        />
                        <Route
                          path="/blog/posts/05-get-better-bug-reports"
                          element={<GetBetterBugReportsPost />}
                        />
                        <Route
                          path="/blog/posts/06-screenshot-bug-reporting"
                          element={<ScreenshotBugReportingPost />}
                        />
                        <Route
                          path="/blog/posts/07-bug-workflows-saas"
                          element={<BugWorkflowsSaaSPost />}
                        />
                        <Route
                          path="/blog/posts/08-report-bugs-inside-your-app"
                          element={<ReportBugsInsideYourAppPost />}
                        />
                        <Route
                          path="/blog/posts/09-how-feedback-widgets-work"
                          element={<HowFeedbackWidgetsWorkPost />}
                        />
                        <Route
                          path="/blog/posts/10-feature-request-prioritization"
                          element={<FeatureRequestPrioritizationPost />}
                        />
                        <Route
                          path="/blog/posts/11-build-public-roadmap"
                          element={<BuildPublicRoadmapPost />}
                        />
                        <Route
                          path="/blog/posts/12-feature-voting-vs-requests"
                          element={<FeatureVotingVsRequestsPost />}
                        />
                        <Route
                          path="/blog/posts/13-why-pms-fail-prioritization"
                          element={<WhyPMsFailPrioritizationPost />}
                        />
                        <Route
                          path="/blog/posts/14-close-feedback-loop"
                          element={<CloseFeedbackLoopPost />}
                        />
                        <Route
                          path="/blog/posts/15-right-feedback-questions"
                          element={<RightFeedbackQuestionsPost />}
                        />
                        <Route
                          path="/blog/posts/16-customer-feedback-for-saas"
                          element={<CustomerFeedbackForSaaSPost />}
                        />
                        <Route
                          path="/blog/posts/17-customer-driven-product"
                          element={<CustomerDrivenProductPost />}
                        />
                        <Route
                          path="/blog/posts/18-lean-feedback-loop"
                          element={<LeanFeedbackLoopPost />}
                        />
                        <Route
                          path="/blog/posts/19-validate-features-inapp-surveys"
                          element={<ValidateFeaturesInappSurveysPost />}
                        />
                        <Route
                          path="/blog/posts/20-feedback-loops-reduce-churn"
                          element={<FeedbackLoopsReduceChurnPost />}
                        />
                        {/* Legacy blog routes for backwards compatibility */}
                        <Route
                          path="/blog/collect-in-app-feedback"
                          element={<CollectInAppFeedbackPost />}
                        />
                        <Route
                          path="/blog/get-better-bug-reports"
                          element={<GetBetterBugReportsPost />}
                        />
                        <Route
                          path="/blog/feature-request-prioritization"
                          element={<FeatureRequestPrioritizationPost />}
                        />
                        <Route path="/docs" element={<DocsPage />} />
                        <Route path="/docs/api" element={<DocsApiPage />} />

                        {/* Onboarding route */}
                        <Route
                          path="/onboarding"
                          element={
                            <ProtectedRoute>
                              <OnboardingGuard>
                                <OnboardingPage />
                              </OnboardingGuard>
                            </ProtectedRoute>
                          }
                        />

                        {/* Protected routes with onboarding guard */}
                        <Route
                          path="/app"
                          element={
                            <ProtectedRoute>
                              <OnboardingGuard>
                                <AppLayout>
                                  <Outlet />
                                  <Toaster />
                                </AppLayout>
                              </OnboardingGuard>
                            </ProtectedRoute>
                          }
                        >
                          <Route index element={<Navigate to="/app/dashboard" replace />} />
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="widgets" element={<Widgets />} />
                          <Route path="widgets/new" element={<WidgetCreate />} />
                          <Route path="widgets/:widgetId/edit" element={<WidgetCreate />} />
                          <Route path="widgets/:widgetId/get-code" element={<WidgetGetCode />} />
                          <Route path="widgets/create" element={<WidgetCreate />} />
                          <Route path="feedback/responses" element={<Responses />} />
                          <Route path="feedback/reviews" element={<Reviews />} />
                          <Route path="feedback/bugs" element={<BugReports />} />
                          <Route path="feedback/features" element={<FeatureRequests />} />
                          <Route path="forms" element={<Forms />} />
                          <Route path="forms/new" element={<FormCreate />} />
                          <Route path="forms/:formId/edit" element={<FormCreate />} />
                          <Route path="forms/:formId/responses" element={<FormResponses />} />
                          <Route path="roadmap" element={<RoadmapPage />} />
                          <Route path="settings" element={<Navigate to="account" replace />} />
                          <Route path="settings/account" element={<AccountSettings />} />
                          <Route path="settings/project" element={<ProjectSettings />} />
                          <Route path="settings/roadmap" element={<RoadmapSettings />} />
                          <Route path="settings/organization" element={<OrganizationSettings />} />
                          <Route path="billing/lifetime-offer" element={<LifetimeOfferPage />} />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                    <LazyWidgetLoader />
                  </AppProvider>
                </AuthProvider>
              </BrowserRouter>
            </TooltipProvider>
          </DirectionProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </PostHogProvider>
  )
}

export default App
