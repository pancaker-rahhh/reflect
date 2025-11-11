import {
  DotsThreeVertical,
  Trash,
  Calendar,
  TrendUp,
  Link,
  FileText,
  ChartBar,
} from 'phosphor-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFormMetrics } from '@/hooks/useFormMetrics'
import type { FormV2 } from '@/types'

interface FormCardProps {
  form: FormV2
  viewMode?: 'grid' | 'list'
  onDelete: () => void
  onShare: () => void
  onEdit: () => void
  onViewResponses: () => void
}

export function FormCard({
  form,
  viewMode = 'grid',
  onDelete,
  onShare,
  onEdit,
  onViewResponses,
}: FormCardProps) {
  const fieldCount = form.fields?.length || 0
  const { data: metrics, isLoading: metricsLoading } = useFormMetrics(form.id)

  if (viewMode === 'list') {
    return (
      <Card className="group relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg border-l-4 border-l-transparent hover:border-l-primary/60">
        <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-primary/60 to-accent/60" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 flex-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-foreground truncate">{form.name}</h3>
                  <Badge variant={form.is_active ? 'default' : 'secondary'} className="text-xs">
                    {form.is_active ? 'Active' : 'Draft'}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>
                      {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendUp className="h-4 w-4" />
                    <span>{metricsLoading ? '...' : metrics?.total_responses || 0} responses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(form.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={onEdit}>
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-secondary"
                      >
                        <DotsThreeVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={onViewResponses} className="gap-2 cursor-pointer">
                        <ChartBar className="h-4 w-4" />
                        <span>View Responses</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onShare} className="gap-2 cursor-pointer">
                        <Link className="h-4 w-4" />
                        <span>Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="gap-2 text-destructive hover:text-destructive/80 focus:text-destructive/80 cursor-pointer"
                      >
                        <Trash className="h-4 w-4" />
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

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 border-0 shadow-md hover:border-b-4 hover:border-b-foreground/20">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary/60 to-accent/60" />

      <CardHeader className="pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground truncate" title={form.name}>
              {form.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant={form.is_active ? 'default' : 'secondary'} className="text-xs">
                {form.is_active ? 'Active' : 'Draft'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {fieldCount} field{fieldCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-secondary"
                >
                  <DotsThreeVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewResponses} className="gap-2 cursor-pointer">
                  <ChartBar className="h-4 w-4" />
                  <span>View Responses</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShare} className="gap-2 cursor-pointer">
                  <Link className="h-4 w-4" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="gap-2 text-red-600 hover:text-red-700 focus:text-red-700 cursor-pointer"
                >
                  <Trash className="h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-center p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <TrendUp className="h-4 w-4" />
              <span className="font-bold text-lg">
                {metricsLoading ? '...' : metrics?.total_responses || 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Responses</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Created</span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {new Date(form.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
