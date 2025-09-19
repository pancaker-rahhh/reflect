import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, RotateCcw, TrendingUp, Star, CheckSquare } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { StarRating } from '@/components/ui/star-rating'
import { useAppContext } from '@/context/AppContext'
import { FeedbackCard } from '@/components/feedback/FeedbackCard'
import { BulkActionsBar } from '@/components/feedback/BulkActionsBar'
import { FeedbackConversionModal } from '@/components/feedback/FeedbackConversionModal'

export function Reviews() {
  const [searchQuery, setSearchQuery] = useState('')
  const [timeframe, setTimeframe] = useState('all')
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isBulkConversionModalOpen, setIsBulkConversionModalOpen] = useState(false)

  const { currentProject } = useAppContext()
  const queryClient = useQueryClient()

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['reviews', currentProject?.id],
    queryFn: () => api.getFeedbackData('review', currentProject?.id),
    refetchInterval: 30000,
    enabled: !!currentProject?.id,
  })

  // Debug: Log the feedback data to see what's being returned
  console.log('Reviews - Raw feedback data:', feedback)

  const reviews = feedback.filter((f) => f.feedback_type === 'review')

  const resetFilters = () => {
    setSearchQuery('')
    setTimeframe('all')
  }

  const convertMutation = useMutation({
    mutationFn: ({ feedbackId, conversionData }: { feedbackId: string; conversionData: any }) =>
      api.convertToRoadmap(feedbackId, conversionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      queryClient.invalidateQueries({ queryKey: ['roadmap-tags'] })
    },
  })

  const bulkConvertMutation = useMutation({
    mutationFn: async ({
      feedbackIds,
      conversionData,
    }: {
      feedbackIds: string[]
      conversionData: any
    }) => {
      return api.bulkConvertToRoadmap(feedbackIds, conversionData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      queryClient.invalidateQueries({ queryKey: ['roadmap-tags'] })
      setSelectedItems(new Set())
      setIsSelectionMode(false)
    },
  })

  const handleConvert = async (feedbackId: string, conversionData: any) => {
    await convertMutation.mutateAsync({ feedbackId, conversionData })
  }

  const handleBulkConvert = async (conversionData: any) => {
    const feedbackIds = Array.from(selectedItems)
    await bulkConvertMutation.mutateAsync({ feedbackIds, conversionData })
    setIsBulkConversionModalOpen(false)
  }

  const handleToggleSelection = (feedbackId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(feedbackId)) {
        newSet.delete(feedbackId)
      } else {
        newSet.add(feedbackId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    const allIds = new Set(filteredReviews.map((item: any) => item.id))
    setSelectedItems(allIds)
  }

  const handleClearSelection = () => {
    setSelectedItems(new Set())
    setIsSelectionMode(false)
  }

  const filterReviewsByTimeframe = (reviews: typeof feedback) => {
    if (timeframe === 'all') return reviews

    const now = new Date()
    const timeframes = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    }

    const days = timeframes[timeframe as keyof typeof timeframes]
    if (!days) return reviews

    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return reviews.filter((review) => new Date(review.created_at) >= cutoffDate)
  }

  const filteredReviews = filterReviewsByTimeframe(reviews).filter((review) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    const searchableText = [
      review.submitter_name,
      review.submitter_email,
      review.title,
      review.message,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchableText.includes(query)
  })

  // Fix: Use overall_rating for reviews, fallback to rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + (review.overall_rating || review.rating || 0), 0) /
        reviews.length
      : 0

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
    const rating = 5 - i
    // Fix: Use overall_rating for reviews, fallback to rating
    const count = reviews.filter((r) => (r.overall_rating || r.rating || 0) === rating).length
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
    return { rating, count, percentage }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground mt-2">
            Manage user reviews and testimonials for your project
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSelectionMode && (
            <>
              <Button variant="outline" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" onClick={handleClearSelection}>
                Clear Selection
              </Button>
            </>
          )}
          <Button
            variant={isSelectionMode ? 'default' : 'outline'}
            onClick={() => setIsSelectionMode(!isSelectionMode)}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            {isSelectionMode ? 'Exit Selection' : 'Select Items'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                <div>
                  <StarRating rating={averageRating} size="lg" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {reviews.length} reviews
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Trend</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[140px]">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No data available</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or review text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {searchQuery || timeframe !== 'all'
                ? 'Try adjusting your filters to see more results'
                : 'Reviews will appear here once users submit them'}
            </p>
            {(searchQuery || timeframe !== 'all') && (
              <Button variant="outline" onClick={resetFilters} className="mt-4">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review: any) => (
            <FeedbackCard
              key={review.id}
              feedback={review}
              isSelectionMode={isSelectionMode}
              isSelected={selectedItems.has(review.id)}
              onToggleSelection={handleToggleSelection}
              onConvert={handleConvert}
              isConverting={convertMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedItems.size}
        onConvertSelected={() => setIsBulkConversionModalOpen(true)}
        onClearSelection={handleClearSelection}
        isConverting={bulkConvertMutation.isPending}
      />

      {/* Bulk Conversion Modal */}
      <FeedbackConversionModal
        isOpen={isBulkConversionModalOpen}
        onClose={() => setIsBulkConversionModalOpen(false)}
        onConvert={handleBulkConvert}
        feedback={{
          id: 'bulk',
          feedback_type: 'bulk',
          title: `Convert ${selectedItems.size} items`,
        }}
        isBulk={true}
        selectedCount={selectedItems.size}
      />
    </div>
  )
}
