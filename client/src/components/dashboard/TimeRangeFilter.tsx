import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TimeRange } from '@/pages/Dashboard'

interface TimeRangeFilterProps {
  value: TimeRange
  onChange: (value: TimeRange) => void
}

export function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps) {
  const options: { value: TimeRange; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' }
  ]

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-lg">
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onChange(option.value)}
          className={cn(
            'h-8 px-3',
            value === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'hover:bg-transparent hover:text-foreground'
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}