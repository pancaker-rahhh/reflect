import React from 'react'
import { Clock } from 'lucide-react'

interface ComingSoonProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description = 'This feature is currently under development and will be available soon.',
  icon,
}) => {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          {icon || <Clock className="w-8 h-8 text-muted-foreground" />}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">{description}</p>
        <div className="inline-flex items-center px-3 py-1 bg-muted text-muted-foreground text-sm font-medium rounded-full">
          <div className="w-2 h-2 bg-muted-foreground rounded-full mr-2 animate-pulse"></div>
          Coming Soon
        </div>
      </div>
    </div>
  )
}
