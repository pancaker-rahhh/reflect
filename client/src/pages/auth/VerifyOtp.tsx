import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, ArrowLeft, Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { SyncLoader } from '../../components/auth/SyncLoader'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
})

type OtpFormData = z.infer<typeof otpSchema>

export function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, syncing, verifyOtp, signInWithEmail } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)

  const email = location.state?.email
  const from = location.state?.from || '/app/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  })

  const otpValue = watch('otp')

  useEffect(() => {
    if (!email) {
      navigate('/login')
    }
  }, [email, navigate])

  if (loading || syncing) {
    return <SyncLoader />
  }

  if (user && !syncing) {
    return <Navigate to={from} replace />
  }

  if (!email) {
    return null
  }

  const onSubmit = async (data: OtpFormData) => {
    setIsSubmitting(true)
    setError(null)

    const { error } = await verifyOtp(email, data.otp)

    if (error) {
      setError(error.message)
    }
    // Navigation will happen automatically via useEffect when sync completes

    setIsSubmitting(false)
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setError(null)

    const { error } = await signInWithEmail(email)

    if (error) {
      setError(error.message)
    }

    setIsResending(false)
  }

  const handleBack = () => {
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verify your email</CardTitle>
          <CardDescription className="text-center">
            We've sent a 6-digit code to <br />
            <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium">
                Verification code
              </label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest"
                {...register('otp')}
                disabled={isSubmitting}
                autoComplete="one-time-code"
                autoFocus
              />
              {errors.otp && <p className="text-sm text-red-600">{errors.otp.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !otpValue || otpValue.length !== 6}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </span>
              ) : (
                'Verify Code'
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Didn't receive the code?</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResendCode}
              disabled={isResending}
            >
              {isResending ? 'Sending...' : 'Resend code'}
            </Button>
          </div>

          <Button type="button" variant="ghost" size="sm" className="w-full" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
