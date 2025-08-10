from fastapi import APIRouter

from app.router.v1 import (
    project_router,
    health_router,
    workspace_router,
    widget_router,
    public_router,
    form_router,
    feedback_router,
    roadmap_router,
)

api_router = APIRouter(prefix='/api/v1')
api_router.include_router(health_router.health_router)
api_router.include_router(feedback_router.feedback_router)
api_router.include_router(form_router.form_router)
api_router.include_router(project_router.router, prefix='/projects', tags=['Projects'])
api_router.include_router(
    workspace_router.router, prefix='/workspaces', tags=['Workspaces']
)
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
