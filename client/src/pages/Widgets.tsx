import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Grid3X3, List, BarChart3, AlertTriangle } from 'lucide-react'
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
import { DeleteConfirmationModal, ConfirmationModal } from '@/components/common/ConfirmationModal'
import type { Widget } from '@/types'

export function Widgets() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    widgetId: string | null
    widgetName: string
  }>({
    isOpen: false,
    widgetId: null,
    widgetName: '',
  })
  const [activeWidgetModal, setActiveWidgetModal] = useState<{
    isOpen: boolean
    widgetName: string
  }>({
    isOpen: false,
    widgetName: '',
  })
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
    onError: (error: unknown) => {
      console.error('Failed to delete widget:', error)
      const message = (error as any)?.message || 'Failed to delete widget'
      alert(`Error: ${message}`)
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
    onError: (err, _variables, context) => {
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

  const activeWidgets = filteredWidgets.filter((widget) => widget.is_active)
  const inactiveWidgets = filteredWidgets.filter((widget) => !widget.is_active)

  const handleCreateWidget = () => {
    navigate('/widgets/new')
  }

  const handleDeleteWidget = (widgetId: string, widgetName: string) => {
    // Check if the widget is active before showing delete modal
    const widget = widgets?.find((w) => w.id === widgetId)
    if (widget?.is_active) {
      // Show active widget modal instead of delete modal
      setActiveWidgetModal({ isOpen: true, widgetName })
    } else {
      // Show normal delete confirmation modal
      setDeleteModal({ isOpen: true, widgetId, widgetName })
    }
  }

  const handleEditWidget = (widgetId: string) => {
    navigate(`/widgets/${widgetId}/edit`)
  }

  const confirmDelete = () => {
    if (deleteModal.widgetId) {
      deleteMutation.mutate(deleteModal.widgetId)
      setDeleteModal({ isOpen: false, widgetId: null, widgetName: '' })
    }
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, widgetId: null, widgetName: '' })
  }

  const closeActiveWidgetModal = () => {
    setActiveWidgetModal({ isOpen: false, widgetName: '' })
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

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Button onClick={handleCreateWidget} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create Widget
        </Button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span>
              {activeWidgets.length} active, {inactiveWidgets.length} inactive
            </span>
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none border-0"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none border-0"
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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
        <div
          className={`grid gap-6 ${
            viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          }`}
        >
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className={viewMode === 'grid' ? 'h-48' : 'h-32'} />
          ))}
        </div>
      ) : filteredWidgets.length === 0 ? (
        <EmptyState searchQuery={searchQuery} onCreateWidget={handleCreateWidget} />
      ) : (
        <div className="space-y-8">
          {/* Active Widgets Section */}
          {activeWidgets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-900">Active Widgets</h2>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {activeWidgets.length}
                </span>
              </div>
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                }`}
              >
                {activeWidgets.map((widget) => (
                  <WidgetCard
                    key={widget.id}
                    widget={widget}
                    viewMode={viewMode}
                    onDelete={() => handleDeleteWidget(widget.id, widget.name)}
                    onStatusChange={() => handleStatusChange(widget.id, widget.is_active)}
                    onEdit={() => handleEditWidget(widget.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Widgets Section */}
          {inactiveWidgets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-900">Inactive Widgets</h2>
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {inactiveWidgets.length}
                </span>
              </div>
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                }`}
              >
                {inactiveWidgets.map((widget) => (
                  <WidgetCard
                    key={widget.id}
                    widget={widget}
                    viewMode={viewMode}
                    onDelete={() => handleDeleteWidget(widget.id, widget.name)}
                    onStatusChange={() => handleStatusChange(widget.id, widget.is_active)}
                    onEdit={() => handleEditWidget(widget.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={deleteModal.widgetName}
        isLoading={deleteMutation.isPending}
      />

      {/* Active Widget Modal */}
      <ConfirmationModal
        isOpen={activeWidgetModal.isOpen}
        onClose={closeActiveWidgetModal}
        onConfirm={closeActiveWidgetModal}
        title="Widget is Active"
        description={`"${activeWidgetModal.widgetName}" is currently active and collecting feedback. Please deactivate the widget before deleting.`}
        confirmText="Okay"
        variant="default"
        icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
        showCancelButton={false}
      />
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
