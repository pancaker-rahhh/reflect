import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { Feedback } from '@/types'

interface FeedbackDistributionChartProps {
  feedback: Feedback[]
}

export function FeedbackDistributionChart({ feedback }: FeedbackDistributionChartProps) {
  const distribution = [
    {
      name: 'Surveys',
      value: feedback.filter(f => f.type === 'survey').length,
      color: '#3b82f6' // blue
    },
    {
      name: 'Bugs',
      value: feedback.filter(f => f.type === 'bug').length,
      color: '#ef4444' // red
    },
    {
      name: 'Features',
      value: feedback.filter(f => f.type === 'feature').length,
      color: '#8b5cf6' // purple
    },
    {
      name: 'Reviews',
      value: feedback.filter(f => f.type === 'review').length,
      color: '#10b981' // green
    }
  ].filter(item => item.value > 0)

  if (distribution.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground text-sm">No feedback data available</p>
      </div>
    )
  }

  const total = distribution.reduce((sum, item) => sum + item.value, 0)

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180)
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={distribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            {distribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
            formatter={(value: number) => [
              `${value} (${((value / total) * 100).toFixed(1)}%)`,
              'Count'
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value, entry: any) => (
              <span className="text-sm text-muted-foreground">
                {value}: {entry.payload.value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}