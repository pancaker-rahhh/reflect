import { apiClient } from '../client'
import type { Widget } from '@/types'
import type { WidgetFormData } from '@/pages/WidgetCreate'

function transformDataToPayload(data: WidgetFormData) {
  return {
    name: data.name,
    widget_type: data.primaryType || 'FEEDBACK', // Default to FEEDBACK if primaryType is empty
    position: data.appearance.position,
    configuration: {
      modules: data.modules,
      content: data.content,
      // Store type-specific settings
      typeSpecificSettings: {
        reviewPrompt: data.content?.reviewPrompt,
        requireReviewText: data.content?.requireReviewText,
        requireStepsToReproduce: data.content?.requireStepsToReproduce,
        requireUseCase: data.content?.requireUseCase,
      },
    },
    theme_configuration: {
      ...data.appearance.colors,
      theme_name: data.appearance.theme,
      show_branding: data.appearance.showBranding,
    },
    targeting_rules: [],
  }
}

export interface WidgetCreateRequest {
  name: string
  widget_type: string
  project_id: string
  position: string
  configuration: Record<string, any>
  theme_configuration: Record<string, any>
  targeting_rules: Array<Record<string, any>>
}

export interface WidgetUpdateRequest {
  name?: string
  widget_type?: string
  position?: string
  configuration?: Record<string, any>
  theme_configuration?: Record<string, any>
  targeting_rules?: Array<Record<string, any>>
}

export const widgetApi = {
  getByProject(projectId: string): Promise<Widget[]> {
    return apiClient.get<Widget[]>(`/projects/${projectId}/widgets`)
  },

  getWidget(id: string): Promise<Widget> {
    return apiClient.get<Widget>(`/widgets/${id}`)
  },

  create(projectId: string, formData: WidgetFormData): Promise<Widget> {
    const payload = transformDataToPayload(formData)
    return apiClient.post<Widget>(`/projects/${projectId}/widgets`, {
      ...payload,
      project_id: projectId,
    })
  },

  createWidget(data: WidgetCreateRequest): Promise<Widget> {
    return apiClient.post<Widget>(`/projects/${data.project_id}/widgets`, data)
  },

  update(widgetId: string, data: Partial<Widget>): Promise<Widget> {
    return apiClient.put<Widget>(`/widgets/${widgetId}`, data)
  },

  updateWidget(id: string, data: WidgetUpdateRequest): Promise<Widget> {
    return apiClient.put<Widget>(`/widgets/${id}`, data)
  },

  delete(widgetId: string): Promise<void> {
    return apiClient.delete<void>(`/widgets/${widgetId}`)
  },

  deleteWidget(id: string): Promise<void> {
    return apiClient.delete<void>(`/widgets/${id}`)
  },

  getPublicWidget(publicKey: string): Promise<Widget> {
    return apiClient.get<Widget>(`/public/widgets/${publicKey}`)
  },

  getMetrics(widgetId: string, timeRange: string = 'all'): Promise<any> {
    return apiClient.get<any>(`/widgets/${widgetId}/metrics?timeRange=${timeRange}`)
  },
}
