import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, MagnifyingGlass, GridFour, List, ChartBar } from 'phosphor-react'
import { formApi } from '@/lib/api/form'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormCard } from '@/components/forms/FormCard'
import { FreeTierAlert } from '@/components/widgets/SubscriptionMessagesBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { PageLoading } from '@/components/common/LoadingSpinner'
import { DeleteConfirmationModal } from '@/components/common/ConfirmationModal'
import { useToastNotifications } from '@/hooks/useToastNotifications'
import { config } from '@/config'
import type { FormV2 } from '@/types'

export function Forms() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToastNotifications()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    formId: string | null
    formName: string
  }>({
    isOpen: false,
    formId: null,
    formName: '',
  })
  const { currentProject, currentOrganization, isLoading: isContextLoading } = useAppContext()

  const { data: forms, isLoading: isLoadingForms } = useQuery({
    queryKey: ['forms', currentProject?.id],
    queryFn: () => formApi.list(currentProject?.id),
    enabled: !!currentProject?.id,
  })

  const deleteMutation = useMutation({
    mutationFn: (formId: string) => formApi.delete(formId),
    onMutate: async (formId) => {
      await queryClient.cancelQueries({ queryKey: ['forms', currentProject?.id] })

      const previousForms = queryClient.getQueryData(['forms', currentProject?.id])

      queryClient.setQueryData(
        ['forms', currentProject?.id],
        (old: FormV2[] | undefined) => old?.filter((form: FormV2) => form.id !== formId) || []
      )

      return { previousForms }
    },
    onError: (err, _formId, context) => {
      if (context?.previousForms) {
        queryClient.setQueryData(['forms', currentProject?.id], context.previousForms)
      }
      console.error('Failed to delete form:', err)
      const message = (err as { message?: string })?.message || 'Failed to delete form'
      toast.showError(message, 'Delete Failed')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms', currentProject?.id] })
      queryClient.invalidateQueries({ queryKey: ['subscription-usage', currentOrganization?.id] })
      toast.showSuccess('Form deleted successfully', 'Deleted')
    },
  })

  const filteredForms =
    forms?.filter((form) => form.name.toLowerCase().includes(searchQuery.toLowerCase())) || []

  const activeForms = filteredForms.filter((form) => form.is_active)

  const handleCreateForm = () => {
    navigate('/app/forms/new')
  }

  const handleDelete = (formId: string, formName: string) => {
    setDeleteModal({ isOpen: true, formId, formName })
  }

  const handleShare = (form: FormV2) => {
    const publicUrl = `${config.frontendUrl}/public/forms/${form.public_link}`
    navigator.clipboard.writeText(publicUrl)
    toast.showSuccess('Form link copied to clipboard!', 'Link Copied')
  }

  const handleViewResponses = (form: FormV2) => {
    navigate(`/app/forms/${form.id}/responses`)
  }

  const confirmDelete = () => {
    if (deleteModal.formId) {
      deleteMutation.mutate(deleteModal.formId)
      setDeleteModal({ isOpen: false, formId: null, formName: '' })
    }
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, formId: null, formName: '' })
  }

  const isLoading = isContextLoading || isLoadingForms

  if (isLoading) {
    return <PageLoading />
  }

  if (!currentProject) {
    return <div className="text-center p-8">Please select a project to view forms.</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your forms</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage forms to collect feedback for project:{' '}
          <strong>{currentProject.name}</strong>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Button onClick={handleCreateForm} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create Form
        </Button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ChartBar className="h-4 w-4" />
            <span>{activeForms.length} active</span>
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none border-0"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <GridFour className="h-4 w-4" />
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

      <FreeTierAlert />

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search forms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoadingForms ? (
        <div
          className={`grid gap-6 ${
            viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          }`}
        >
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className={viewMode === 'grid' ? 'h-48' : 'h-32'} />
          ))}
        </div>
      ) : filteredForms.length === 0 ? (
        <EmptyState searchQuery={searchQuery} onCreateForm={handleCreateForm} />
      ) : (
        <div className="space-y-8">
          {/* Active Forms Section */}
          {activeForms.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">Created Forms</h2>
              </div>
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                }`}
              >
                {activeForms.map((form) => (
                  <FormCard
                    key={form.id}
                    form={form}
                    viewMode={viewMode}
                    onDelete={() => handleDelete(form.id, form.name)}
                    onShare={() => handleShare(form)}
                    onEdit={() => navigate(`/app/forms/${form.id}/edit`)}
                    onViewResponses={() => handleViewResponses(form)}
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
        itemName={deleteModal.formName}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

function EmptyState({
  searchQuery,
  onCreateForm,
}: {
  searchQuery: string
  onCreateForm: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-muted/30 rounded-full p-4 mb-4">
        <Plus className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {searchQuery ? 'No forms found' : 'No forms yet'}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {searchQuery
          ? `No forms match "${searchQuery}". Try a different search term.`
          : 'Get started by creating your first form to collect feedback from your users.'}
      </p>
      {!searchQuery && (
        <Button onClick={onCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Your First Form
        </Button>
      )}
    </div>
  )
}
