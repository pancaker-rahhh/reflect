import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { AccountSettingsLayout } from '@/components/layout/SettingsLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Widgets } from '@/pages/Widgets'
import { WidgetCreate } from '@/pages/WidgetCreate'
import { Responses } from '@/pages/Responses'
import { Reviews } from '@/pages/Reviews'
import { BugReports } from '@/pages/BugReports'
import { FeatureRequests } from '@/pages/FeatureRequests'
import { AccountSettings } from '@/pages/settings/AccountSettings'
import { NotificationSettings } from '@/pages/settings/NotificationSettings'
import { BillingSettings } from '@/pages/settings/BillingSettings'
import { ProjectSettings } from '@/pages/settings/ProjectSettings'
import { RoadmapSettings } from '@/pages/settings/RoadmapSettings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="widgets" element={<Widgets />} />
            <Route path="widgets/new" element={<WidgetCreate />} />
            <Route path="feedback/responses" element={<Responses />} />
            <Route path="feedback/reviews" element={<Reviews />} />
            <Route path="feedback/bugs" element={<BugReports />} />
            <Route path="feedback/features" element={<FeatureRequests />} />
            <Route path="roadmap" element={<div>Roadmap Page (TODO)</div>} />
            <Route path="settings/*" element={<AccountSettingsLayout />}>
              <Route index element={<Navigate to="account" replace />} />
              <Route path="account" element={<AccountSettings />} />
              <Route path="notifications" element={<NotificationSettings />} />
              <Route path="billing" element={<BillingSettings />} />
            </Route>
            <Route path="settings/project" element={<ProjectSettings />} />
            <Route path="settings/roadmap" element={<RoadmapSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App