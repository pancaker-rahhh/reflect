import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CreditCard, User, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { paymentApi, type PaymentLinkRequest } from '@/lib/api/payment'
import { useAppContext } from '@/context/AppContext'
import supportedCountries from './supported-countries.json'

const paymentFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  country: z.string().min(2, 'Please select a country'),
})

type PaymentFormData = z.infer<typeof paymentFormSchema>

interface PaymentFormProps {
  planId: string
  planName: string
  price: number
  currency: string
  onSuccess?: (paymentLink: string) => void
  onError?: (error: string) => void
}

// Use the country data directly from the JSON file
const COUNTRIES = supportedCountries

export function PaymentForm({
  planId,
  planName,
  price,
  currency,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const { currentOrganization } = useAppContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: PaymentFormData) => {
    if (!currentOrganization?.id) {
      setError('Organization not found')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const request: PaymentLinkRequest = {
        plan_id: planId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,
      }

      const response = await paymentApi.createPaymentLink(currentOrganization.id, request)

      // Redirect to payment page
      window.location.href = response.payment_link

      onSuccess?.(response.payment_link)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment link'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <CreditCard className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Complete Your Payment</CardTitle>
        <CardDescription>
          Upgrade to {planName} for ${price}/{currency === 'USD' ? 'month' : 'year'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={() => setError(null)} className="ml-2">
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                className="pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  placeholder="John"
                  className="pl-10"
                  {...register('firstName')}
                />
              </div>
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className="pl-10"
                  {...register('lastName')}
                />
              </div>
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Select onValueChange={(value) => setValue('country', value)}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
          </div>

          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Continue to Payment
                </>
              )}
            </Button>

            {error && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setError(null)
                  reset() // Reset form using React Hook Form
                }}
              >
                Try Again
              </Button>
            )}
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>You will be redirected to our secure payment processor.</p>
          <p>Your payment information is encrypted and secure.</p>
        </div>
      </CardContent>
    </Card>
  )
}
