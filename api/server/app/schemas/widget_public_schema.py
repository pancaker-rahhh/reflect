from pydantic import BaseModel
from typing import List, Dict, Any
from uuid import UUID


class WidgetPublicRead(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    configuration: Dict[str, Any]
    theme_configuration: Dict[str, Any]
    targeting_rules: List[Dict[str, Any]]

    class Config:
        from_attributes = True
