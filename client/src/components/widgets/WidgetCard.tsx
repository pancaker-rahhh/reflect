import { MoreVertical, Eye, Copy, Trash2, Palette, Puzzle, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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
  onStatusChange: (isActive: boolean) => void
}

export function WidgetCard({ widget, onDelete, onStatusChange }: WidgetCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyKey = async () => {
    if (widget.public_key) {
      await navigator.clipboard.writeText(widget.public_key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const moduleCount = Object.values(widget.configuration?.modules || {}).filter(Boolean).length

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
      <div
        className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${
          widget.is_active ? 'from-green-400 to-teal-500' : 'from-gray-300 to-gray-400'
        }`}
      />
      <CardHeader className="flex flex-row items-start justify-between pb-4">
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-gray-800">{widget.name}</h3>
          <p className="text-sm text-gray-500">
            {moduleCount} module{moduleCount !== 1 ? 's' : ''} enabled
          </p>
        </div>
        {/* The Switch is now the primary action */}
        <div className="flex items-center gap-2">
          <Switch
            checked={widget.is_active}
            onCheckedChange={onStatusChange}
            aria-label={widget.is_active ? 'Deactivate widget' : 'Activate widget'}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                <span>Edit Widget</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyKey} className="gap-2 cursor-pointer">
                <Copy className="h-4 w-4" />
                <span>{copied ? 'Copied!' : 'Copy Public Key'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <Palette className="h-4 w-4 text-gray-400 mr-3" />
            <p className="text-sm text-gray-500">
              Theme:{' '}
              <span className="font-medium text-gray-700 capitalize">
                {(widget.theme_configuration?.theme_name || 'default').replace('-', ' ')}
              </span>
            </p>
          </div>
          <div className="flex items-center">
            <Puzzle className="h-4 w-4 text-gray-400 mr-3" />
            <p className="text-sm text-gray-500">
              Type:{' '}
              <span className="font-medium text-gray-700 uppercase">
                {(widget.widget_type || '').replace('_', ' ')}
              </span>
            </p>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-3" />
            <p className="text-sm text-gray-500">
              Created:{' '}
              <span className="font-medium text-gray-700">
                {new Date(widget.created_at).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
