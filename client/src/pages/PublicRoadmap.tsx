import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { roadmapApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { MapPin, ArrowLeft, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PublicRoadmap() {
  const { publicSlug, subdomain } = useParams<{ publicSlug?: string; subdomain?: string }>()

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border/50">
                  <CardHeader className="pb-4">
                    <SkeletonLoader className="w-32 h-6" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <SkeletonLoader key={j} className="w-full h-20" />
                    ))}
                  </CardContent>
                </Card>
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
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Link>
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

        {/* Roadmap Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmap.columns?.map((column) => (
            <Card
              key={column.id}
              className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: column.color }}
                  />
                  <CardTitle className="text-lg">{column.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="capitalize">{column.status}</span>
                  <span>•</span>
                  <span>{column.features?.length || 0} features</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {column.features?.map((feature) => (
                  <div
                    key={feature.id}
                    className="p-4 border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>

                      {feature.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {feature.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {feature.feature_tags?.map((featureTag) => (
                            <Badge
                              key={featureTag.tag.id}
                              variant="outline"
                              className="text-xs px-2 py-1"
                            >
                              {featureTag.tag.name}
                            </Badge>
                          ))}
                        </div>

                        {feature.created_at && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(feature.created_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {(!column.features || column.features.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MapPin className="h-6 w-6 opacity-50" />
                    </div>
                    <p className="text-sm">No features yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
