import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  syncing: boolean;
  signInWithEmail: (email: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      // Skip INITIAL_SESSION events as we already handle this above
      if (event === 'INITIAL_SESSION') {
        return;
      }
      
      console.log('🔐 Auth state change:', event, session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Sync user to backend when they sign in (but not on initial session load)
      // Only sync once per session and only for actual sign-in events
      if (event === 'SIGNED_IN' && session && !hasSyncedRef.current) {
        hasSyncedRef.current = true;
        console.log('🚀 Starting user sync to backend...');
        console.log('🎫 Using session token:', session.access_token ? 'Present' : 'Missing');
        setSyncing(true);
        try {
          // Make direct API call with known session
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
          const response = await fetch(`${apiBaseUrl}/users/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          console.log('✅ User synced to backend successfully:', result);
        } catch (error) {
          console.error('❌ Failed to sync user to backend:', error);
          // Don't block login flow if sync fails
        } finally {
          if (isMounted) {
            setSyncing(false);
          }
          console.log('🏁 Sync process completed');
        }
      }

      // Reset sync flag on sign out
      if (event === 'SIGNED_OUT') {
        hasSyncedRef.current = false;
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
    }
    return { error };
  };

  const refreshUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
    }
  };

  const value = {
    user,
    session,
    loading,
    syncing,
    signInWithEmail,
    signInWithGoogle,
    verifyOtp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useSession() {
  const { session } = useAuth();
  return session;
}