import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roadmapApi } from '@/lib/api'
import type { RoadmapActionItem, RoadmapActionItemTag } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { MapPin, Calendar, ThumbsUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function PublicRoadmap() {
  const { publicSlug, subdomain } = useParams<{ publicSlug?: string; subdomain?: string }>()
  const [votingItems, setVotingItems] = useState<Set<string>>(new Set())
  const [votedItems, setVotedItems] = useState<Set<string>>(new Set())
  const queryClient = useQueryClient()

  // Load voted items from localStorage on component mount
  useEffect(() => {
    const savedVotes = localStorage.getItem('roadmap-votes')
    if (savedVotes) {
      try {
        const votes = JSON.parse(savedVotes)
        setVotedItems(new Set(votes))
      } catch (error) {
        console.error('Failed to parse saved votes:', error)
      }
    }
  }, [])

  // Save voted items to localStorage
  const saveVotedItems = (items: Set<string>) => {
    localStorage.setItem('roadmap-votes', JSON.stringify(Array.from(items)))
  }

  const {
    data: roadmap,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['public-roadmap', publicSlug || subdomain],
    queryFn: async () => {
      if (subdomain) {
        return await roadmapApi.getPublicRoadmapBySubdomain(subdomain)
      } else if (publicSlug) {
        return await roadmapApi.getPublicRoadmap(publicSlug)
      }
      throw new Error('No public slug or subdomain provided')
    },
    enabled: !!(publicSlug || subdomain),
  })

  const upvoteMutation = useMutation({
    mutationFn: async (featureId: string) => {
      const response = await fetch(`/api/v1/public/features/${featureId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to upvote feature')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-roadmap', publicSlug || subdomain] })
    },
  })

  const handleUpvote = (featureId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (votingItems.has(featureId)) return

    setVotingItems((prev) => new Set(prev).add(featureId))
    upvoteMutation.mutate(featureId, {
      onSuccess: () => {
        // Toggle vote state - if already voted, remove vote; if not voted, add vote
        const newVotedItems = new Set(votedItems)
        if (newVotedItems.has(featureId)) {
          newVotedItems.delete(featureId)
        } else {
          newVotedItems.add(featureId)
        }
        setVotedItems(newVotedItems)
        saveVotedItems(newVotedItems)
      },
      onSettled: () => {
        setVotingItems((prev) => {
          const newSet = new Set(prev)
          newSet.delete(featureId)
          return newSet
        })
      },
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-4">
              <SkeletonLoader className="w-32 h-12 mx-auto" />
              <SkeletonLoader className="w-96 h-6 mx-auto" />
            </div>

            {/* Columns Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-background/50 border border-border/50 rounded-xl p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <SkeletonLoader className="w-3 h-3 rounded-full" />
                      <SkeletonLoader className="w-24 h-6" />
                    </div>
                    <SkeletonLoader className="w-16 h-4" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="p-4 bg-muted/30 border border-border/30 rounded-lg">
                        <SkeletonLoader className="w-full h-4 mb-2" />
                        <SkeletonLoader className="w-3/4 h-3 mb-3" />
                        <div className="flex gap-1">
                          <SkeletonLoader className="w-12 h-5 rounded-full" />
                          <SkeletonLoader className="w-16 h-5 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="h-12 w-12 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Roadmap Not Found</h1>
            <p className="text-muted-foreground max-w-md">
              The roadmap you're looking for doesn't exist or is not publicly accessible.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          {roadmap.logo_url && (
            <div className="flex justify-center">
              <img
                src={roadmap.logo_url}
                alt={`${roadmap.name} logo`}
                className="h-16 w-auto object-contain"
              />
            </div>
          )}

          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {roadmap.name}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track our progress and see what's coming next
            </p>
          </div>

          {/* Public URL Info */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Public Roadmap</span>
            <Badge variant="secondary" className="text-xs">
              Live
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmap.columns
            ?.sort((a: any, b: any) => a.order - b.order)
            ?.map((column: any) => (
              <div
                key={column.id}
                className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="text-lg font-semibold text-foreground">{column.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{column.action_items?.length || 0} features</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {column.action_items?.map((feature: RoadmapActionItem) => (
                    <div
                      key={feature.id}
                      className="group p-4 bg-muted/30 border border-border/30 rounded-lg hover:bg-muted/50 hover:border-border/50 transition-all duration-200 cursor-pointer"
                    >
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {feature.title}
                        </h4>

                        {feature.feature_tags && feature.feature_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {feature.feature_tags.map((featureTag: RoadmapActionItemTag) => (
                              <Badge
                                key={featureTag.tag.id}
                                variant="outline"
                                className="text-xs px-2 py-1 bg-background/50"
                              >
                                {featureTag.tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          {feature.created_at && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(feature.created_at).toLocaleDateString()}</span>
                            </div>
                          )}

                          {/* Vote Count and Button */}
                          <div className="flex items-center gap-2 text-xs">
                            <Button
                              size="sm"
                              variant="ghost"
                              className={cn(
                                'h-6 w-6 p-0 transition-all duration-200',
                                votedItems.has(feature.id)
                                  ? 'bg-primary/20 text-primary'
                                  : 'hover:bg-primary/10 hover:text-primary'
                              )}
                              onClick={(e) => handleUpvote(feature.id, e)}
                              disabled={votingItems.has(feature.id)}
                            >
                              <ThumbsUp
                                className={cn(
                                  'h-3 w-3',
                                  votedItems.has(feature.id) && 'text-primary fill-primary'
                                )}
                              />
                            </Button>
                            <span
                              className={cn(
                                'font-medium min-w-[16px] text-center',
                                votedItems.has(feature.id)
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {feature.vote_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!column.action_items || column.action_items.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="h-8 w-8 opacity-50" />
                      </div>
                      <p className="text-sm font-medium">No features yet</p>
                      <p className="text-xs mt-1">Features will appear here when added</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <Link
              to="/"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Reflect
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            This roadmap is automatically updated as we make progress
          </p>
        </div>
      </div>
    </div>
  )
}
