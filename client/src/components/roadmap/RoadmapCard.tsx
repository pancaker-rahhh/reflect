import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RoadmapCardDetail } from './RoadmapCardDetail'
import { ThumbsUp, User, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RoadmapFeature, RoadmapColumn } from '@/types'

interface RoadmapCardProps {
  feature: RoadmapFeature
  columnId: string
  roadmapId: string
  columns: RoadmapColumn[]
  onDragStart: (e: React.DragEvent, featureId: string, columnId: string) => void
  onDragEnd: () => void
  isDragged: boolean
}

export function RoadmapCard({
  feature,
  columnId,
  roadmapId,
  columns,
  onDragStart,
  onDragEnd,
  isDragged,
}: RoadmapCardProps) {
  const [showDetail, setShowDetail] = useState(false)
  const queryClient = useQueryClient()

  const upvoteMutation = useMutation({
    mutationFn: (featureId: string) => api.upvoteFeature(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] })
    },
  })

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation()
    upvoteMutation.mutate(feature.id)
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
          'p-4 cursor-move transition-opacity hover:shadow-md',
          isDragged && 'opacity-50'
        )}
        draggable
        onDragStart={(e) => onDragStart(e, feature.id, columnId)}
        onDragEnd={onDragEnd}
        onClick={() => setShowDetail(true)}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm leading-tight">{feature.title}</h4>
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>

          {feature.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{feature.description}</p>
          )}

          {/* Tags */}
          {feature.tags && feature.tags.length > 0 && (
            <div className="flex items-center flex-wrap gap-1">
              {visibleTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs font-normal border-none px-1.5 py-0.5"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {remainingTagsCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs font-normal border-none px-1.5 py-0.5 bg-muted"
                >
                  +{remainingTagsCount}
                </Badge>
              )}
            </div>
          )}

          {/* Submitter Info */}
          {feature.submitter_name ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="max-w-[80px] truncate">{feature.submitter_name}</span>
            </div>
          ) : null}

          {/* Vote Count */}
          <div className="flex items-center gap-1 text-xs">
            <ThumbsUp
              className={cn(
                'h-3 w-3 cursor-pointer transition-colors hover:text-primary',
                feature.vote_count > 0 && 'text-primary'
              )}
              onClick={handleUpvote}
            />
            <span className="text-muted-foreground">{feature.vote_count || 0}</span>
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
    </>
  )
}
