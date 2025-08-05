import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Widgets } from '@/pages/Widgets'
import { WidgetCreate } from '@/pages/WidgetCreate'
import { Responses } from '@/pages/Responses'
import { Reviews } from '@/pages/Reviews'
import { BugReports } from '@/pages/BugReports'
import { FeatureRequests } from '@/pages/FeatureRequests'

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
            <Route path="settings/account" element={<div>Account Settings Page (TODO)</div>} />
            <Route path="settings/project" element={<div>Project Settings Page (TODO)</div>} />
            <Route path="settings/roadmap" element={<div>Roadmap Settings Page (TODO)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App