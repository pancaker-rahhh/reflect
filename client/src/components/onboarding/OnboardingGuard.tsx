import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useSession } from '../../contexts/AuthContext';
import { onboardingApi } from '../../lib/api';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const session = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || authLoading || !session) {
        return;
      }

      const isOnboardingRoute = location.pathname.startsWith('/onboarding');
      
      try {
        const data = await onboardingApi.checkFirstTime();

        if (data.is_first_time && !isOnboardingRoute) {
          navigate('/onboarding');
        } else if (!data.is_first_time && isOnboardingRoute) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading, session, navigate, location.pathname]);

  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};