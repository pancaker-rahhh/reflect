import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, RotateCcw, Lightbulb, ThumbsUp } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import type { FeatureRequest } from '@/types'

export function FeatureRequests() {
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [searchQuery, setSearchQuery] = useState('')

  const queryClient = useQueryClient()

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['feedback', { type: 'feature' }],
    queryFn: () => api.getFeedback({ type: 'feature' })
  })

  const upvoteMutation = useMutation({
    mutationFn: (featureId: string) => api.upvoteFeature(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
    }
  })

  const resetFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setStatusFilter('all')
    setSortBy('newest')
    setSearchQuery('')
  }

  const filteredFeatureRequests = feedback
    .filter(item => item.type === 'feature_request')
    .map(item => item as FeatureRequest)
    .filter(feature => {
      if (startDate && new Date(feature.createdAt) < startDate) return false
      if (endDate && new Date(feature.createdAt) > endDate) return false
      
      if (statusFilter !== 'all' && feature.status !== statusFilter) return false
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = [
          feature.title,
          feature.description,
          feature.userName,
          feature.userEmail
        ].filter(Boolean).join(' ').toLowerCase()
        
        if (!searchableText.includes(query)) return false
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'upvotes':
          return (b.upvotes || 0) - (a.upvotes || 0)
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return 'default'
      case 'under-review': return 'secondary'
      case 'planned': return 'default'
      case 'in-progress': return 'secondary'
      case 'completed': return 'outline'
      case 'declined': return 'destructive'
      default: return 'outline'
    }
  }



  const handleUpvote = (featureId: string) => {
    upvoteMutation.mutate(featureId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Feature Requests</h1>
        <p className="text-muted-foreground mt-2">
          Manage and prioritize feature requests from your users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter feature requests by date, status, or search for specific features
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
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
            
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
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search feature requests"
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
      ) : filteredFeatureRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No feature requests found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Feature requests will appear here when users suggest new ideas for your application
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
          {filteredFeatureRequests.map((feature) => (
            <Card key={feature.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center space-y-1 min-w-[80px]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpvote(feature.id)}
                      disabled={upvoteMutation.isPending}
                      className={cn(
                        "flex flex-col h-auto py-2 px-3",
                        (feature.upvotes || 0) > 0 && "bg-primary/10 border-primary/20"
                      )}
                    >
                      <ThumbsUp className="h-4 w-4 mb-1" />
                      <span className="text-xs font-semibold">{feature.upvotes || 0}</span>
                    </Button>
                    <span className="text-xs text-muted-foreground">upvotes</span>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          <h3 className="font-semibold text-lg">{feature.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Requested by {feature.userName || 'Anonymous'}</span>
                          {feature.userEmail && (
                            <span>({feature.userEmail})</span>
                          )}
                          <span>{format(new Date(feature.createdAt), 'PPP')}</span>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(feature.status || 'new')}>
                        {(feature.status || 'new').replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}