import { cn } from '@/lib/utils'

interface PositionSelectorProps {
  value: string
  onChange: (value: string) => void
}

const positions = [
  { value: 'bottom_left', label: 'Bottom Left', className: 'bottom-4 left-4' },
  { value: 'bottom_right', label: 'Bottom Right', className: 'bottom-4 right-4' },
  { value: 'mid_left', label: 'Middle Left', className: 'top-1/2 left-0 -translate-y-1/2' },
  { value: 'mid_right', label: 'Middle Right', className: 'top-1/2 right-0 -translate-y-1/2' },
]

export function PositionSelector({ value, onChange }: PositionSelectorProps) {
  return (
    <div className="relative bg-muted rounded-lg p-8 h-64">
      <div className="absolute inset-2 border-2 border-dashed border-muted-foreground/30 rounded" />

      {positions.map((position) => (
        <button
          key={position.value}
          onClick={() => onChange(position.value)}
          className={cn(
            'absolute w-12 h-8 rounded transition-all',
            'hover:scale-110',
            position.className,
            value === position.value
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'bg-background border-2 hover:border-primary'
          )}
          title={position.label}
        >
          <span className="text-xs font-medium">W</span>
        </button>
      ))}

      <div className="absolute bottom-0 left-0 right-0 text-center text-sm text-muted-foreground">
        Click to select widget position
      </div>
    </div>
  )
}
