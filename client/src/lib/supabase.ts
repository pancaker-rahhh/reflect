import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wrwyqrxczlkjgprinfwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyd3lxcnhjemxramdwcmluZndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjM2MDAsImV4cCI6MjA2MzU5OTYwMH0.mbAKxivSmUs_n14bBs1fA6QRTSFZpvCGmCoydczeZio';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});