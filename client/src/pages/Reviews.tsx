import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, RotateCcw, ExternalLink, TrendingUp, Star } from 'lucide-react'
import { api } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/ui/star-rating'
import { format } from 'date-fns'
import type { Review } from '@/types'

export function Reviews() {
  const [searchQuery, setSearchQuery] = useState('')
  const [timeframe, setTimeframe] = useState('all')

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => api.getReviews()
  })

  const reviews = feedback.filter(f => f.type === 'review') as Review[]

  const resetFilters = () => {
    setSearchQuery('')
    setTimeframe('all')
  }

  const filterReviewsByTimeframe = (reviews: Review[]) => {
    if (timeframe === 'all') return reviews

    const now = new Date()
    const timeframes = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    }

    const days = timeframes[timeframe as keyof typeof timeframes]
    if (!days) return reviews

    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return reviews.filter(review => new Date(review.createdAt) >= cutoffDate)
  }

  const filteredReviews = filterReviewsByTimeframe(reviews).filter(review => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    const searchableText = [
      review.userName,
      review.userEmail,
      review.title,
      review.content
    ].filter(Boolean).join(' ').toLowerCase()
    
    return searchableText.includes(query)
  })

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
    const rating = 5 - i
    const count = reviews.filter(r => r.rating === rating).length
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
        <Button>
          <ExternalLink className="mr-2 h-4 w-4" />
          Enable Public Page
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">
                  {averageRating.toFixed(1)}
                </div>
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
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
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
            
            <Button 
              variant="outline" 
              onClick={resetFilters}
            >
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
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="mt-4"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{review.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-sm text-muted-foreground">
                          by {review.userName || 'Anonymous'}
                          {review.userEmail && ` (${review.userEmail})`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={review.isPublished ? 'default' : 'secondary'}>
                        {review.isPublished ? 'Published' : 'Unpublished'}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(review.createdAt), 'PPP')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{review.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}