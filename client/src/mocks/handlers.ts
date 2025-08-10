import { http, HttpResponse } from 'msw'
import { mockData } from './data'

const API_BASE_URL = '/api'

export const handlers = [
  // Auth endpoints
  http.get(`${API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json(mockData.currentUser)
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
      feedback = feedback.filter((f) => f.type === type)
    }

    return HttpResponse.json(feedback)
  }),

  // Reviews endpoints
  http.get(`${API_BASE_URL}/reviews`, () => {
    const reviews = mockData.feedback.filter((f) => f.type === 'review')
    return HttpResponse.json(reviews)
  }),

  // Roadmap endpoints
  http.get(`${API_BASE_URL}/roadmaps/:projectId`, ({ params }) => {
    const roadmap = mockData.roadmaps.find((r) => r.projectId === params.projectId)
    return roadmap ? HttpResponse.json(roadmap) : new HttpResponse(null, { status: 404 })
  }),

  // Settings endpoints
  http.get(`${API_BASE_URL}/settings/notifications`, () => {
    return HttpResponse.json(mockData.notificationSettings)
  }),

  http.put(`${API_BASE_URL}/settings/notifications`, async ({ request }) => {
    const settings = await request.json()
    Object.assign(mockData.notificationSettings, settings)
    return HttpResponse.json(mockData.notificationSettings)
  }),
]
