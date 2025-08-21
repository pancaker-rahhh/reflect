import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Building2, 
  Shield, 
  Clock, 
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UnifiedAuthForm } from '@/components/auth/UnifiedAuthForm';
import { invitationService } from '@/services/invitationService';
import { useAuth } from '@/contexts/AuthContext';

interface InvitationDetails {
  invitation_id: string;
  email: string;
  organization_name?: string;
  project_name?: string;
  role: string;
  inviter_name: string;
  expires_at: string;
  is_expired: boolean;
  user_exists: boolean;
}

export const InvitationAcceptancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signInWithEmail, signInWithGoogle } = useAuth();
  
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [pendingAcceptance, setPendingAcceptance] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. Token is missing.');
      setLoading(false);
      return;
    }

    validateInvitation();
  }, [token]);

  useEffect(() => {
    if (user && pendingAcceptance && token) {
      handleAcceptInvitation();
    }
  }, [user, pendingAcceptance, token]);

  const validateInvitation = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const details = await invitationService.validateInvitation(token);
      setInvitationDetails(details);
      
      if (details.is_expired) {
        setError('This invitation has expired. Please request a new invitation from your team administrator.');
      }
    } catch (err) {
      console.error('Failed to validate invitation:', err);
      setError('Invalid or expired invitation token.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (email: string) => {
    if (!invitationDetails) return { error: null };

    if (email.toLowerCase() !== invitationDetails.email.toLowerCase()) {
      return { 
        error: { 
          message: `This invitation is for ${invitationDetails.email}. Please use that email or contact your administrator.` 
        } 
      };
    }

    setPendingAcceptance(true);
    const result = await signInWithEmail(email);
    
    if (!result.error) {
      setEmailSent(true);
      navigate('/auth/verify-otp', { 
        state: { 
          email: email, 
          from: `/invite?token=${token}`,
          invitationToken: token
        } 
      });
    }
    
    return result;
  };

  const handleGoogleAuth = async () => {
    if (!invitationDetails) return { error: null };

    setPendingAcceptance(true);
    
    const result = await signInWithGoogle();
    
    if (!result.error) {
      localStorage.setItem('pendingInvitationToken', token || '');
    }
    
    return result;
  };

  const handleAcceptInvitation = async () => {
    if (!token || !invitationDetails || !user) return;

    if (user.email?.toLowerCase() !== invitationDetails.email.toLowerCase()) {
      setError(`You are signed in as ${user.email}, but this invitation is for ${invitationDetails.email}. Please sign out and sign in with the correct email.`);
      setPendingAcceptance(false);
      return;
    }

    try {
      setAccepting(true);
      setError(null);
      setSuccess(null);

      const response = await invitationService.acceptInvitation(token);
      
      if (response.success) {
        setSuccess(response.message);
        localStorage.removeItem('pendingInvitationToken');
        
        setTimeout(() => {
          navigate(response.redirect_url);
        }, 1500);
      } else {
        setError('Failed to accept invitation. Please try again.');
      }
    } catch (err: any) {
      console.error('Failed to accept invitation:', err);
      setError(err.message || 'An error occurred while accepting the invitation.');
    } finally {
      setAccepting(false);
      setPendingAcceptance(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitationDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-center">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full mt-4"
              variant="outline"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-center">You're Invited!</CardTitle>
          <CardDescription className="text-center text-white/90">
            {invitationDetails?.inviter_name} has invited you to join their team
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-6 space-y-6">
          {invitationDetails && (
            <>
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Email</span>
                  </div>
                  <span className="font-medium">{invitationDetails.email}</span>
                </div>

                {invitationDetails.organization_name && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Organization</span>
                    </div>
                    <span className="font-medium">{invitationDetails.organization_name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Role</span>
                  </div>
                  <span className="font-medium capitalize">{invitationDetails.role}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Expires</span>
                  </div>
                  <span className="font-medium">
                    {new Date(invitationDetails.expires_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!invitationDetails.is_expired && !user && !accepting && !success && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center">
                    Sign in to accept this invitation
                  </h3>
                  <UnifiedAuthForm
                    onEmailSubmit={handleEmailAuth}
                    onGoogleSignIn={handleGoogleAuth}
                    title=""
                    description={`Sign in with ${invitationDetails.email} to join the team`}
                    submitButtonText="Send verification code"
                    showTerms={false}
                    isLoading={accepting}
                  />
                </div>
              )}

              {user && !invitationDetails.is_expired && !success && (
                <div className="text-center space-y-4">
                  <p className="text-gray-600">
                    Signed in as <strong>{user.email}</strong>
                  </p>
                  {accepting ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="ml-2">Accepting invitation...</span>
                    </div>
                  ) : (
                    <Button
                      onClick={handleAcceptInvitation}
                      className="w-full"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept Invitation
                    </Button>
                  )}
                </div>
              )}

              {invitationDetails.is_expired && (
                <div className="text-center">
                  <Button
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};