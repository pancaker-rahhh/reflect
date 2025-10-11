import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RoadmapCardDetail } from './RoadmapCardDetail'
import {
  ThumbsUp,
  User,
  GripVertical,
  Edit3,
  Trash2,
  Calendar,
  MessageSquare,
  ExternalLink,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import type { RoadmapActionItem, RoadmapColumn } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { StructuredDescription } from '@/components/common/StructuredDescription'

interface RoadmapCardProps {
  feature: RoadmapActionItem
  columnId: string
  roadmapId: string
  columns: RoadmapColumn[]
  onDragStart: (e: React.DragEvent, featureId: string, columnId: string) => void
  onDragEnd: () => void
  isDragged: boolean
  isSelectionMode: boolean
  onToggleSelection?: (feature: RoadmapActionItem) => void
  isSelected: boolean
  jiraIntegrations?: any[]
  onConvertToJira?: (feature: RoadmapActionItem) => void
}

export function RoadmapCard({
  feature,
  columnId,
  roadmapId,
  columns,
  onDragStart,
  onDragEnd,
  isDragged,
  isSelectionMode,
  onToggleSelection,
  isSelected,
  jiraIntegrations = [],
  onConvertToJira,
}: RoadmapCardProps) {
  const [showDetail, setShowDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const upvoteMutation = useMutation({
    mutationFn: (featureId: string) => api.upvoteFeature(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
    },
    onError: (error) => {
      toast({
        title: 'Error upvoting',
        description: error.message || 'Failed to upvote feature.',
        variant: 'destructive',
      })
    },
  })

  const deleteFeatureMutation = useMutation({
    mutationFn: (featureId: string) => api.deleteRoadmapActionItem(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      setShowDeleteConfirm(false)
    },
    onError: (error) => {
      toast({
        title: 'Error deleting feature',
        description: error.message || 'Failed to delete feature.',
        variant: 'destructive',
      })
    },
  })

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation()
    upvoteMutation.mutate(feature.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const handleConvertToJira = (e: React.MouseEvent) => {
    e.stopPropagation()
    onConvertToJira?.(feature)
  }

  const confirmDelete = () => {
    deleteFeatureMutation.mutate(feature.id)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault()
      e.stopPropagation()
      onToggleSelection?.(feature)
    } else {
      setShowDetail(true)
    }
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSelection?.(feature)
  }

  const maxVisibleTags = 2
  const visibleTags = feature.tags?.slice(0, maxVisibleTags) || []
  const remainingTagsCount =
    feature.tags && feature.tags.length > maxVisibleTags ? feature.tags.length - maxVisibleTags : 0

  return (
    <>
      <Card
        className={cn(
          'relative cursor-pointer border-border/50 bg-card/50 overflow-hidden transition-all duration-200',
          isDragged && 'shadow-lg scale-105 border-blue-500',
          isSelectionMode && 'hover:ring-2 hover:ring-primary/20',
          isSelected && 'ring-2 ring-primary border-primary/50 bg-primary/5'
        )}
        draggable={!isSelectionMode}
        onDragStart={(e) => !isSelectionMode && onDragStart(e, feature.id, columnId)}
        onDragEnd={onDragEnd}
        onClick={handleCardClick}
      >
        {/* Quick Actions */}
        {!isSelectionMode && (
          <div className="absolute top-2 right-2 z-20">
            <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-lg border border-border/50 p-1 shadow-xl">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDetail(true)
                }}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              {jiraIntegrations.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    'h-7 w-7 p-0',
                    feature.jira_integration
                      ? 'text-green-600 hover:bg-green-50 hover:text-green-700'
                      : 'hover:bg-blue-50 hover:text-blue-600'
                  )}
                  onClick={handleConvertToJira}
                  title={feature.jira_integration ? 'View in JIRA' : 'Convert to JIRA'}
                >
                  {feature.jira_integration ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                onClick={handleDelete}
                disabled={deleteFeatureMutation.isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {isSelectionMode && (
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection?.(feature)}
              onClick={handleCheckboxClick}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
        )}

        <div className="p-4 space-y-4 relative z-10">
          {/* Header with Enhanced Drag Handle */}
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-2 flex-1">
              {feature.title}
            </h4>
            {!isSelectionMode && (
              <GripVertical className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
            )}
          </div>

          {feature.priority && (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-medium px-2 py-1',
                  feature.priority === 'critical' && 'bg-red-100 text-red-800 border-red-200',
                  feature.priority === 'high' && 'bg-orange-100 text-orange-800 border-orange-200',
                  feature.priority === 'medium' && 'bg-blue-100 text-blue-800 border-blue-200',
                  feature.priority === 'low' && 'bg-green-100 text-green-800 border-green-200'
                )}
              >
                {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)} Priority
              </Badge>
            </div>
          )}

          {/* Description */}
          {feature.description && (
            <div className="line-clamp-3">
              <StructuredDescription
                description={feature.description}
                className="text-sm text-muted-foreground leading-relaxed"
              />
            </div>
          )}

          {/* Tags */}
          {feature.tags && feature.tags.length > 0 && (
            <div className="flex items-center flex-wrap gap-2">
              {visibleTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs font-medium border-none px-2 py-1 shadow-sm"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                    borderColor: `${tag.color}30`,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {remainingTagsCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium px-2 py-1 bg-muted/50 text-muted-foreground border-border/50"
                >
                  +{remainingTagsCount}
                </Badge>
              )}
            </div>
          )}

          {feature.feedback_id && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3 text-blue-500" />
              <span className="text-blue-600 font-medium">From Feedback</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-xs hover:bg-blue-50 hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(`/feedback/${feature.feedback_id}`, '_blank')
                }}
              >
                View Source
              </Button>
            </div>
          )}

          {/* Footer Information */}
          <div className="flex flex-col gap-3 pt-4 border-t border-border/20">
            {/* Created Date - Moved to separate line */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 text-muted-foreground/60" />
              <span>Created {new Date(feature.created_at).toLocaleDateString()}</span>
            </div>

            {/* Bottom row with submitter, votes, and JIRA status */}
            <div className="flex items-center justify-between">
              {/* Left side: Submitter and JIRA status */}
              <div className="flex items-center gap-3">
                {/* Submitter Info */}
                {feature.submitter_name ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-3 w-3 text-primary" />
                    </div>
                    <span className="max-w-[80px] truncate font-medium">
                      {feature.submitter_name}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center">
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span>Anonymous</span>
                  </div>
                )}

                {/* JIRA Sync Status Indicator */}
                {feature.jira_integration && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-green-600 font-medium">JIRA</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0.5 bg-green-50 text-green-700 border-green-200 font-medium"
                    >
                      {feature.jira_integration.external_id}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Vote Count */}
              <div className="flex items-center gap-2 text-xs">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
                  onClick={handleUpvote}
                  disabled={upvoteMutation.isPending}
                >
                  <ThumbsUp
                    className={cn('h-3 w-3', feature.vote_count > 0 && 'text-primary fill-primary')}
                  />
                </Button>
                <span
                  className={cn(
                    'font-medium min-w-[16px] text-center',
                    feature.vote_count > 0 ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {feature.vote_count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Detail dialog */}
      <RoadmapCardDetail
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        feature={feature}
        roadmapId={roadmapId}
        columns={columns}
        onDelete={() => setShowDetail(false)}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-sm mx-4 border border-border/50 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Delete Feature</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete "
              <span className="font-medium text-foreground">{feature.title}</span>"?
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteFeatureMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteFeatureMutation.isPending}
              >
                {deleteFeatureMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Feature'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
