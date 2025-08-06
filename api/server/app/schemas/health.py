from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    status: str = Field(..., description="Health status of the service", example="healthy")
    service: str = Field(..., description="Name of the service", example="Reflect API")
    version: str = Field(..., description="Version of the service", example="0.1.0")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "service": "Reflect API",
                "version": "0.1.0"
            }
        }