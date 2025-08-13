import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
// CORRECTED: Import the real widgetApi
import { widgetApi } from '@/lib/api/widget'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WidgetCard } from '@/components/widgets/WidgetCard'
import { LanguageSupportBanner } from '@/components/widgets/LanguageSupportBanner'
import { FreeTierAlert } from '@/components/widgets/FreeTierAlert'
import { Skeleton } from '@/components/ui/skeleton'
import { PageLoading } from '@/components/common/LoadingSpinner'
import type { Widget } from '@/types'

export function Widgets() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const { currentProject, isLoading: isContextLoading } = useAppContext()

  const { data: widgets, isLoading: isLoadingWidgets } = useQuery({
    queryKey: ['widgets', currentProject?.id],
    // This now calls the real API
    queryFn: () => widgetApi.getByProject(currentProject!.id),
    enabled: !!currentProject,
  })

  const deleteMutation = useMutation({
    // This now calls the real API
    mutationFn: (widgetId: string) => widgetApi.delete(widgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets', currentProject?.id] })
    },
    onError: (error) => {
      console.error('Failed to delete widget:', error)
      alert(`Error: ${error.message}`)
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ widgetId, isActive }: { widgetId: string; isActive: boolean }) => {
      // The API call is the same: activate if inactive, deactivate if active.
      return isActive ? widgetApi.deactivate(widgetId) : widgetApi.activate(widgetId)
    },
    // This function runs BEFORE the mutation
    onMutate: async (variables) => {
      const { widgetId } = variables
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['widgets', currentProject?.id] })

      // 2. Snapshot the previous value
      const previousWidgets = queryClient.getQueryData<Widget[]>(['widgets', currentProject?.id])

      // 3. Optimistically update to the new value
      queryClient.setQueryData<Widget[]>(
        ['widgets', currentProject?.id],
        (old) =>
          old?.map((widget) =>
            widget.id === widgetId ? { ...widget, is_active: !widget.is_active } : widget
          ) || []
      )

      // 4. Return a context object with the snapshotted value
      return { previousWidgets }
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context?.previousWidgets) {
        queryClient.setQueryData(['widgets', currentProject?.id], context.previousWidgets)
      }
      console.error('Failed to update widget status:', err)
      alert(`Error updating widget status. Please try again.`)
    },
    // Always refetch after the mutation is settled to ensure data consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets', currentProject?.id] })
    },
  })

  const handleStatusChange = (widgetId: string, isActive: boolean) => {
    updateStatusMutation.mutate({ widgetId, isActive })
  }

  const filteredWidgets =
    widgets?.filter((widget) => widget.name.toLowerCase().includes(searchQuery.toLowerCase())) || []

  const handleCreateWidget = () => {
    navigate('/widgets/new')
  }

  const handleDeleteWidget = (widgetId: string) => {
    if (window.confirm('Are you sure you want to delete this widget?')) {
      deleteMutation.mutate(widgetId)
    }
  }

  const isLoading = isContextLoading || isLoadingWidgets

  if (isLoading) {
    return <PageLoading />
  }

  if (!currentProject) {
    return <div className="text-center p-8">Please select a project to view widgets.</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your widgets</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage feedback widgets for project: <strong>{currentProject.name}</strong>
        </p>
      </div>

      <Button onClick={handleCreateWidget} size="lg" className="gap-2">
        <Plus className="h-5 w-5" />
        Create Widget
      </Button>

      <LanguageSupportBanner />
      <FreeTierAlert />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search widgets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoadingWidgets ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filteredWidgets.length === 0 ? (
        <EmptyState searchQuery={searchQuery} onCreateWidget={handleCreateWidget} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWidgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              onDelete={() => handleDeleteWidget(widget.id)}
              onStatusChange={() => handleStatusChange(widget.id, widget.is_active)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({
  searchQuery,
  onCreateWidget,
}: {
  searchQuery: string
  onCreateWidget: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-muted/30 rounded-full p-4 mb-4">
        <Plus className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {searchQuery ? 'No widgets found' : 'No widgets yet'}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {searchQuery
          ? `No widgets match "${searchQuery}". Try a different search term.`
          : 'Get started by creating your first widget to collect feedback from your users.'}
      </p>
      {!searchQuery && (
        <Button onClick={onCreateWidget} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Your First Widget
        </Button>
      )}
    </div>
  )
}
