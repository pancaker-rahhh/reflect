import {
  MoreVertical,
  Eye,
  Copy,
  Trash2,
  Palette,
  Puzzle,
  Calendar,
  TrendingUp,
  Users,
} from 'lucide-react'
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
  viewMode?: 'grid' | 'list'
  onDelete: () => void
  onStatusChange: (isActive: boolean) => void
}

export function WidgetCard({
  widget,
  viewMode = 'grid',
  onDelete,
  onStatusChange,
}: WidgetCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyKey = async () => {
    if (widget.public_key) {
      await navigator.clipboard.writeText(widget.public_key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const moduleCount = Object.values(widget.configuration?.modules || {}).filter(Boolean).length

  if (viewMode === 'list') {
    return (
      <Card className="group relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg border-l-4 border-l-transparent hover:border-l-blue-500">
        <div
          className={`absolute top-0 left-0 h-full w-1 bg-gradient-to-b ${
            widget.is_active ? 'from-green-400 to-teal-500' : 'from-gray-300 to-gray-400'
          }`}
        />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 flex-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-gray-900 truncate">{widget.name}</h3>
                  <Badge
                    variant={widget.is_active ? 'default' : 'secondary'}
                    className={`${
                      widget.is_active
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {widget.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {(widget.widget_type || '').replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Puzzle className="h-4 w-4" />
                    <span>{moduleCount} modules</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Palette className="h-4 w-4" />
                    <span className="capitalize">
                      {(widget.theme_configuration?.theme_name || 'default').replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(widget.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-blue-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">145</span>
                    <span className="text-gray-500">responses</span>
                  </div>
                  <div className="flex items-center gap-1 text-purple-600">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">89</span>
                    <span className="text-gray-500">users</span>
                  </div>
                </div>

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
                        className="h-8 w-8 text-gray-500 hover:bg-gray-100"
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid view (default)
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 border-0 shadow-md">
      <div
        className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${
          widget.is_active ? 'from-green-400 to-teal-500' : 'from-gray-300 to-gray-400'
        }`}
      />

      {/* Status indicator badge */}
      <div
        className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-medium ${
          widget.is_active
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}
      >
        <div className="flex items-center gap-1">
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              widget.is_active ? 'bg-green-500' : 'bg-gray-400'
            }`}
          ></div>
          {widget.is_active ? 'Active' : 'Inactive'}
        </div>
      </div>

      <CardHeader className="pt-12 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 truncate" title={widget.name}>
              {widget.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {(widget.widget_type || '').replace('_', ' ').toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-500">
                {moduleCount} module{moduleCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-2">
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
                  className="h-8 w-8 text-gray-500 hover:bg-gray-100"
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
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="font-bold text-lg">145</span>
            </div>
            <p className="text-xs text-gray-600">Responses</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
              <Users className="h-4 w-4" />
              <span className="font-bold text-lg">89</span>
            </div>
            <p className="text-xs text-gray-600">Users</p>
          </div>
        </div>

        {/* Widget details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Theme</span>
            </div>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {(widget.theme_configuration?.theme_name || 'default').replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Created</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {new Date(widget.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
