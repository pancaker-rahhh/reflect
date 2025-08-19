from fastapi import APIRouter

from app.router.v1 import (
    project_router,
    health_router,
    widget_router,
    public_router,
    form_router,
    feedback_router,
    roadmap_router,
    user_router,
    organization_router,
    onboarding_router,
    invitation_router,
)

api_router = APIRouter(prefix='/api/v1')
api_router.include_router(health_router.health_router)
api_router.include_router(feedback_router.feedback_router)
api_router.include_router(form_router.form_router)
api_router.include_router(user_router.user_router)
api_router.include_router(organization_router.router)
api_router.include_router(project_router.router)
api_router.include_router(onboarding_router.router)
api_router.include_router(invitation_router.router)
api_router.include_router(
    widget_router.project_widgets_router,
    prefix='/projects/{project_id}/widgets',
    tags=['Widgets'],
)
api_router.include_router(
    widget_router.widgets_router, prefix='/widgets', tags=['Widgets']
)
api_router.include_router(
    public_router.public_router, prefix='/public', tags=['Public']
)
api_router.include_router(roadmap_router.router, prefix='/roadmap', tags=['Roadmap'])

api_router.include_router(
    roadmap_router.public_router, prefix='/public', tags=['Public']
)
