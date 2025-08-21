import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useRateLimit } from '@/hooks/useRateLimit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface UnifiedAuthFormProps {
  onEmailSubmit: (email: string) => Promise<{ error: any | null }>;
  onGoogleSignIn: () => Promise<{ error: any | null }>;
  title?: string;
  description?: string;
  submitButtonText?: string;
  showTerms?: boolean;
  isLoading?: boolean;
}

export function UnifiedAuthForm({
  onEmailSubmit,
  onGoogleSignIn,
  title = "Welcome to Reflect",
  description = "Sign in to your account or create a new one",
  submitButtonText = "Continue with Email",
  showTerms = true,
  isLoading = false,
}: UnifiedAuthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const rateLimit = useRateLimit('auth', {
    maxAttempts: 3,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 5 * 60 * 1000,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!rateLimit.canAttempt) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const { error } = await onEmailSubmit(data.email);

    if (error) {
      rateLimit.recordAttempt(false);
      setMessage({ type: 'error', text: error.message });
    } else {
      rateLimit.recordAttempt(true);
    }

    setIsSubmitting(false);
  };

  const handleGoogleSignInClick = async () => {
    if (!rateLimit.canAttempt) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const { error } = await onGoogleSignIn();

    if (error) {
      rateLimit.recordAttempt(false);
      setMessage({ type: 'error', text: error.message });
    } else {
      rateLimit.recordAttempt(true);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      {rateLimit.isBlocked && (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>{rateLimit.getBlockMessage()}</AlertDescription>
        </Alert>
      )}
      
      {!rateLimit.isBlocked && rateLimit.getWarningMessage() && (
        <Alert variant="default" className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {rateLimit.getWarningMessage()}
          </AlertDescription>
        </Alert>
      )}
      
      {message && !rateLimit.isBlocked && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            disabled={isSubmitting || isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </span>
          ) : (
            <span className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              {submitButtonText}
            </span>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignInClick}
        disabled={isSubmitting || isLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </Button>

      {showTerms && (
        <p className="text-center text-sm text-gray-600">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      )}
    </div>
  );
}