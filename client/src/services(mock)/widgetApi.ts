import { request } from './apiClient'
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

export const widgetApi = {
  getByProject(projectId: string): Promise<Widget[]> {
    return request<Widget[]>(`/projects/${projectId}/widgets`)
  },

  create(projectId: string, formData: WidgetFormData): Promise<Widget> {
    const payload = transformDataToPayload(formData)
    return request<Widget>(`/projects/${projectId}/widgets`, {
      method: 'POST',
      body: JSON.stringify({ ...payload, project_id: projectId }),
    })
  },

  update(widgetId: string, data: Partial<Widget>): Promise<Widget> {
    return request<Widget>(`/widgets/${widgetId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete(widgetId: string): Promise<void> {
    return request<void>(`/widgets/${widgetId}`, {
      method: 'DELETE',
    })
  },

  activate(widgetId: string): Promise<Widget> {
    return request<Widget>(`/widgets/${widgetId}/activate`, { method: 'POST' })
  },

  deactivate(widgetId: string): Promise<Widget> {
    return request<Widget>(`/widgets/${widgetId}/deactivate`, { method: 'POST' })
  },
}
