import type { EnvironmentConfig } from './types'

export const productionConfig: EnvironmentConfig = {
  environment: 'production',
  
  apiBaseUrl: 'https://api.reflectfeedback.com/api/v1',
  frontendUrl: 'https://www.reflectfeedback.com',
  
  supabase: {
    url: 'https://wrwyqrxczlkjgprinfwd.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyd3lxcnhjemxramdwcmluZndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjM2MDAsImV4cCI6MjA2MzU5OTYwMH0.mbAKxivSmUs_n14bBs1fA6QRTSFZpvCGmCoydczeZio',
  },
  
  features: {
    debug: false,
    analytics: true,
    mockData: false,
    verboseErrors: false,
  },
}
