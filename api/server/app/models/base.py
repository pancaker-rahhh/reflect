import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import Column, DateTime, Boolean, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import Query

from app.db import Base


class TimeStampMixin:
    @declared_attr
    def created_at(cls) -> Column:
        return Column(
            DateTime(timezone=True),
            nullable=False,
            server_default=func.now(),
            index=True
        )
    
    @declared_attr
    def updated_at(cls) -> Column:
        return Column(
            DateTime(timezone=True),
            nullable=False,
            server_default=func.now(),
            onupdate=func.now(),
            index=True
        )


class SoftDeleteMixin:
    @declared_attr
    def deleted_at(cls) -> Column:
        return Column(
            DateTime(timezone=True),
            nullable=True,
            index=True
        )
    
    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
    
    def soft_delete(self) -> None:
        self.deleted_at = datetime.utcnow()
    
    def restore(self) -> None:
        self.deleted_at = None
    
    @classmethod
    def filter_active(cls, query: Query) -> Query:
        return query.filter(cls.deleted_at.is_(None))


class BaseModel(Base, TimeStampMixin, SoftDeleteMixin):
    __abstract__ = True
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        index=True
    )
    
    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(id={self.id})>"
    
    def to_dict(self, exclude: Optional[set] = None) -> dict[str, Any]:
        exclude = exclude or set()
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
            if column.name not in exclude
        }
    
    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "BaseModel":
        return cls(**{
            key: value
            for key, value in data.items()
            if hasattr(cls, key)
        })


class BaseModelWithoutSoftDelete(Base, TimeStampMixin):
    __abstract__ = True
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        index=True
    )
    
    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(id={self.id})>"
    
    def to_dict(self, exclude: Optional[set] = None) -> dict[str, Any]:
        exclude = exclude or set()
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
            if column.name not in exclude
        }