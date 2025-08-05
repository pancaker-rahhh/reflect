import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, RotateCcw, Bug, Calendar, AlertTriangle } from 'lucide-react'
import { api } from '@/services/api'
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
import type { BugReport } from '@/types'

export function BugReports() {
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['feedback', { type: 'bug' }],
    queryFn: () => api.getFeedback({ type: 'bug' })
  })

  const resetFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setSeverityFilter('all')
    setStatusFilter('all')
    setSearchQuery('')
  }

  const filteredBugReports = feedback
    .filter(item => item.type === 'bug')
    .map(item => item as BugReport)
    .filter(bug => {
      if (startDate && new Date(bug.createdAt) < startDate) return false
      if (endDate && new Date(bug.createdAt) > endDate) return false
      
      if (severityFilter !== 'all' && bug.severity !== severityFilter) return false
      if (statusFilter !== 'all' && bug.status !== statusFilter) return false
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = [
          bug.title,
          bug.description,
          bug.userName,
          bug.userEmail,
          bug.browser,
          bug.os,
          bug.url
        ].filter(Boolean).join(' ').toLowerCase()
        
        if (!searchableText.includes(query)) return false
      }
      
      return true
    })

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return 'default'
      case 'investigating': return 'secondary'
      case 'confirmed': return 'default'
      case 'resolved': return 'outline'
      case 'wont-fix': return 'outline'
      default: return 'outline'
    }
  }

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical' || severity === 'high') {
      return <AlertTriangle className="h-4 w-4" />
    }
    return <Bug className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bug Reports</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage bug reports submitted by your users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter bug reports by date, severity, status, or search for specific issues
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
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="wont-fix">Won't Fix</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search bug reports"
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
      ) : filteredBugReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bug className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bug reports found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Bug reports will appear here when users report issues with your application
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
          {filteredBugReports.map((bug) => (
            <Card key={bug.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(bug.severity)}
                      <h3 className="font-semibold text-lg">{bug.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Reported by {bug.userName || 'Anonymous'}</span>
                      {bug.userEmail && (
                        <span>({bug.userEmail})</span>
                      )}
                      <span>{format(new Date(bug.createdAt), 'PPP')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getSeverityVariant(bug.severity)}>
                      {bug.severity.toUpperCase()}
                    </Badge>
                    <Badge variant={getStatusVariant(bug.status)}>
                      {bug.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <p className="text-sm">{bug.description}</p>
                </div>
                
                {(bug.browser || bug.os || bug.url) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {bug.browser && (
                      <div>
                        <span className="font-medium text-muted-foreground">Browser:</span>
                        <p>{bug.browser}</p>
                      </div>
                    )}
                    {bug.os && (
                      <div>
                        <span className="font-medium text-muted-foreground">OS:</span>
                        <p>{bug.os}</p>
                      </div>
                    )}
                    {bug.url && (
                      <div>
                        <span className="font-medium text-muted-foreground">Page URL:</span>
                        <p className="truncate">{bug.url}</p>
                      </div>
                    )}
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