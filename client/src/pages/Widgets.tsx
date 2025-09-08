import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Grid3X3, List, BarChart3 } from 'lucide-react'
import { widgetApi } from '@/lib/api/widget'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WidgetCard } from '@/components/widgets/WidgetCard'
import { LanguageSupportBanner } from '@/components/widgets/LanguageSupportBanner'
import { FreeTierAlert } from '@/components/widgets/FreeTierAlert'
import { Skeleton } from '@/components/ui/skeleton'
import { PageLoading } from '@/components/common/LoadingSpinner'
import { DeleteConfirmationModal } from '@/components/common/ConfirmationModal'
import { UsageAwareButton } from '@/components/common/UsageAwareButton'
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
  const { currentProject, isLoading: isContextLoading } = useAppContext()

  const { data: widgets, isLoading: isLoadingWidgets } = useQuery({
    queryKey: ['widgets', currentProject?.id],

    queryFn: () => widgetApi.getByProject(currentProject!.id),
    enabled: !!currentProject,
  })

  const deleteMutation = useMutation({
    mutationFn: (widgetId: string) => widgetApi.delete(widgetId),

    onMutate: async (widgetId) => {
      await queryClient.cancelQueries({ queryKey: ['widgets', currentProject?.id] })

      const previousWidgets = queryClient.getQueryData(['widgets', currentProject?.id])

      queryClient.setQueryData(
        ['widgets', currentProject?.id],
        (old: Widget[] | undefined) => old?.filter((widget: Widget) => widget.id !== widgetId) || []
      )

      return { previousWidgets }
    },

    onError: (err, _widgetId, context) => {
      if (context?.previousWidgets) {
        queryClient.setQueryData(['widgets', currentProject?.id], context.previousWidgets)
      }
      console.error('Failed to delete widget:', err)
      const message = (err as { message?: string })?.message || 'Failed to delete widget'
      alert(`Error: ${message}`)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets', currentProject?.id] })
    },
  })

  const filteredWidgets =
    widgets?.filter((widget) => widget.name.toLowerCase().includes(searchQuery.toLowerCase())) || []

  const activeWidgets = filteredWidgets.filter((widget) => widget.status === 'active')

  const handleCreateWidget = () => {
    navigate('/app/widgets/new')
  }

  const handleDeleteWidget = (widgetId: string, widgetName: string) => {
    setDeleteModal({ isOpen: true, widgetId, widgetName })
  }

  const handleEditWidget = (widgetId: string) => {
    navigate(`/widgets/${widgetId}/edit`)
  }

  const handleGetCode = (widgetId: string) => {
    navigate(`/widgets/${widgetId}/get-code`)
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
        <UsageAwareButton
          resourceType="widgets"
          action={handleCreateWidget}
          size="lg"
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Widget
        </UsageAwareButton>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span>{activeWidgets.length} active</span>
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
                <h2 className="text-xl font-semibold text-gray-900">Created Widgets</h2>
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
                    onEdit={() => handleEditWidget(widget.id)}
                    onGetCode={() => handleGetCode(widget.id)}
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
        <UsageAwareButton resourceType="widgets" action={onCreateWidget} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Your First Widget
        </UsageAwareButton>
      )}
    </div>
  )
}
