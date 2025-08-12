import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldOnboard, setShouldOnboard] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || authLoading) {
        return;
      }

      const isOnboardingRoute = location.pathname.startsWith('/onboarding');
      
      try {
        const response = await fetch('/api/v1/onboarding/check-first-time', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setShouldOnboard(data.is_first_time);

          if (data.is_first_time && !isOnboardingRoute) {
            navigate('/onboarding');
          } else if (!data.is_first_time && isOnboardingRoute) {
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading, navigate, location.pathname]);

  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};