import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, RotateCcw, Bug, CheckSquare } from 'lucide-react'
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

export function BugReports() {
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isBulkConversionModalOpen, setIsBulkConversionModalOpen] = useState(false)

  const { currentProject } = useAppContext()
  const queryClient = useQueryClient()

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['feedback', { type: 'bug_report' }, currentProject?.id],
    queryFn: () => api.getFeedbackData('bug_report', currentProject?.id, 'all'),
    refetchInterval: 30000,
    enabled: !!currentProject?.id,
  })

  const resetFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setSeverityFilter('all')
    setSearchQuery('')
  }

  const hasActiveFilters = startDate || endDate || severityFilter !== 'all' || searchQuery

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
    const allIds = new Set(filteredBugReports.map((item: any) => item.id))
    setSelectedItems(allIds)
  }

  const handleClearSelection = () => {
    setSelectedItems(new Set())
    setIsSelectionMode(false)
  }

  const filteredBugReports = feedback
    .filter((item: any) => item.feedback_type === 'bug_report')
    .filter((bug: any) => {
      if (startDate && new Date(bug.created_at) < startDate) return false
      if (endDate && new Date(bug.created_at) > endDate) return false

      if (severityFilter !== 'all') {
        const bugSeverity = bug.severity_level || bug.severity || 'medium'
        if (bugSeverity.toLowerCase() !== severityFilter.toLowerCase()) return false
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = [
          bug.title,
          bug.description,
          bug.message,
          bug.submitter_name,
          bug.submitter_email,
          bug.widget_name,
          bug.browser,
          bug.os,
          bug.url,
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
          <h1 className="text-3xl font-bold">Bug Reports</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage bug reports submitted by your users
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
            Filter bug reports by date, severity, or search for specific issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <DatePicker date={startDate} onDateChange={setStartDate} placeholder="Start date" />

            <DatePicker date={endDate} onDateChange={setEndDate} placeholder="End date" />

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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
                <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {
                    [startDate, endDate, severityFilter !== 'all', searchQuery].filter(Boolean)
                      .length
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
      ) : filteredBugReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bug className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bug reports found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'Bug reports will appear here when users report issues with your application'}
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
          {filteredBugReports.map((bug: any) => (
            <FeedbackCard
              key={bug.id}
              feedback={bug}
              isSelectionMode={isSelectionMode}
              isSelected={selectedItems.has(bug.id)}
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
