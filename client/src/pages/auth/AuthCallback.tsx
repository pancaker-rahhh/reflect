import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SyncLoader } from '../../components/auth/SyncLoader';

export function AuthCallback() {
  const navigate = useNavigate();
  const { user, syncing, loading } = useAuth();

  useEffect(() => {
    // Navigate to dashboard when auth is complete and sync is done
    if (user && !syncing && !loading) {
      navigate('/dashboard');
    }
  }, [user, syncing, loading, navigate]);

  // Show sync loader while authenticating or syncing
  if (loading || syncing || user) {
    return <SyncLoader />;
  }

  // Fallback loading state
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}