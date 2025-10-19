import type { EnvironmentConfig } from './types'

export const developmentConfig: EnvironmentConfig = {
  environment: 'development',
  
  apiBaseUrl: 'https://reflectfeedback-ocd4gtkjya-uk.a.run.app/api/v1',
  frontendUrl: 'https://dev.reflectfeedback.com',
  
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
