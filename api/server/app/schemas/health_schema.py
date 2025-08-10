from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    status: str = Field(...)
    service: str = Field(...)
    version: str = Field(...)

    class Config:
        pass
