import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Widgets } from '@/pages/Widgets'
import { WidgetCreate } from '@/pages/WidgetCreate'

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
            <Route path="feedback/responses" element={<div>Responses Page (TODO)</div>} />
            <Route path="feedback/reviews" element={<div>Reviews Page (TODO)</div>} />
            <Route path="feedback/bugs" element={<div>Bug Reports Page (TODO)</div>} />
            <Route path="feedback/features" element={<div>Feature Requests Page (TODO)</div>} />
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