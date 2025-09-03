import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { Feedback, SurveyResponse } from '@/types'

interface NPSDistributionChartProps {
  feedback: any[]
}

export function NPSDistributionChart({ feedback }: NPSDistributionChartProps) {
  const npsSurveys = feedback.filter(
    (f) => f.type === 'NPS' && f.rating !== null && f.rating !== undefined
  )

  if (npsSurveys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted/10 rounded-lg border border-dashed">
        <p className="text-base text-muted-foreground font-medium">No NPS data available</p>
        <p className="text-sm text-muted-foreground mt-1">
          Start collecting NPS feedback to see distribution
        </p>
      </div>
    )
  }

  const distribution = Array.from({ length: 11 }, (_, i) => ({
    score: i,
    count: npsSurveys.filter((s) => s.rating === i).length,
    percentage: (
      (npsSurveys.filter((s) => s.rating === i).length / npsSurveys.length) *
      100
    ).toFixed(1),
  }))

  const getBarColor = (score: number) => {
    if (score <= 6) return '#dc2626'
    if (score <= 8) return '#f59e0b'
    return '#10b981'
  }

  const detractors = npsSurveys.filter((s) => s.rating <= 6).length
  const promoters = npsSurveys.filter((s) => s.rating >= 9).length
  const npsScore = Math.round(((promoters - detractors) / npsSurveys.length) * 100)

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ value: number; payload: { percentage: string } }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3">
          <p className="font-semibold">Score {label}</p>
          <p className="text-sm">
            <span className="font-medium">{payload[0].value}</span> responses
          </p>
          <p className="text-sm text-muted-foreground">{payload[0].payload.percentage}% of total</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-600" />
            <span className="text-muted-foreground">Detractors (0-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-muted-foreground">Passives (7-8)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-600" />
            <span className="text-muted-foreground">Promoters (9-10)</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">NPS Score</p>
          <p className="text-2xl font-bold">{npsScore}</p>
        </div>
      </div>

      <div className="h-56 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
            <XAxis
              dataKey="score"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
