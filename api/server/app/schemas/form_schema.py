from __future__ import annotations

from typing import Optional, Any, Dict, List
from uuid import UUID
from pydantic import BaseModel, Field


# Form Field Schemas
class FormFieldBase(BaseModel):
    field_type: str = Field(
        ..., description='Field type: text, email, dropdown, textarea, rating, etc.'
    )
    field_key: str = Field(..., max_length=100, description='Unique key for the field')
    label: str = Field(..., max_length=255, description='Display label for the field')
    is_required: bool = Field(False, description='Whether the field is required')
    validation_rules: Dict[str, Any] = Field(
        default_factory=dict, description='Validation rules JSON'
    )
    options: List[str] = Field(
        default_factory=list, description='Options for dropdown/radio fields'
    )
    order_index: int = Field(0, description='Display order of the field')


class FormFieldCreate(FormFieldBase):
    pass


class FormFieldUpdate(BaseModel):
    field_type: Optional[str] = None
    label: Optional[str] = None
    is_required: Optional[bool] = None
    validation_rules: Optional[Dict[str, Any]] = None
    options: Optional[List[str]] = None
    order_index: Optional[int] = None


class FormFieldResponse(FormFieldBase):
    id: UUID
    form_id: UUID
    created_at: str

    class Config:
        from_attributes = True


# Feedback Form Schemas
class FeedbackFormBase(BaseModel):
    name: str = Field(..., max_length=255, description='Name of the form')
    form_type: str = Field('custom', description='Type: custom, template')
    description: Optional[str] = Field(None, description='Form description')
    is_active: bool = Field(True, description='Whether form is active')
    config: Dict[str, Any] = Field(
        default_factory=dict, description='Form configuration JSON'
    )


class FeedbackFormCreate(FeedbackFormBase):
    pass


class FeedbackFormUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    form_type: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None


class FeedbackFormResponse(FeedbackFormBase):
    id: UUID
    project_id: UUID
    created_at: str
    updated_at: Optional[str] = None
    form_fields: List[FormFieldResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


# Additional schemas
class FeedbackFormListResponse(BaseModel):
    total: int
    items: List[FeedbackFormResponse]


class FieldReorderRequest(BaseModel):
    field_orders: List[Dict[str, Any]] = Field(
        ..., description='List of {field_id: UUID, order_index: int}'
    )


# New unified form schemas for the updated service
class FormCreate(BaseModel):
    project_id: UUID
    name: str = Field(..., max_length=255)
    form_type: str = Field('custom')
    description: Optional[str] = None
    is_active: bool = Field(True)
    config: Dict[str, Any] = Field(default_factory=dict)


class FormUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    form_type: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None


class FormResponse(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    form_type: str
    description: Optional[str]
    is_active: bool
    config: Dict[str, Any]
    created_at: str
    updated_at: Optional[str] = None
    form_fields: List[FormFieldResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


# Dynamic form submission schema
class FormSubmissionData(BaseModel):
    form_id: UUID
    field_data: Dict[str, Any] = Field(
        ..., description='Key-value pairs of form field responses'
    )
    submitter_email: Optional[str] = None
    submitter_name: Optional[str] = None
