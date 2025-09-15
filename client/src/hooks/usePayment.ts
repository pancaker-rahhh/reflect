import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@/context/AppContext'
import { paymentApi, type PaymentLinkRequest } from '@/lib/api/payment'

export function usePayment() {
  const { currentOrganization } = useAppContext()
  const queryClient = useQueryClient()

  // Get payment plans
  const {
    data: paymentPlans,
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: ['payment-plans', currentOrganization?.id],
    queryFn: () => paymentApi.getPaymentPlans(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })

  // Create payment link mutation
  const createPaymentLinkMutation = useMutation({
    mutationFn: ({
      organizationId,
      request,
    }: {
      organizationId: string
      request: PaymentLinkRequest
    }) => paymentApi.createPaymentLink(organizationId, request),
    onSuccess: (data) => {
      // Redirect to payment page
      window.location.href = data.payment_link
    },
  })

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: (organizationId: string) => paymentApi.cancelSubscription(organizationId),
    onSuccess: () => {
      // Invalidate subscription queries
      queryClient.invalidateQueries({ queryKey: ['subscription-plan'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-limits'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-features'] })
    },
  })

  // Get payment status
  const getPaymentStatus = async (paymentId: string) => {
    if (!currentOrganization?.id) return null

    try {
      return await paymentApi.getPaymentStatus(currentOrganization.id, paymentId)
    } catch (error) {
      console.error('Failed to get payment status:', error)
      return null
    }
  }

  // Create payment link
  const createPaymentLink = (request: PaymentLinkRequest) => {
    if (!currentOrganization?.id) {
      throw new Error('Organization not found')
    }

    return createPaymentLinkMutation.mutateAsync({
      organizationId: currentOrganization.id,
      request,
    })
  }

  // Cancel subscription
  const cancelSubscription = () => {
    if (!currentOrganization?.id) {
      throw new Error('Organization not found')
    }

    return cancelSubscriptionMutation.mutateAsync(currentOrganization.id)
  }

  return {
    // Data
    paymentPlans: paymentPlans?.plans || [],
    totalPlans: paymentPlans?.total || 0,

    // Loading states
    isLoading: plansLoading,
    isCreatingPayment: createPaymentLinkMutation.isPending,
    isCancelling: cancelSubscriptionMutation.isPending,

    // Errors
    error: plansError || createPaymentLinkMutation.error || cancelSubscriptionMutation.error,

    // Actions
    createPaymentLink,
    cancelSubscription,
    getPaymentStatus,

    // Mutations for direct access
    createPaymentLinkMutation,
    cancelSubscriptionMutation,
  }
}
