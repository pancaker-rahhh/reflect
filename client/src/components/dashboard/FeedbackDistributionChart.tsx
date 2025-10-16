import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { MessageSquare, Bug, Lightbulb, Star } from 'lucide-react'

interface FeedbackDistributionChartProps {
  feedback: Array<{
    type: string
    title?: string
    message?: string
    rating?: number
  }>
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
  }>
}

export function FeedbackDistributionChart({ feedback }: FeedbackDistributionChartProps) {
  const distribution = [
    {
      name: 'General Feedback',
      value: feedback.filter((f) => f.type === 'general').length,
      color: 'hsl(var(--tint-info))',
      icon: MessageSquare,
    },
    {
      name: 'Bug Reports',
      value: feedback.filter((f) => f.type === 'bug_report').length,
      color: 'hsl(var(--tint-danger))',
      icon: Bug,
    },
    {
      name: 'Feature Requests',
      value: feedback.filter((f) => f.type === 'feature_request').length,
      color: 'hsl(var(--tint-primary))',
      icon: Lightbulb,
    },
    {
      name: 'Reviews',
      value: feedback.filter((f) => f.type === 'review').length,
      color: 'hsl(var(--tint-success))',
      icon: Star,
    },
    {
      name: 'NPS',
      value: feedback.filter((f) => f.type === 'NPS').length,
      color: 'hsl(var(--tint-warning))',
      icon: MessageSquare,
    },
    {
      name: 'CSAT',
      value: feedback.filter((f) => f.type === 'CSAT').length,
      color: 'hsl(var(--tint-info))',
      icon: MessageSquare,
    },
    {
      name: 'CES',
      value: feedback.filter((f) => f.type === 'CES').length,
      color: 'hsl(var(--tint-neutral))',
      icon: MessageSquare,
    },
  ].filter((item) => item.value > 0)

  if (distribution.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted/10 rounded-lg border border-dashed">
        <p className="text-base text-muted-foreground font-medium">No feedback data available</p>
      </div>
    )
  }

  const total = distribution.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            <span className="font-medium">{data.value}</span> items
          </p>
          <p className="text-sm text-muted-foreground">
            {((data.value / total) * 100).toFixed(1)}% of total
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribution}
              cx="50%"
              cy="50%"
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {distribution.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ backgroundColor: `${item.color}15` }}
            >
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
