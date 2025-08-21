import { apiClient } from '../client'
import { ApiException } from '../errors'
import type { Roadmap, RoadmapColumn, RoadmapTag, RoadmapFeature } from '@/types'

export interface RoadmapUpdateRequest {
  name?: string
  isPublic?: boolean
  subdomain?: string
  logo_url?: string
}

export interface RoadmapCreateRequest {
  project_id: string
  name: string
  isPublic?: boolean
  subdomain?: string
  logo_url?: string
}

export interface RoadmapColumnCreateRequest {
  roadmap_id: string
  name: string
  status: string
  color: string
  order: number
}

export interface RoadmapColumnUpdateRequest {
  name?: string
  status?: string
  color?: string
  order?: number
}

export interface RoadmapFeatureCreateRequest {
  column_id: string
  title: string
  description?: string
  tag_ids?: string[]
  submitter_name?: string
  submitter_email?: string
}

export interface RoadmapFeatureUpdateRequest {
  title?: string
  description?: string
  columnId?: string
  tagIds?: string[]
  order?: number
  submitterName?: string
  submitterEmail?: string
}

export interface RoadmapTagCreateRequest {
  roadmap_id: string
  name: string
  color: string
}

export interface RoadmapTagUpdateRequest {
  name?: string
  color?: string
}

export interface FeatureOrderUpdateRequest {
  id: string
  order: number
  column_id?: string
}

export const roadmapApi = {
  // Roadmap endpoints
  getByProject: async (projectId: string): Promise<Roadmap | null> => {
    try {
      return await apiClient.get<Roadmap>(`/projects/${projectId}/roadmap`)
    } catch (error) {
      if (error instanceof ApiException && error.status === 404) {
        return null
      }
      throw error
    }
  },

  createRoadmap: async (data: RoadmapCreateRequest): Promise<Roadmap> => {
    return apiClient.post<Roadmap>('/roadmap/roadmaps', data)
  },

  updateRoadmap: async (roadmapId: string, data: RoadmapUpdateRequest): Promise<Roadmap> => {
    return apiClient.put<Roadmap>(`/roadmap/roadmaps/${roadmapId}`, data)
  },

  // Public roadmap access
  getPublicRoadmap: async (publicSlug: string): Promise<Roadmap> => {
    return apiClient.get<Roadmap>(`/public/roadmaps/${publicSlug}`)
  },

  getPublicRoadmapBySubdomain: async (subdomain: string): Promise<Roadmap> => {
    return apiClient.get<Roadmap>(`/public/r/${subdomain}`)
  },

  // Column endpoints
  createColumn: async (data: RoadmapColumnCreateRequest): Promise<RoadmapColumn> => {
    return apiClient.post<RoadmapColumn>('/roadmap/columns', data)
  },

  updateColumn: async (
    columnId: string,
    data: RoadmapColumnUpdateRequest
  ): Promise<RoadmapColumn> => {
    return apiClient.put<RoadmapColumn>(`/roadmap/columns/${columnId}`, data)
  },

  deleteColumn: async (columnId: string): Promise<void> => {
    return apiClient.delete(`/roadmap/columns/${columnId}`)
  },

  // Feature endpoints
  createFeature: async (data: RoadmapFeatureCreateRequest): Promise<RoadmapFeature> => {
    return apiClient.post<RoadmapFeature>('/roadmap/features', data)
  },

  updateFeature: async (
    featureId: string,
    data: RoadmapFeatureUpdateRequest
  ): Promise<RoadmapFeature> => {
    return apiClient.put<RoadmapFeature>(`/roadmap/features/${featureId}`, data)
  },

  deleteFeature: async (featureId: string): Promise<void> => {
    return apiClient.delete(`/roadmap/features/${featureId}`)
  },

  updateFeaturesOrder: async (
    updates: FeatureOrderUpdateRequest[]
  ): Promise<{ status: string }> => {
    return apiClient.put<{ status: string }>('/roadmap/features/order', updates)
  },

  upvoteFeature: async (featureId: string): Promise<RoadmapFeature> => {
    return apiClient.post<RoadmapFeature>(`/public/features/${featureId}/vote`)
  },

  // Tag endpoints
  createTag: async (data: RoadmapTagCreateRequest): Promise<RoadmapTag> => {
    return apiClient.post<RoadmapTag>('/roadmap/tags', data)
  },

  getRoadmapTags: async (roadmapId: string): Promise<RoadmapTag[]> => {
    return apiClient.get<RoadmapTag[]>(`/roadmap/roadmaps/${roadmapId}/tags`)
  },

  getPublicRoadmapTags: async (roadmapId: string): Promise<RoadmapTag[]> => {
    return apiClient.get<RoadmapTag[]>(`/public/roadmaps/${roadmapId}/tags`)
  },

  updateTag: async (tagId: string, data: RoadmapTagUpdateRequest): Promise<RoadmapTag> => {
    return apiClient.put<RoadmapTag>(`/roadmap/tags/${tagId}`, data)
  },

  deleteTag: async (tagId: string): Promise<void> => {
    return apiClient.delete(`/roadmap/tags/${tagId}`)
  },
}
