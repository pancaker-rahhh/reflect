import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, RotateCcw, Star, CheckSquare } from 'lucide-react'
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
import { DatePicker } from '@/components/ui/date-picker'
import { useAppContext } from '@/context/AppContext'
import { FeedbackCard } from '@/components/feedback/FeedbackCard'
import { BulkActionsBar } from '@/components/feedback/BulkActionsBar'
import { FeedbackConversionModal } from '@/components/feedback/FeedbackConversionModal'

export function Reviews() {
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isBulkConversionModalOpen, setIsBulkConversionModalOpen] = useState(false)

  const { currentProject } = useAppContext()
  const queryClient = useQueryClient()

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['reviews', currentProject?.id],
    queryFn: () => api.getFeedbackData('review', currentProject?.id, 'all'),
    refetchInterval: 5000,
    enabled: !!currentProject?.id,
  })

  const reviews = feedback.filter((f) => f.feedback_type === 'review')

  const resetFilters = () => {
    setSearchQuery('')
    setStartDate(undefined)
    setEndDate(undefined)
    setRatingFilter('all')
    setSortBy('newest')
  }

  const hasActiveFilters =
    searchQuery || startDate || endDate || ratingFilter !== 'all' || sortBy !== 'newest'

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

  const filteredReviews = reviews
    .filter((review) => {
      if (startDate && new Date(review.created_at) < startDate) return false
      if (endDate && new Date(review.created_at) > endDate) return false

      if (ratingFilter !== 'all') {
        const rating = review.overall_rating || 0
        if (ratingFilter === 'promoters' && rating < 4) return false
        if (ratingFilter === 'passives' && (rating < 3 || rating > 3)) return false
        if (ratingFilter === 'detractors' && rating > 2) return false
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = [
          review.submitter_name,
          review.submitter_email,
          review.widget_name,
          review.title,
          review.message,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (!searchableText.includes(query)) return false
      }

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + (review.overall_rating || 0), 0) / reviews.length
      : 0

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
    const rating = 5 - i
    const count = reviews.filter((r) => (r.overall_rating || 0) === rating).length
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Average Rating</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
                <div className="flex flex-col gap-2">
                  <StarRating rating={averageRating} size="lg" />
                  <p className="text-sm text-muted-foreground">Based on {reviews.length} reviews</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-muted-foreground">
                  {reviews.length > 0
                    ? Math.round(
                        (reviews.filter((r) => (r.overall_rating || 0) >= 4).length /
                          reviews.length) *
                          100
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Positive</p>
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
                    <span className="text-sm font-medium text-foreground">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <p className="text-sm text-muted-foreground">
            Filter reviews by date, rating, or search for specific content
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <DatePicker
              date={startDate}
              onDateChange={setStartDate}
              placeholder="Start date"
              maxDate={endDate}
            />

            <DatePicker
              date={endDate}
              onDateChange={setEndDate}
              placeholder="End date"
              minDate={startDate}
            />

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="promoters">Positive (4-5 ⭐)</SelectItem>
                <SelectItem value="passives">Neutral (3 ⭐)</SelectItem>
                <SelectItem value="detractors">Negative (1-2 ⭐)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by widget or content"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant={hasActiveFilters ? 'default' : 'outline'}
              onClick={resetFilters}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset filters
              {hasActiveFilters && (
                <span className="ml-2 bg-tertiary/20 text-xs px-1.5 py-0.5 rounded-full">
                  {
                    [
                      startDate,
                      endDate,
                      ratingFilter !== 'all',
                      sortBy !== 'newest',
                      searchQuery,
                    ].filter(Boolean).length
                  }
                </span>
              )}
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
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'Reviews will appear here once users submit them'}
            </p>
            {hasActiveFilters && (
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
