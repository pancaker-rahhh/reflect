import { MoreVertical, Eye, Copy, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Widget } from '@/types'
import { useState } from 'react'

interface WidgetCardProps {
  widget: Widget
  onDelete: () => void
}

export function WidgetCard({ widget, onDelete }: WidgetCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(widget.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const moduleCount = Object.values(widget.modules).filter(Boolean).length

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{widget.name}</h3>
          <div className="flex items-center gap-2">
            <Badge variant={widget.isActive ? 'success' : 'secondary'}>
              {widget.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {moduleCount} module{moduleCount !== 1 ? 's' : ''} enabled
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2">
              <Eye className="h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyId} className="gap-2">
              <Copy className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy ID'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDelete} 
              className="gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Theme</p>
            <p className="text-sm font-medium capitalize">
              {widget.appearance.theme.replace('-', ' ')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Primary Type</p>
            <p className="text-sm font-medium uppercase">{widget.primaryType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Created</p>
            <p className="text-sm font-medium">
              {new Date(widget.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}