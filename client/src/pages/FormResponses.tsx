import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  RotateCcw,
  MessageCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
} from 'lucide-react'
import { formApi } from '@/lib/api/form'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FormResponseCard } from '@/components/forms/FormResponseCard'
import { PageLoading } from '@/components/common/LoadingSpinner'
import { useToastNotifications } from '@/hooks/useToastNotifications'
import { exportToCSV, exportToExcel } from '@/lib/exportFormResponses'
import type { FormFieldV2, FormResponseV2 } from '@/types'

const ITEMS_PER_PAGE = 20

export function FormResponses() {
  const navigate = useNavigate()
  const { formId } = useParams<{ formId: string }>()
  const toast = useToastNotifications()
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [sortBy, setSortBy] = useState<string>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSurveyTypes, setSelectedSurveyTypes] = useState<string[]>([])
  const [scoreRangeFilter, setScoreRangeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)

  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const {
    data: form,
    isLoading: isLoadingForm,
    error: formError,
  } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formApi.get(formId!),
    enabled: !!formId,
  })

  const {
    data: responsesData,
    isLoading: isLoadingResponses,
    error: responsesError,
  } = useQuery({
    queryKey: ['form-responses', formId, currentPage],
    queryFn: () =>
      formApi.getResponses(formId!, (currentPage - 1) * ITEMS_PER_PAGE, ITEMS_PER_PAGE),
    enabled: !!formId,
    refetchInterval: 5000,
  })

  const resetFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setSortBy('newest')
    setSearchQuery('')
    setSelectedSurveyTypes([])
    setScoreRangeFilter('all')
    setCurrentPage(1)
  }

  const hasActiveFilters =
    startDate ||
    endDate ||
    sortBy !== 'newest' ||
    searchQuery ||
    selectedSurveyTypes.length > 0 ||
    scoreRangeFilter !== 'all'

  const detectSurveyTypes = (fields: FormFieldV2[]) => {
    const surveyTypes: Record<string, FormFieldV2> = {}

    fields.forEach((field) => {
      if (field.field_type !== 'number') return

      const label = field.label.toLowerCase()
      const fieldKey = field.field_key.toLowerCase()

      if (fieldKey.includes('nps_rating') || label.includes('recommend') || label.includes('nps')) {
        surveyTypes.nps = field
      } else if (
        fieldKey.includes('review_rating') ||
        (label.includes('rate') && label.includes('experience')) ||
        (label.includes('review') && !label.includes('satisfied') && !label.includes('easy'))
      ) {
        surveyTypes.review = field
      } else if (
        label.includes('satisfied') ||
        (label.includes('rate') &&
          !fieldKey.includes('review_rating') &&
          !label.includes('experience')) ||
        label.includes('score')
      ) {
        surveyTypes.csat = field
      } else if (label.includes('easy')) {
        surveyTypes.ces = field
      }
    })

    return surveyTypes
  }

  const hasSurveyTypeAnswer = (
    response: FormResponseV2,
    surveyType: string,
    surveyFields: Record<string, FormFieldV2>
  ): boolean => {
    const field = surveyFields[surveyType]
    if (!field) return false

    const answer = response.answers[field.field_key]
    return answer !== null && answer !== undefined && answer !== '' && !isNaN(Number(answer))
  }

  const matchesScoreRange = (
    response: FormResponseV2,
    scoreRange: string,
    surveyFields: Record<string, FormFieldV2>
  ): boolean => {
    if (scoreRange === 'all') return true

    const [surveyType] = scoreRange.split('_')
    const field = surveyFields[surveyType]
    if (!field) return false

    const answer = Number(response.answers[field.field_key])
    if (isNaN(answer)) return false

    switch (scoreRange) {
      case 'nps_promoters':
        return answer >= 9 && answer <= 10
      case 'nps_passives':
        return answer >= 7 && answer <= 8
      case 'nps_detractors':
        return answer >= 0 && answer <= 6
      case 'csat_positive':
      case 'review_positive':
      case 'ces_positive':
        return answer >= 4 && answer <= 5
      case 'csat_neutral':
      case 'review_neutral':
      case 'ces_neutral':
        return answer === 3
      case 'csat_negative':
      case 'review_negative':
      case 'ces_negative':
        return answer >= 1 && answer <= 2
      default:
        return true
    }
  }

  const surveyFields = useMemo(() => {
    if (!form?.fields) return {}
    return detectSurveyTypes(form.fields)
  }, [form?.fields])

  const availableSurveyTypes = useMemo(() => {
    return Object.keys(surveyFields).filter((type) => surveyFields[type] !== undefined)
  }, [surveyFields])

  const scoreRangeOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Scores' }]

    if (surveyFields.nps) {
      options.push(
        { value: 'nps_promoters', label: 'NPS: Promoters (9-10)' },
        { value: 'nps_passives', label: 'NPS: Passives (7-8)' },
        { value: 'nps_detractors', label: 'NPS: Detractors (1-6)' }
      )
    }

    if (surveyFields.csat) {
      options.push(
        { value: 'csat_positive', label: 'CSAT: Positive (4-5)' },
        { value: 'csat_neutral', label: 'CSAT: Neutral (3)' },
        { value: 'csat_negative', label: 'CSAT: Negative (1-2)' }
      )
    }

    if (surveyFields.review) {
      options.push(
        { value: 'review_positive', label: 'Review: Positive (4-5 ⭐)' },
        { value: 'review_neutral', label: 'Review: Neutral (3 ⭐)' },
        { value: 'review_negative', label: 'Review: Negative (1-2 ⭐)' }
      )
    }

    if (surveyFields.ces) {
      options.push(
        { value: 'ces_positive', label: 'CES: Positive (4-5)' },
        { value: 'ces_neutral', label: 'CES: Neutral (3)' },
        { value: 'ces_negative', label: 'CES: Negative (1-2)' }
      )
    }

    return options
  }, [surveyFields])

  const filteredResponses = useMemo(() => {
    const responses = responsesData?.items || []
    return responses
      .filter((response) => {
        if (startDate && new Date(response.created_at) < startDate) return false
        if (endDate && new Date(response.created_at) > endDate) return false

        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          const searchableText = [
            response.submitter_name,
            response.submitter_email,
            ...Object.values(response.answers).map((v) => String(v ?? '')),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          if (!searchableText.includes(query)) return false
        }

        if (selectedSurveyTypes.length > 0) {
          const hasAllSelectedTypes = selectedSurveyTypes.every((type) =>
            hasSurveyTypeAnswer(response, type, surveyFields)
          )
          if (!hasAllSelectedTypes) return false
        }

        if (scoreRangeFilter !== 'all') {
          if (!matchesScoreRange(response, scoreRangeFilter, surveyFields)) return false
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
  }, [
    responsesData?.items,
    startDate,
    endDate,
    searchQuery,
    selectedSurveyTypes,
    scoreRangeFilter,
    sortBy,
    surveyFields,
  ])

  const applyFilters = (responses: FormResponseV2[]) => {
    return responses
      .filter((response) => {
        if (startDate && new Date(response.created_at) < startDate) return false
        if (endDate && new Date(response.created_at) > endDate) return false

        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          const searchableText = [
            response.submitter_name,
            response.submitter_email,
            ...Object.values(response.answers).map((v) => String(v ?? '')),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          if (!searchableText.includes(query)) return false
        }

        if (selectedSurveyTypes.length > 0) {
          const hasAllSelectedTypes = selectedSurveyTypes.every((type) =>
            hasSurveyTypeAnswer(response, type, surveyFields)
          )
          if (!hasAllSelectedTypes) return false
        }

        if (scoreRangeFilter !== 'all') {
          if (!matchesScoreRange(response, scoreRangeFilter, surveyFields)) return false
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
  }

  const totalPages = Math.ceil((responsesData?.total || 0) / ITEMS_PER_PAGE)

  const handleExport = async (format: 'csv' | 'excel') => {
    if (!formId || !form) return

    setIsExporting(true)
    const loadingToast = toast.showLoading('Fetching all responses...', 'Exporting')

    try {
      let allResponses: FormResponseV2[] = []
      let skip = 0
      const limit = 100

      while (true) {
        const data = await formApi.getResponses(formId, skip, limit)
        allResponses = [...allResponses, ...data.items]

        if (data.items.length < limit || allResponses.length >= data.total) {
          break
        }
        skip += limit
      }

      const filtered = applyFilters(allResponses)

      if (filtered.length === 0) {
        loadingToast.dismiss()
        toast.showWarning('No responses match your current filters', 'No Data')
        setIsExporting(false)
        return
      }

      loadingToast.dismiss()

      if (format === 'csv') {
        exportToCSV(filtered, form.fields || [], form.name)
        toast.showSuccess(`Exported ${filtered.length} responses as CSV`, 'Export Complete')
      } else {
        exportToExcel(filtered, form.fields || [], form.name)
        toast.showSuccess(`Exported ${filtered.length} responses as Excel`, 'Export Complete')
      }
    } catch (error) {
      toast.showError((error as Error).message || 'Failed to export responses', 'Export Error')
    } finally {
      setIsExporting(false)
    }
  }

  const isLoading = isLoadingForm || isLoadingResponses
  const hasError = formError || responsesError

  if (isLoading && !form) {
    return <PageLoading />
  }

  if (hasError || !form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Form Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {hasError
              ? 'Failed to load form. Please try again.'
              : "The form you're looking for doesn't exist or has been removed."}
          </p>
          <Button onClick={() => navigate('/app/forms')}>Back to Forms</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/forms')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{form.name}</h1>
            <p className="text-muted-foreground mt-2">View and manage responses for this form</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {responsesData?.total || 0} Responses
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={!responsesData?.total || responsesData.total === 0 || isExporting}
                className="gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('excel')}
                disabled={isExporting}
                className="cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter responses by date or search for specific content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
            <div className="relative">
              <DatePicker
                date={startDate}
                onDateChange={(date) => {
                  setStartDate(date)
                  handleFilterChange()
                }}
                placeholder="Start date"
                maxDate={endDate}
              />
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
              <DatePicker
                date={endDate}
                onDateChange={(date) => {
                  setEndDate(date)
                  handleFilterChange()
                }}
                placeholder="End date"
                minDate={startDate}
              />
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

            {availableSurveyTypes.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>
                      {selectedSurveyTypes.length === 0
                        ? 'Survey Type'
                        : selectedSurveyTypes.length === 1
                          ? selectedSurveyTypes[0].toUpperCase()
                          : `${selectedSurveyTypes.length} selected`}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" align="start">
                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-2">Select Survey Types</div>
                    {availableSurveyTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selectedSurveyTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSurveyTypes([...selectedSurveyTypes, type])
                            } else {
                              setSelectedSurveyTypes(selectedSurveyTypes.filter((t) => t !== type))
                            }
                            handleFilterChange()
                          }}
                        />
                        <label
                          htmlFor={type}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {type.toUpperCase()}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {scoreRangeOptions.length > 1 && (
              <Select
                value={scoreRangeFilter}
                onValueChange={(value) => {
                  setScoreRangeFilter(value)
                  handleFilterChange()
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Score Range" />
                </SelectTrigger>
                <SelectContent>
                  {scoreRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value)
                handleFilterChange()
              }}
            >
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
                placeholder="Search by name, email, or content"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleFilterChange()
                }}
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
                      sortBy !== 'newest',
                      searchQuery,
                      selectedSurveyTypes.length > 0,
                      scoreRangeFilter !== 'all',
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
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters ? 'No responses match your filters' : 'No responses yet'}
            </h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'Share your form to start collecting responses from your users.'}
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
        <>
          <div className="space-y-4">
            {filteredResponses.map((response) => (
              <FormResponseCard key={response.id} response={response} fields={form.fields || []} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, responsesData?.total || 0)} of{' '}
                {responsesData?.total || 0} responses
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
