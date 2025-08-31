import React from 'react'

interface SkeletonPulseProps {
  className?: string
  style?: React.CSSProperties
}

export function SkeletonPulse({ className = '', style }: SkeletonPulseProps) {
  return (
    <div
      className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse ${className}`}
      style={style}
    />
  )
}
