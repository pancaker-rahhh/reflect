import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import type { ConversionData } from '@/lib/api'

export function useFeedbackConversion() {
  const [isLoading, setIsLoading] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const { toast } = useToast()

  const convertFeedbackToRoadmap = async (feedbackId: string, conversionData: ConversionData) => {
    setIsConverting(true)
    try {
      const result = await api.convertToRoadmap(feedbackId, conversionData)
      toast({
        title: 'Success!',
        description: 'Feedback successfully converted to roadmap item.',
        variant: 'default',
      })
      return result
    } catch (error) {
      console.error('Failed to convert feedback:', error)
      toast({
        title: 'Conversion Failed',
        description:
          error instanceof Error ? error.message : 'An error occurred during conversion.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsConverting(false)
    }
  }

  const getActionableFeedback = async () => {
    setIsLoading(true)
    try {
      const result = await api.getActionableFeedback()
      return result
    } catch (error) {
      console.error('Failed to fetch actionable feedback:', error)
      toast({
        title: 'Fetch Failed',
        description:
          error instanceof Error ? error.message : 'Failed to fetch actionable feedback.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getConversionPreview = async (feedbackId: string) => {
    setIsLoading(true)
    try {
      const result = await api.getConversionPreview(feedbackId)
      return result
    } catch (error) {
      console.error('Failed to get conversion preview:', error)
      toast({
        title: 'Preview Failed',
        description: error instanceof Error ? error.message : 'Failed to get conversion preview.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getFeedbackConversionStatus = async (_feedbackId: string) => {
    try {
      // This would be a new endpoint to get conversion status
      // For now, we'll return null as the backend doesn't have this yet
      return null
    } catch (error) {
      console.error('Failed to get conversion status:', error)
      return null
    }
  }

  return {
    convertFeedbackToRoadmap,
    getActionableFeedback,
    getConversionPreview,
    getFeedbackConversionStatus,
    isLoading,
    isConverting,
  }
}
