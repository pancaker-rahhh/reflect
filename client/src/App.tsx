import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { SkipLink } from '@/components/common/SkipLink'
import { PageLoading } from '@/components/common/LoadingSpinner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppProvider } from '@/context/AppContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { OnboardingGuard } from '@/components/onboarding/OnboardingGuard'

// Eagerly load core components
import { AppLayout } from '@/components/layout/AppLayout'
import { AccountSettingsLayout } from '@/components/layout/SettingsLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Login } from '@/pages/auth/Login'
import { AuthCallback } from '@/pages/auth/AuthCallback'
import { VerifyOtp } from '@/pages/auth/VerifyOtp'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { InvitationAcceptancePage } from '@/pages/InvitationAcceptancePage'

// Lazy load secondary pages
const Widgets = lazy(() => import('@/pages/Widgets').then((m) => ({ default: m.Widgets })))
const WidgetCreate = lazy(() =>
  import('@/pages/WidgetCreate').then((m) => ({ default: m.WidgetCreate }))
)
const Responses = lazy(() => import('@/pages/Responses').then((m) => ({ default: m.Responses })))
const Reviews = lazy(() => import('@/pages/Reviews').then((m) => ({ default: m.Reviews })))
const BugReports = lazy(() => import('@/pages/BugReports').then((m) => ({ default: m.BugReports })))
const FeatureRequests = lazy(() =>
  import('@/pages/FeatureRequests').then((m) => ({ default: m.FeatureRequests }))
)
const RoadmapPage = lazy(() => import('@/pages/Roadmap').then((m) => ({ default: m.RoadmapPage })))
const AccountSettings = lazy(() =>
  import('@/pages/settings/AccountSettings').then((m) => ({ default: m.AccountSettings }))
)
const NotificationSettings = lazy(() =>
  import('@/pages/settings/NotificationSettings').then((m) => ({ default: m.NotificationSettings }))
)
const BillingSettings = lazy(() =>
  import('@/pages/settings/BillingSettings').then((m) => ({ default: m.BillingSettings }))
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
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppProvider>
              <SkipLink />
              <Suspense fallback={<PageLoading />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/verify-otp" element={<VerifyOtp />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/invite" element={<InvitationAcceptancePage />} />
                  <Route path="/invitation/accept" element={<InvitationAcceptancePage />} />
                  
                  {/* Onboarding route */}
                  <Route path="/onboarding" element={
                    <ProtectedRoute>
                      <OnboardingPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Protected routes with onboarding guard */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <OnboardingGuard>
                        <AppLayout />
                      </OnboardingGuard>
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="widgets" element={<Widgets />} />
                    <Route path="widgets/new" element={<WidgetCreate />} />
                    <Route path="feedback/responses" element={<Responses />} />
                    <Route path="feedback/reviews" element={<Reviews />} />
                    <Route path="feedback/bugs" element={<BugReports />} />
                    <Route path="feedback/features" element={<FeatureRequests />} />
                    <Route path="roadmap" element={<RoadmapPage />} />
                    <Route path="settings/*" element={<AccountSettingsLayout />}>
                      <Route index element={<Navigate to="account" replace />} />
                      <Route path="account" element={<AccountSettings />} />
                      <Route path="notifications" element={<NotificationSettings />} />
                      <Route path="billing" element={<BillingSettings />} />
                    </Route>
                    <Route path="settings/project" element={<ProjectSettings />} />
                    <Route path="settings/roadmap" element={<RoadmapSettings />} />
                    <Route path="settings/organization" element={<OrganizationSettings />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AppProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
    </ErrorBoundary>
  )
}

export default App
