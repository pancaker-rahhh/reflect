from fastapi import APIRouter

from app.router.v1 import  project_router, health_router, workspace_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router.health_router)
api_router.include_router(
    project_router.router,
    prefix="/projects",
    tags=["Projects"]
)
api_router.include_router(
    workspace_router.router,
    prefix="/workspaces",
    tags=["Workspaces"]
)