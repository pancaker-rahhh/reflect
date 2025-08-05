from typing import Optional
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    environment: Optional[str] = None
