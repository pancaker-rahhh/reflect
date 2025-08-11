import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error) => {
        // Don't retry on 401 (Unauthorized) or 403 (Forbidden) errors
        if (error instanceof Error && error.message.includes('401')) {
          return false;
        }
        if (error instanceof Error && error.message.includes('403')) {
          return false;
        }
        // Only retry once for other errors
        return failureCount < 1;
      },
    },
  },
})

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }
  const { worker } = await import('./mocks/browser')

  return worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
})
