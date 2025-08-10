import { apiClient } from '../client'
import type { Widget } from '@/types'
import type { WidgetFormData } from '@/pages/WidgetCreate'

function transformDataToPayload(data: WidgetFormData) {
  return {
    name: data.name,
    widget_type: data.primaryType,
    position: data.appearance.position,
    configuration: {
      modules: data.modules,
      content: data.content,
    },
    theme_configuration: {
      ...data.appearance.colors,
      theme_name: data.appearance.theme,
      show_branding: data.appearance.showBranding,
    },
    targeting_rules: [
      {
        type: 'trigger',
        details: { type: data.behavior.triggerType, delay: data.behavior.triggerDelay },
      },
      { type: 'url', details: data.behavior.urlTargeting },
      { type: 'device', details: data.behavior.deviceTypes },
    ],
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
  is_active?: boolean
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
      project_id: projectId 
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

  activate(widgetId: string): Promise<Widget> {
    return apiClient.post<Widget>(`/widgets/${widgetId}/activate`)
  },

  deactivate(widgetId: string): Promise<Widget> {
    return apiClient.post<Widget>(`/widgets/${widgetId}/deactivate`)
  },

  getPublicWidget(publicKey: string): Promise<Widget> {
    return apiClient.get<Widget>(`/public/widgets/${publicKey}`)
  }
}