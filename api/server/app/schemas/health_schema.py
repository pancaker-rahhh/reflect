from typing import Optional, List
from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    status: str = Field(...)
    service: str = Field(...)
    version: str = Field(...)

    class Config:
        pass


class RedisHealthInfo(BaseModel):
    connected: bool = Field(...)
    version: Optional[str] = None
    uptime_seconds: Optional[int] = None
    clients_connected: Optional[int] = None
    memory_used: Optional[str] = None


class WorkerHealthResponse(BaseModel):
    status: str = Field(...)
    message: str = Field(...)
    worker_connected: bool = Field(...)
    redis: RedisHealthInfo = Field(...)
    queue_size: int = Field(...)
    test_task_id: Optional[str] = None
    errors: Optional[List[str]] = None
