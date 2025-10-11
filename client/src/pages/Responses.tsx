import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, RotateCcw, MessageCircle, CheckSquare } from 'lucide-react'
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

export function Responses() {
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [submissionType, setSubmissionType] = useState<string>('all')
  const [scoreFilter, setScoreFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isBulkConversionModalOpen, setIsBulkConversionModalOpen] = useState(false)

  const { currentProject } = useAppContext()
  const queryClient = useQueryClient()

  const { data: allFeedback = [], isLoading } = useQuery({
    queryKey: ['feedback', currentProject?.id],
    queryFn: () => api.getFeedbackData(undefined, currentProject?.id, 'all'),
    refetchInterval: 30000,
    enabled: !!currentProject?.id,
  })

  const surveyTypes = ['NPS', 'CSAT', 'CES', 'SURVEY', 'FEEDBACK', 'general']
  const feedback = allFeedback.filter((item: any) => surveyTypes.includes(item.feedback_type))

  const resetFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setSubmissionType('all')
    setScoreFilter('all')
    setSearchQuery('')
  }

  const hasActiveFilters =
    startDate || endDate || submissionType !== 'all' || scoreFilter !== 'all' || searchQuery

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
    const allIds = new Set(filteredResponses.map((item: any) => item.id))
    setSelectedItems(allIds)
  }

  const handleClearSelection = () => {
    setSelectedItems(new Set())
    setIsSelectionMode(false)
  }

  const filteredResponses = feedback.filter((item: any) => {
    if (submissionType !== 'all' && item.feedback_type !== submissionType) {
      return false
    }

    if (startDate && new Date(item.created_at) < startDate) return false
    if (endDate && new Date(item.created_at) > endDate) return false

    if (scoreFilter !== 'all') {
      let score: number | null = null

      if (item.feedback_type === 'NPS' && item.nps_score !== null && item.nps_score !== undefined) {
        score = item.nps_score
      } else if (
        item.feedback_type === 'CSAT' &&
        item.csat_score !== null &&
        item.csat_score !== undefined
      ) {
        score = item.csat_score
      } else if (
        item.feedback_type === 'CES' &&
        item.ces_score !== null &&
        item.ces_score !== undefined
      ) {
        score = item.ces_score
      } else if (item.rating !== null && item.rating !== undefined) {
        score = item.rating
      }

      if (score !== null) {
        if (scoreFilter === 'promoters' && score < 9) return false
        if (scoreFilter === 'passives' && (score < 7 || score > 8)) return false
        if (scoreFilter === 'detractors' && score > 6) return false
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const searchableText = [
        item.submitter_name,
        item.submitter_email,
        item.widget_name,
        'title' in item ? item.title : '',
        'message' in item ? item.message : '',
        'description' in item ? item.description : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!searchableText.includes(query)) return false
    }

    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Survey Responses</h1>
          <p className="text-muted-foreground mt-2">
            Manage and analyze NPS, CSAT, CES, and general feedback responses from your users
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
            Filter responses by date, type, score, or search for specific content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="relative">
              <DatePicker date={startDate} onDateChange={setStartDate} placeholder="Start date" />
              {startDate && (
                <button
                  onClick={() => setStartDate(undefined)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  type="button"
                >
                  ×
                </button>
              )}
            </div>

            <div className="relative">
              <DatePicker date={endDate} onDateChange={setEndDate} placeholder="End date" />
              {endDate && (
                <button
                  onClick={() => setEndDate(undefined)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  type="button"
                >
                  ×
                </button>
              )}
            </div>

            <Select value={submissionType} onValueChange={setSubmissionType}>
              <SelectTrigger>
                <SelectValue placeholder="Survey type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="NPS">NPS</SelectItem>
                <SelectItem value="CSAT">CSAT</SelectItem>
                <SelectItem value="CES">CES</SelectItem>
              </SelectContent>
            </Select>

            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Score/Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="promoters">Promoters (9-10)</SelectItem>
                <SelectItem value="passives">Passives (7-8)</SelectItem>
                <SelectItem value="detractors">Detractors (0-6)</SelectItem>
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
                      submissionType !== 'all',
                      scoreFilter !== 'all',
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
      ) : filteredResponses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No survey responses found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Survey responses will appear here once users complete your NPS, CSAT, CES, or general
              feedback surveys
            </p>
            <Button variant="outline" onClick={resetFilters} className="mt-4">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResponses.map((response: any) => (
            <FeedbackCard
              key={response.id}
              feedback={response}
              isSelectionMode={isSelectionMode}
              isSelected={selectedItems.has(response.id)}
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
