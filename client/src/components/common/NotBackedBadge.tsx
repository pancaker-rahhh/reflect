import React from 'react'

export const NotBackedBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-3 px-3 py-1 rounded-full border border-[hsl(var(--border))/0.15] bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))] ${className}`}
      role="img"
      aria-label="Not backed by Y Combinator"
      title="Not backed by Y Combinator"
    >
      <span className="text-sm">Not backed by</span>

      <span className="inline-flex items-center gap-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="24" height="24" rx="5" fill="#ff6a00" />
          <path
            d="M7 5l5.2 7.5L17.4 5v8"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Y Combinator</span>
      </span>
    </div>
  )
}

export default NotBackedBadge
