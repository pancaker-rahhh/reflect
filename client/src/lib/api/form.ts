import { apiClient } from '@/services/apiClient'
import type { FormV2, FormCreate, FormUpdate, FormFieldV2, FormFieldCreate } from '@/types'

export const formApi = {
  list(projectId?: string): Promise<FormV2[]> {
    const url = projectId ? `/api/v2/forms/?project_id=${projectId}` : '/api/v2/forms/'
    return apiClient.get<FormV2[]>(url)
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

  addField(formId: string, field: FormFieldCreate): Promise<FormFieldV2> {
    return apiClient.post<FormFieldV2>(`/api/v2/forms/${formId}/fields`, field)
  },

  updateField(
    formId: string,
    fieldId: string,
    field: Partial<FormFieldCreate>
  ): Promise<FormFieldV2> {
    return apiClient.put<FormFieldV2>(`/api/v2/forms/${formId}/fields/${fieldId}`, field)
  },

  deleteField(formId: string, fieldId: string): Promise<void> {
    return apiClient.delete<void>(`/api/v2/forms/${formId}/fields/${fieldId}`)
  },

  submitResponse(
    publicLink: string,
    data: {
      answers: Record<string, any>
      submitter_email?: string
      submitter_name?: string
    }
  ): Promise<{ message: string; success: boolean }> {
    return apiClient.post<{ message: string; success: boolean }>(
      `/api/v2/forms/public/${publicLink}/submit`,
      data
    )
  },
}
