from fastapi import APIRouter

from app.router.v1.health_router import health_router
from app.router.v1.user_router import user_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router)
api_router.include_router(user_router)

# Future routers will be added here:
# api_router.include_router(projects_router)