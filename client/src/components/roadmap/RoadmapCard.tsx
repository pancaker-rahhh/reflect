import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
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
  MoreHorizontal,
  Clock,
  Calendar,
  MessageSquare,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import type { RoadmapActionItem, RoadmapColumn } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'

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
      toast({
        title: 'Feature upvoted',
        description: 'Your vote has been recorded.',
      })
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
      toast({
        title: 'Feature deleted',
        description: 'The feature has been removed from the roadmap.',
      })
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

  // Limit tags to show to prevent overflow
  const maxVisibleTags = 2
  const visibleTags = feature.tags?.slice(0, maxVisibleTags) || []
  const remainingTagsCount =
    feature.tags && feature.tags.length > maxVisibleTags ? feature.tags.length - maxVisibleTags : 0

  return (
    <>
      <Card
        className={cn(
          'group relative cursor-pointer transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.02] border-border/50 bg-card/50 hover:bg-card overflow-hidden',
          isDragged && 'opacity-50 scale-95 rotate-1',
          isSelectionMode && 'hover:ring-2 hover:ring-primary/20',
          isSelected && 'ring-2 ring-primary border-primary/50 bg-primary/5'
        )}
        draggable={!isSelectionMode}
        onDragStart={(e) => !isSelectionMode && onDragStart(e, feature.id, columnId)}
        onDragEnd={onDragEnd}
        onClick={handleCardClick}
      >
        {/* Enhanced hover indicator with gradient animation */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/10 group-hover:to-primary/5 transition-all duration-500 opacity-0 group-hover:opacity-100" />

        {/* Subtle border glow on hover */}
        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/20 transition-all duration-300" />

        {/* Quick Actions - Enhanced hover animation (Edit, JIRA, Delete) */}
        {!isSelectionMode && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 transform translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100">
            <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-lg border border-border/50 p-1 shadow-xl">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110"
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
                  className="h-6 w-6 p-0 hover:bg-muted/70 hover:text-muted-foreground transition-all duration-200 hover:scale-110"
                  onClick={handleConvertToJira}
                  title="Convert to JIRA"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 hover:scale-110"
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
            <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-2 flex-1 group-hover:text-primary/80 transition-all duration-300 group-hover:scale-[1.02] origin-left">
              {feature.title}
            </h4>
            {!isSelectionMode && (
              <GripVertical className="h-4 w-4 text-muted-foreground/60 flex-shrink-0 group-hover:text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            )}
          </div>

          {/* Description with enhanced hover effect */}
          {feature.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed group-hover:text-muted-foreground/80 transition-all duration-300 group-hover:line-clamp-none">
              {feature.description}
            </p>
          )}

          {/* Enhanced Tags with hover animations */}
          {feature.tags && feature.tags.length > 0 && (
            <div className="flex items-center flex-wrap gap-2">
              {visibleTags.map((tag, tagIndex) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs font-medium border-none px-2 py-1 shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                    borderColor: `${tag.color}30`,
                    animationDelay: `${tagIndex * 50}ms`,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {remainingTagsCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium px-2 py-1 bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted/70 transition-all duration-200 hover:scale-105"
                >
                  +{remainingTagsCount}
                </Badge>
              )}
            </div>
          )}

          {feature.feedback_id && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-all duration-300">
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

          {/* Enhanced Footer Information with better spacing */}
          <div className="flex flex-col gap-3 pt-4 border-t border-border/20 group-hover:border-border/40 transition-all duration-300">
            {/* Created Date - Moved to separate line */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-all duration-300">
              <Calendar className="h-3 w-3 text-muted-foreground/60" />
              <span>Created {new Date(feature.created_at).toLocaleDateString()}</span>
            </div>

            {/* Bottom row with submitter and votes */}
            <div className="flex items-center justify-between">
              {/* Enhanced Submitter Info */}
              {feature.submitter_name ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-all duration-300">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <span className="max-w-[80px] truncate font-medium group-hover:max-w-none transition-all duration-300">
                    {feature.submitter_name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-all duration-300">
                  <div className="w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-muted/70 transition-all duration-300 group-hover:scale-110">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span>Anonymous</span>
                </div>
              )}

              {/* Enhanced Vote Count with better interactions */}
              <div className="flex items-center gap-2 text-xs">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110 active:scale-95"
                  onClick={handleUpvote}
                  disabled={upvoteMutation.isPending}
                >
                  <ThumbsUp
                    className={cn(
                      'h-3 w-3 transition-all duration-200',
                      feature.vote_count > 0 && 'text-primary fill-primary'
                    )}
                  />
                </Button>
                <span
                  className={cn(
                    'font-medium min-w-[16px] text-center transition-all duration-200',
                    feature.vote_count > 0 ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {feature.vote_count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Click feedback overlay */}
        <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-active:opacity-100 transition-opacity duration-150 pointer-events-none" />
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
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
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
