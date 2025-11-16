import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { PageLoading } from '@/components/common/LoadingSpinner'
import { OnboardingGuard } from '@/components/onboarding/OnboardingGuard'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/context/AppContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { DirectionProvider } from '@radix-ui/react-direction'
import { PostHogProvider } from 'posthog-js/react'
import { lazy, Suspense } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'

// Eagerly load core components
import { AppLayout } from '@/components/layout/AppLayout'
import { Toaster } from '@/components/ui/toaster'
import { AuthCallback } from '@/pages/auth/AuthCallback'
import { Login } from '@/pages/auth/Login'
import { VerifyOtp } from '@/pages/auth/VerifyOtp'
import { Dashboard } from '@/pages/Dashboard'
import { InvitationAcceptancePage } from '@/pages/InvitationAcceptancePage'
import { LandingPage } from '@/pages/LandingPage'
import { OnboardingPage } from '@/pages/OnboardingPage'

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
                    <Suspense fallback={<PageLoading />}>
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
