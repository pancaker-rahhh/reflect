import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, RotateCcw, Lightbulb, CheckSquare } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppContext } from '@/context/AppContext'
import { FeedbackCard } from '@/components/feedback/FeedbackCard'
import { BulkActionsBar } from '@/components/feedback/BulkActionsBar'
import { FeedbackConversionModal } from '@/components/feedback/FeedbackConversionModal'

export function FeatureRequests() {
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [sortBy, setSortBy] = useState<string>('newest')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isBulkConversionModalOpen, setIsBulkConversionModalOpen] = useState(false)

  const { currentProject } = useAppContext()
  const queryClient = useQueryClient()

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['feedback', { type: 'feature_request' }, currentProject?.id],
    queryFn: () => api.getFeedbackData('feature_request', currentProject?.id, 'all'),
    refetchInterval: 5000,
    enabled: !!currentProject?.id,
  })

  const resetFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setSortBy('newest')
    setPriorityFilter('all')
    setSourceFilter('all')
    setSearchQuery('')
  }

  const hasActiveFilters =
    startDate ||
    endDate ||
    sortBy !== 'newest' ||
    priorityFilter !== 'all' ||
    sourceFilter !== 'all' ||
    searchQuery

  const convertMutation = useMutation({
    mutationFn: ({ feedbackId, conversionData }: { feedbackId: string; conversionData: any }) =>
      api.convertToRoadmap(feedbackId, conversionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
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
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
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
    const allIds = new Set(filteredFeatureRequests.map((item: any) => item.id))
    setSelectedItems(allIds)
  }

  const handleClearSelection = () => {
    setSelectedItems(new Set())
    setIsSelectionMode(false)
  }

  const filteredFeatureRequests = feedback
    .filter((item) => item.feedback_type === 'feature_request')
    .filter((feature: any) => {
      if (sourceFilter === 'widgets') {
        if (!feature.widget_id || feature.feedback_metadata?.form_response_v2_id) {
          return false
        }
      }
      if (sourceFilter === 'forms') {
        if (!feature.feedback_metadata?.form_response_v2_id) {
          return false
        }
      }
      if (startDate && new Date(feature.created_at) < startDate) return false
      if (endDate && new Date(feature.created_at) > endDate) return false

      if (priorityFilter !== 'all') {
        const featurePriority = feature.feedback_metadata?.priority?.toLowerCase()
        if (featurePriority !== priorityFilter.toLowerCase()) return false
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = [
          feature.title,
          feature.message,
          feature.submitter_name,
          feature.submitter_email,
          feature.widget_name,
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
        case 'upvotes':
          return (b.feedback_votes || 0) - (a.feedback_votes || 0)
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Feature Requests</h1>
          <p className="text-muted-foreground mt-2">
            Manage and prioritize feature requests from your users
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

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter feature requests by date, priority, sort order, or search for specific features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="upvotes">Most Upvotes</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">🚀 Critical</SelectItem>
                <SelectItem value="medium">😊 Important</SelectItem>
                <SelectItem value="low">😌 Nice to Have</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="widgets">Widgets</SelectItem>
                <SelectItem value="forms">Forms</SelectItem>
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
                      priorityFilter !== 'all',
                      sourceFilter !== 'all',
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
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredFeatureRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No feature requests found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'Feature requests will appear here when users suggest new ideas for your application'}
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
          {filteredFeatureRequests.map((feature: any) => (
            <FeedbackCard
              key={feature.id}
              feedback={feature}
              isSelectionMode={isSelectionMode}
              isSelected={selectedItems.has(feature.id)}
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
