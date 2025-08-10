import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Calendar, Filter, RotateCcw, MessageCircle } from 'lucide-react'
import { api } from '@/services(mock)/api'
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
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import type { Feedback, SurveyResponse } from '@/types'

export function Responses() {
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [submissionType, setSubmissionType] = useState<string>('all')
  const [scoreFilter, setScoreFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['feedback', { type: submissionType === 'all' ? undefined : submissionType }],
    queryFn: () => api.getFeedback({
      type: submissionType === 'all' ? undefined : submissionType
    })
  })

  const resetFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setSubmissionType('all')
    setScoreFilter('all')
    setSearchQuery('')
  }

  const filteredResponses = feedback.filter(item => {
    if (startDate && new Date(item.createdAt) < startDate) return false
    if (endDate && new Date(item.createdAt) > endDate) return false
    
    if (scoreFilter !== 'all' && item.type === 'survey') {
      const survey = item as SurveyResponse
      const score = survey.score
      if (scoreFilter === 'promoters' && score < 9) return false
      if (scoreFilter === 'passives' && (score < 7 || score > 8)) return false
      if (scoreFilter === 'detractors' && score > 6) return false
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const searchableText = [
        item.userName,
        item.userEmail,
        item.type === 'survey' ? (item as SurveyResponse).comment : '',
        'title' in item ? item.title : '',
        'content' in item ? item.content : '',
        'description' in item ? item.description : ''
      ].filter(Boolean).join(' ').toLowerCase()
      
      if (!searchableText.includes(query)) return false
    }
    
    return true
  })

  const surveyResponses = filteredResponses.filter(f => f.type === 'survey') as SurveyResponse[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Responses</h1>
        <p className="text-muted-foreground mt-2">
          Manage and analyze survey responses from your users
        </p>
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
            <DatePicker
              date={startDate}
              onDateChange={setStartDate}
              placeholder="Start date"
            />
            
            <DatePicker
              date={endDate}
              onDateChange={setEndDate}
              placeholder="End date"
            />
            
            <Select value={submissionType} onValueChange={setSubmissionType}>
              <SelectTrigger>
                <SelectValue placeholder="Survey type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="nps">NPS</SelectItem>
                <SelectItem value="csat">CSAT</SelectItem>
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
              variant="outline" 
              onClick={resetFilters}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset filters
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
      ) : surveyResponses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No responses found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Responses will appear here once users complete your surveys
            </p>
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="mt-4"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {surveyResponses.map((response) => (
            <Card key={response.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{response.userName || 'Anonymous'}</span>
                      {response.userEmail && (
                        <span className="text-sm text-muted-foreground">({response.userEmail})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{format(new Date(response.createdAt), 'PPP')}</span>
                      <Badge variant="outline">{response.surveyType.toUpperCase()}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {response.score}/10
                    </div>
                    <Badge 
                      variant={
                        response.score >= 9 ? 'default' : 
                        response.score >= 7 ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {response.score >= 9 ? 'Promoter' : 
                       response.score >= 7 ? 'Passive' : 
                       'Detractor'}
                    </Badge>
                  </div>
                </div>
                {response.comment && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm">{response.comment}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}