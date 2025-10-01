import { MessageSquare, Star, Bug, Lightbulb, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DashboardMetrics } from '@/types'
import { useEffect, useState, useRef } from 'react'

interface MetricsCardsProps {
  metrics: DashboardMetrics
}

function AnimatedNumber({
  value,
  decimals = 0,
  suffix = '',
}: {
  value: number
  decimals?: number
  suffix?: string
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const displayValueRef = useRef(0)

  useEffect(() => {
    const duration = 1000
    const startTime = Date.now()
    const startValue = displayValueRef.current

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)

      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (value - startValue) * easeOutCubic

      displayValueRef.current = current
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  return (
    <>
      {displayValue.toFixed(decimals)}
      {suffix}
    </>
  )
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total Feedback',
      value: metrics.totalFeedback,
      icon: MessageSquare,
      color: 'text-blue-600',
      suffix: '',
    },
    {
      title: 'Average Rating',
      value: metrics.averageRating,
      icon: Star,
      color: 'text-yellow-600',
      decimals: 1,
      suffix: '',
    },
    {
      title: 'New Bug Reports',
      value: metrics.newBugReports,
      icon: Bug,
      color: 'text-red-600',
      suffix: '',
    },
    {
      title: 'New Feature Requests',
      value: metrics.newFeatureRequests,
      icon: Lightbulb,
      color: 'text-purple-600',
      suffix: '',
    },
    {
      title: 'Pending Feedback Review',
      value: metrics.pendingFeedbackReview || 0,
      icon: Clock,
      color: 'text-orange-600',
      suffix: '',
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={cn('h-5 w-5', card.color)} />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold tracking-tight">
              <AnimatedNumber value={card.value} decimals={card.decimals} suffix={card.suffix} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
