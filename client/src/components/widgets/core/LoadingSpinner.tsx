import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  color = '#6B46C1',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-gray-200 rounded-full animate-spin`}
        style={{ borderTopColor: color }}
      />
      <div
        className={`absolute inset-0 ${sizeClasses[size]} border-2 border-transparent rounded-full animate-ping`}
        style={{ borderTopColor: `${color}40` }}
      />
    </div>
  )
}
