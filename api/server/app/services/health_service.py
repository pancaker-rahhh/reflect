from api.server.app.core.settings import get_settings
from app.schemas.health import HealthCheckResponse


class HealthService:
    def get_health_status(self) -> HealthCheckResponse:
        settings = get_settings()
        
        return HealthCheckResponse(
            status="healthy",
            service=settings.APP_NAME,
            version=settings.APP_VERSION,
        )


health_service = HealthService()