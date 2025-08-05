from datetime import datetime
from app.core.config import Settings, get_settings
from app.models.schemas.other_schemas import HealthResponse
from app.services.health_service import get_system_health
from fastapi import APIRouter, Depends

api_router = APIRouter()


@api_router.get('/health', tags=['Health'], response_model=HealthResponse)
async def health_check(settings: Settings = Depends(get_settings)):
    health_info = get_system_health()
    return {
        'status': health_info['status'],
        'version': settings.APP_VERSION,
        'timestamp': datetime.now().isoformat(),
        'environment': settings.ENV,
    }
