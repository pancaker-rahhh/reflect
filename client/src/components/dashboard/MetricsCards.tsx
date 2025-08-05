import { TrendingUp, TrendingDown, MessageSquare, Star, Bug, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DashboardMetrics } from '@/types'
import { useEffect, useState } from 'react'

interface MetricsCardsProps {
  metrics: DashboardMetrics
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1000
    const startTime = Date.now()
    const startValue = displayValue

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (value - startValue) * easeOutCubic
      
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  return <>{displayValue.toFixed(decimals)}</>
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total Feedback',
      value: metrics.totalFeedback,
      change: metrics.feedbackChange,
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      title: 'Average Rating',
      value: metrics.averageRating,
      change: metrics.ratingChange,
      icon: Star,
      color: 'text-yellow-600',
      decimals: 1
    },
    {
      title: 'New Bug Reports',
      value: metrics.newBugReports,
      change: metrics.bugReportsChange,
      icon: Bug,
      color: 'text-red-600'
    },
    {
      title: 'New Feature Requests',
      value: metrics.newFeatureRequests,
      change: metrics.featureRequestsChange,
      icon: Lightbulb,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className={cn('h-5 w-5', card.color)} />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold tracking-tight">
              <AnimatedNumber value={card.value} decimals={card.decimals} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              <span className={cn(
                'inline-flex items-center',
                card.change > 0 ? 'text-green-600' : card.change < 0 ? 'text-red-600' : 'text-gray-600'
              )}>
                {card.change > 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : card.change < 0 ? (
                  <TrendingDown className="mr-1 h-3 w-3" />
                ) : null}
                {Math.abs(card.change)}%
              </span>
              {' from last period'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}