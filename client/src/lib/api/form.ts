import { apiClient } from '@/services/apiClient'
import type {
  FormV2,
  FormCreate,
  FormUpdate,
  FormFieldV2,
  FormFieldCreate,
  FormResponseV2ListResponse,
  FormMetrics,
} from '@/types'

export const formApi = {
  list(projectId?: string): Promise<FormV2[]> {
    const params = projectId ? `?project_id=${projectId}` : ''
    return apiClient.get<FormV2[]>(`/api/v2/forms/${params}`)
  },

  get(formId: string): Promise<FormV2> {
    return apiClient.get<FormV2>(`/api/v2/forms/${formId}`)
  },

  getByPublicLink(publicLink: string): Promise<FormV2> {
    return apiClient.get<FormV2>(`/api/v2/forms/public/${publicLink}`)
  },

  create(data: FormCreate): Promise<FormV2> {
    return apiClient.post<FormV2>('/api/v2/forms/', data)
  },

  update(formId: string, data: FormUpdate): Promise<FormV2> {
    return apiClient.put<FormV2>(`/api/v2/forms/${formId}`, data)
  },

  delete(formId: string): Promise<void> {
    return apiClient.delete<void>(`/api/v2/forms/${formId}`)
  },

  createField(formId: string, field: FormFieldCreate): Promise<FormFieldV2> {
    return apiClient.post<FormFieldV2>(`/api/v2/forms/${formId}/fields`, field)
  },

  updateField(formId: string, fieldId: string, field: Partial<FormFieldV2>): Promise<FormFieldV2> {
    return apiClient.put<FormFieldV2>(`/api/v2/forms/${formId}/fields/${fieldId}`, field)
  },

  deleteField(formId: string, fieldId: string): Promise<void> {
    return apiClient.delete<void>(`/api/v2/forms/${formId}/fields/${fieldId}`)
  },

  submitResponse(
    publicLink: string,
    data: { answers: Record<string, any> }
  ): Promise<{ message: string; success: boolean }> {
    return apiClient.post<{ message: string; success: boolean }>(
      `/api/v2/forms/public/${publicLink}/submit`,
      data
    )
  },

  getResponses(
    formId: string,
    skip: number = 0,
    limit: number = 100
  ): Promise<FormResponseV2ListResponse> {
    const params = new URLSearchParams()
    if (skip > 0) params.append('skip', skip.toString())
    if (limit !== 100) params.append('limit', limit.toString())
    const queryString = params.toString()
    const url = `/api/v2/forms/${formId}/responses${queryString ? `?${queryString}` : ''}`
    return apiClient.get<FormResponseV2ListResponse>(url)
  },

  getMetrics(formId: string, timeRange: string = 'all'): Promise<FormMetrics> {
    return apiClient.get<FormMetrics>(`/api/v2/forms/${formId}/metrics?timeRange=${timeRange}`)
  },
}
