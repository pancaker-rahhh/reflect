import React, { useState, useEffect } from 'react'
import { useOnboarding } from '../../../context/OnboardingContext'
import { FolderPlus } from 'lucide-react'
import { projectApi, onboardingApi } from '../../../lib/api'
import { useAppContext } from '../../../context/AppContext'
import { onboardingDataService } from '../../../services/onboardingDataService'
import { useToastNotifications } from '../../../hooks/useToastNotifications'
import type { Project } from '../../../types'

export const ProjectStep: React.FC = () => {
  const {
    markStepCompleted,
    setProjectId,
    organizationId,
    projectId,
    setOrganizationId,
    completeOnboarding,
  } = useOnboarding()
  const { setCurrentProject } = useAppContext()
  const toast = useToastNotifications()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [isCreating, setIsCreating] = useState(false)

  const [isCreatingOrg, setIsCreatingOrg] = useState(false)

  // Auto-create organization if missing (simplified flow has no separate org step)
  useEffect(() => {
    const ensureOrganization = async () => {
      if (organizationId) return
      setIsCreatingOrg(true)
      try {
        const organization = await onboardingApi.autoCreateOrganization()
        onboardingDataService.saveOrganizationData({
          name: organization.name,
          description: '',
          slug: organization.slug,
        })
        setOrganizationId(organization.id)
      } catch (error) {
        console.error('Failed to auto-create organization:', error)
      } finally {
        setIsCreatingOrg(false)
      }
    }

    void ensureOrganization()
  }, [organizationId, setOrganizationId])

  // Populate form data from cached onboarding data at mount
  useEffect(() => {
    const existingData = onboardingDataService.getProjectData()
    if (existingData?.name) {
      setFormData({
        name: existingData.name,
        description: existingData.description || '',
      })
    }
  }, [])

  if (!organizationId || isCreatingOrg) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Setting up your workspace...</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    console.log('ProjectStep: Starting project creation with:', {
      organizationId,
      projectId,
      formData,
    })

    let project: Project | null = null

    try {
      if (!organizationId) {
        toast.showError(
          'No organization ID available. Please go back and complete the organization step.'
        )
        return
      }

      if (formData.name.trim().length < 3) {
        toast.showError('Project name must be at least 3 characters long')
        setIsCreating(false)
        return
      }
      if (projectId) {
        project = await projectApi.updateProject(projectId, {
          name: formData.name,
          description: formData.description,
        })
      } else {
        let retryCount = 0
        const maxRetries = 3

        while (retryCount < maxRetries) {
          try {
            project = await projectApi.createProject({
              name: formData.name,
              description: formData.description,
              organization_id: organizationId,
            })
            break
          } catch (error: unknown) {
            const err = error as { response?: { status?: number } }
            retryCount++
            if (err.response?.status === 403 && retryCount < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount))
              continue
            }
            throw error
          }
        }

        if (!project) {
          throw new Error('Failed to create project after all retry attempts')
        }

        setProjectId(project.id)
        setCurrentProject(project)
        console.log('ProjectStep: Successfully created project:', project)
      }

      if (!project) {
        throw new Error('Project creation failed')
      }

      console.log('ProjectStep: Final project object:', project)

      // Save project data for review step
      onboardingDataService.saveProjectData({
        name: formData.name,
        description: formData.description,
        type: 'web app',
        visibility: 'private',
      })

      await onboardingApi.update({
        has_created_project: true,
        current_step: 'project',
        steps_completed: {
          project: true,
        },
      })

      markStepCompleted('project')
      console.log('ProjectStep: About to complete onboarding with project:', project.id)

      try {
        await completeOnboarding()
        console.log('ProjectStep: Onboarding completed successfully!')
      } catch (onboardingError) {
        console.error('ProjectStep: Onboarding completion failed:', onboardingError)
        // Don't throw here - let the outer catch handle it
        throw onboardingError
      }
    } catch (error: unknown) {
      console.error('Failed to create/update project:', error)

      // If onboarding completion failed but project was created, we need special handling
      if (project && project.id) {
        console.warn('Project was created successfully, but onboarding completion failed')
        toast.showError(
          'Project created successfully, but there was an issue completing setup. Please try clicking the button again.'
        )
        // Don't reset projectId here - the project actually exists
        return
      }

      // Check if it's a subscription limit error
      const err = error as {
        response?: {
          status?: number
          data?: {
            error?: string
            current_usage?: number
            limit?: number
            message?: string
            detail?: string
          }
        }
        message?: string
      }
      if (err.response?.status === 403 && err.response?.data?.error === 'Project limit exceeded') {
        const errorData = err.response.data!
        toast.showError(
          `Project limit exceeded! You have ${errorData.current_usage} projects (limit: ${errorData.limit}). ${errorData.message}`
        )
      } else if (err.response?.status === 403) {
        // Authorization error - likely organization access issue
        const message =
          err.response?.data?.detail || err.message || 'Not authorized for this organization'
        toast.showError(
          `Authorization Error: ${message}. This might be a temporary issue. Please try again or contact support if the problem persists.`
        )
      } else {
        // Generic error message
        const message = err.response?.data?.detail || err.message || 'Failed to create project'
        toast.showError(`Error: ${message}`)

        // Log detailed error information for debugging
        console.error('Project creation error details:', {
          error: err,
          organizationId,
          projectId,
          formData,
          response: err.response,
        })
      }
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <FolderPlus className="w-8 h-8 text-indigo-600" />
        </div>

        <h2 className="text-2xl font-bold mb-2">Create Your First Project</h2>
        <p>Projects help you organize your feedback and features</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="projectName" className="block text-sm font-medium mb-2">
            Project Name *
          </label>
          <input
            type="text"
            id="projectName"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-background"
            placeholder="My App v2.0 (minimum 3 characters)"
          />
          {formData.name.trim().length > 0 && formData.name.trim().length < 3 && (
            <p className="text-sm text-destructive">
              Project name must be at least 3 characters long
            </p>
          )}
        </div>

        <div>
          <label htmlFor="projectDescription" className="block text-sm font-medium mb-2">
            Description (Optional)
          </label>
          <textarea
            id="projectDescription"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-background"
            placeholder="Describe what this project is about"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What&rsquo;s next?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Create feedback widgets to collect user input</li>
            <li>• Analyze feedback trends and insights</li>
            <li>• Track feature requests and bugs</li>
            <li>• Build your product roadmap</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isCreating || !formData.name}
          className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating
            ? projectId
              ? 'Completing Setup...'
              : 'Creating Project...'
            : projectId
              ? 'Complete Setup'
              : 'Create Project'}
        </button>
      </form>
    </div>
  )
}
