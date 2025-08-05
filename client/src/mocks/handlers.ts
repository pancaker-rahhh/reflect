import { http, HttpResponse } from 'msw'
import { mockData } from './data'

const API_BASE_URL = '/api'

export const handlers = [
  // Auth endpoints
  http.get(`${API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json(mockData.currentUser)
  }),

  // Workspace endpoints
  http.get(`${API_BASE_URL}/workspaces`, () => {
    return HttpResponse.json(mockData.workspaces)
  }),

  http.get(`${API_BASE_URL}/workspaces/:id`, ({ params }) => {
    const workspace = mockData.workspaces.find(w => w.id === params.id)
    return workspace 
      ? HttpResponse.json(workspace)
      : new HttpResponse(null, { status: 404 })
  }),

  // Project endpoints
  http.get(`${API_BASE_URL}/projects`, () => {
    return HttpResponse.json(mockData.projects)
  }),

  http.get(`${API_BASE_URL}/projects/:id`, ({ params }) => {
    const project = mockData.projects.find(p => p.id === params.id)
    return project
      ? HttpResponse.json(project)
      : new HttpResponse(null, { status: 404 })
  }),

  // Widget endpoints
  http.get(`${API_BASE_URL}/widgets`, () => {
    return HttpResponse.json(mockData.widgets)
  }),

  http.post(`${API_BASE_URL}/widgets`, async ({ request }) => {
    const widget = await request.json()
    const newWidget = {
      ...widget,
      id: `widget-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    mockData.widgets.push(newWidget)
    return HttpResponse.json(newWidget, { status: 201 })
  }),

  // Dashboard endpoints
  http.get(`${API_BASE_URL}/dashboard/metrics`, () => {
    return HttpResponse.json(mockData.dashboardMetrics)
  }),

  http.get(`${API_BASE_URL}/dashboard/activity`, () => {
    return HttpResponse.json(mockData.recentActivity)
  }),

  // Feedback endpoints
  http.get(`${API_BASE_URL}/feedback`, ({ request }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    
    let feedback = [...mockData.feedback]
    if (type) {
      feedback = feedback.filter(f => f.type === type)
    }
    
    return HttpResponse.json(feedback)
  }),

  // Reviews endpoints
  http.get(`${API_BASE_URL}/reviews`, () => {
    const reviews = mockData.feedback.filter(f => f.type === 'review')
    return HttpResponse.json(reviews)
  }),

  // Roadmap endpoints
  http.get(`${API_BASE_URL}/roadmaps/:projectId`, ({ params }) => {
    const roadmap = mockData.roadmaps.find(r => r.projectId === params.projectId)
    return roadmap
      ? HttpResponse.json(roadmap)
      : new HttpResponse(null, { status: 404 })
  }),

  // Settings endpoints
  http.get(`${API_BASE_URL}/settings/notifications`, () => {
    return HttpResponse.json(mockData.notificationSettings)
  }),

  http.put(`${API_BASE_URL}/settings/notifications`, async ({ request }) => {
    const settings = await request.json()
    Object.assign(mockData.notificationSettings, settings)
    return HttpResponse.json(mockData.notificationSettings)
  })
]