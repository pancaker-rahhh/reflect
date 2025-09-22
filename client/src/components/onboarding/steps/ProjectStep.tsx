import React, { useState, useEffect } from 'react'
import { useOnboarding } from '../../../context/OnboardingContext'
import { FolderPlus } from 'lucide-react'
import { projectApi, onboardingApi } from '../../../lib/api'
import { onboardingDataService } from '../../../services/onboardingDataService'

export const ProjectStep: React.FC = () => {
  const { nextStep, markStepCompleted, setProjectId, organizationId, projectId, setOrganizationId, completeOnboarding } =
    useOnboarding()

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

    try {
      if (!organizationId) {
        alert('No organization ID available. Please go back and complete the organization step.')
        return
      }

      let project
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
          } catch (error: any) {
            retryCount++
            if (error?.response?.status === 403 && retryCount < maxRetries) {
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
        localStorage.setItem('onboarding_project_id', project.id)
      }

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
      await completeOnboarding()
    } catch (error: any) {
      console.error('Failed to create project:', error)

      // Check if it's a subscription limit error
      if (
        error?.response?.status === 403 &&
        error?.response?.data?.error === 'Project limit exceeded'
      ) {
        const errorData = error.response.data
        alert(
          `Project limit exceeded!\n\nYou have ${errorData.current_usage} projects (limit: ${errorData.limit})\n\n${errorData.message}`
        )
      } else if (error?.response?.status === 403) {
        // Authorization error - likely organization access issue
        const message =
          error?.response?.data?.detail || error?.message || 'Not authorized for this organization'
        alert(
          `Authorization Error: ${message}\n\nThis might be a temporary issue. Please try again or contact support if the problem persists.`
        )
      } else {
        // Generic error message
        const message =
          error?.response?.data?.detail || error?.message || 'Failed to create project'
        alert(`Error: ${message}`)
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

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your First Project</h2>
        <p className="text-gray-600">Projects help you organize your feedback and features</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            id="projectName"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="My App v2.0"
          />
        </div>

        <div>
          <label
            htmlFor="projectDescription"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description (Optional)
          </label>
          <textarea
            id="projectDescription"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              ? 'Updating Project...'
              : 'Creating Project...'
            : projectId
              ? 'Update Project'
              : 'Create Project'}
        </button>
      </form>
    </div>
  )
}
