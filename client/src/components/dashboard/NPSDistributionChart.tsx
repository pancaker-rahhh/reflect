import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Feedback, SurveyResponse } from '@/types'

interface NPSDistributionChartProps {
  feedback: Feedback[]
}

export function NPSDistributionChart({ feedback }: NPSDistributionChartProps) {
  const npsSurveys = feedback.filter(
    (f): f is SurveyResponse => f.type === 'survey' && f.surveyType === 'nps'
  )

  if (npsSurveys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-muted/30 rounded-lg">
        <p className="text-base text-muted-foreground font-medium">No NPS data available</p>
        <p className="text-sm text-muted-foreground mt-1">
          Start collecting NPS feedback to see distribution
        </p>
      </div>
    )
  }

  const distribution = Array.from({ length: 11 }, (_, i) => ({
    score: i,
    count: npsSurveys.filter(s => s.score === i).length
  }))

  const getBarColor = (score: number) => {
    if (score <= 6) return '#ef4444' // Detractor - red
    if (score <= 8) return '#f59e0b' // Passive - yellow
    return '#10b981' // Promoter - green
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={distribution} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="score" 
            tick={{ className: 'fill-muted-foreground text-xs' }}
            axisLine={{ className: 'stroke-muted' }}
          />
          <YAxis 
            tick={{ className: 'fill-muted-foreground text-xs' }}
            axisLine={{ className: 'stroke-muted' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Bar 
            dataKey="count" 
            fill={(data) => getBarColor(data.score)}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}