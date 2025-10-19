import type { EnvironmentConfig } from './types'

export const localDevConfig: EnvironmentConfig = {
  environment: 'local-dev',
  
  apiBaseUrl: 'http://localhost:8000/api/v1',
  frontendUrl: 'http://localhost:5173',
  
  supabase: {
    url: 'https://ioyccqfjzobfwmailfzb.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlveWNjcWZqem9iZndtYWlsZnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NjUyMjAsImV4cCI6MjA3NDU0MTIyMH0.y2es_QYPQRdNt54mqLeXHa4JfixI4jwYSws5xMIubIM',
  },
  
  features: {
    debug: true,
    analytics: false,
    mockData: false,
    verboseErrors: true,
  },
}
