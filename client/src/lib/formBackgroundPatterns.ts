export const backgroundPatterns = {
  none: {},
  dots: {
    backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  },
  grid: {
    backgroundImage:
      'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
    backgroundSize: '30px 30px',
  },
  diagonal: {
    backgroundImage:
      'repeating-linear-gradient(45deg, transparent, transparent 10px, #e5e7eb 10px, #e5e7eb 11px)',
  },
  waves: {
    backgroundImage:
      'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 25%, transparent 25%), linear-gradient(225deg, rgba(99, 102, 241, 0.05) 25%, transparent 25%), linear-gradient(45deg, rgba(99, 102, 241, 0.05) 25%, transparent 25%), linear-gradient(315deg, rgba(99, 102, 241, 0.05) 25%, transparent 25%)',
    backgroundSize: '40px 40px',
    backgroundPosition: '0 0, 20px 0, 20px -20px, 0px 20px',
  },
  'gradient-soft': {
    backgroundImage:
      'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
  },
} as const

export type BackgroundPattern = keyof typeof backgroundPatterns

export function getBackgroundStyle(pattern: string | undefined): React.CSSProperties {
  if (!pattern || pattern === 'none') {
    return {}
  }

  return backgroundPatterns[pattern as BackgroundPattern] || {}
}
