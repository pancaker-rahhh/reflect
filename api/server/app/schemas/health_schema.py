from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    status: str = Field(...)
    service: str = Field(...)
    version: str = Field(...)

    class Config:
        json_schema_extra = {
            'description': 'Provides health status information about the service.',
            'example': {
                'status': 'healthy',
                'service': 'Reflect API',
                'version': '0.1.0',
            },
        }
