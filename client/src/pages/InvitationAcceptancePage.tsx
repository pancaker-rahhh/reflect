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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

interface NewUserFormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const InvitationAcceptancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [formData, setFormData] = useState<NewUserFormData>({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<NewUserFormData>>({});

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. Token is missing.');
      setLoading(false);
      return;
    }

    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const details = await invitationService.validateInvitation(token);
      setInvitationDetails(details);
      
      if (details.is_expired) {
        setError('This invitation has expired. Please request a new invitation from your team administrator.');
      } else if (!details.user_exists && !user) {
        setShowNewUserForm(true);
      }
    } catch (err) {
      console.error('Failed to validate invitation:', err);
      setError('Invalid or expired invitation token.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<NewUserFormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAcceptInvitation = async () => {
    if (!token || !invitationDetails) return;

    // Validate form if new user
    if (showNewUserForm && !user) {
      if (!validateForm()) return;
    }

    try {
      setAccepting(true);
      setError(null);
      setSuccess(null);
      
      const userData = showNewUserForm && !user ? {
        name: formData.name,
        password: formData.password
      } : undefined;

      const response = await invitationService.acceptInvitation(token, userData);
      
      if (response.success) {
        setSuccess(response.message);
        
        // Redirect to the appropriate dashboard after a brief delay to show success message
        // Note: Authentication will be handled by Supabase auth flow
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
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[name as keyof NewUserFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
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
              {/* Invitation Details */}
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

              {/* Success Alert */}
              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* New User Registration Form */}
              {showNewUserForm && !user && !invitationDetails.is_expired && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Create Your Account</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={formErrors.name ? 'border-red-500' : ''}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-500">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password (min 8 characters)"
                      className={formErrors.password ? 'border-red-500' : ''}
                    />
                    {formErrors.password && (
                      <p className="text-sm text-red-500">{formErrors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className={formErrors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {formErrors.confirmPassword && (
                      <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Existing User Message */}
              {invitationDetails.user_exists && !user && !invitationDetails.is_expired && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    An account with this email already exists. Please log in to accept the invitation.
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {invitationDetails.user_exists && !user && !invitationDetails.is_expired ? (
                  <>
                    <Button
                      onClick={() => navigate(`/login?redirect=/invite?token=${token}`)}
                      className="flex-1"
                    >
                      Log In to Accept
                    </Button>
                    <Button
                      onClick={() => navigate('/login')}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </>
                ) : !invitationDetails.is_expired ? (
                  <>
                    <Button
                      onClick={handleAcceptInvitation}
                      disabled={accepting}
                      className="flex-1"
                    >
                      {accepting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Accept Invitation
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => navigate('/login')}
                      variant="outline"
                      className="flex-1"
                      disabled={accepting}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};