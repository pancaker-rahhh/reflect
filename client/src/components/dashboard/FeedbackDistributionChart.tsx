import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { MessageSquare, Bug, Lightbulb, Star } from 'lucide-react'
import type { Feedback } from '@/types'

interface FeedbackDistributionChartProps {
  feedback: Feedback[]
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
  }>
}

interface LabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}

export function FeedbackDistributionChart({ feedback }: FeedbackDistributionChartProps) {
  const distribution = [
    {
      name: 'Surveys',
      value: feedback.filter(f => f.type === 'survey').length,
      color: '#3b82f6',
      icon: MessageSquare
    },
    {
      name: 'Bug Reports',
      value: feedback.filter(f => f.type === 'bug').length,
      color: '#dc2626',
      icon: Bug
    },
    {
      name: 'Feature Requests',
      value: feedback.filter(f => f.type === 'feature').length,
      color: '#8b5cf6',
      icon: Lightbulb
    },
    {
      name: 'Reviews',
      value: feedback.filter(f => f.type === 'review').length,
      color: '#10b981',
      icon: Star
    }
  ].filter(item => item.value > 0)

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

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: LabelProps) => {
    if (percent < 0.05) return null // Don't show label if less than 5%
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold"
        style={{ userSelect: 'none' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
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
              labelLine={false}
              label={renderCustomizedLabel}
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
            <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: `${item.color}15` }}>
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-2xl font-bold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}