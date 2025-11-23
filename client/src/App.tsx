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
