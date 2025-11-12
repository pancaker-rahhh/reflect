from __future__ import annotations

from typing import Optional, List, Literal, Union
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class TextFieldCreate(BaseModel):
    field_type: Literal['text'] = 'text'
    field_key: str
    label: str
    is_required: bool = False
    order_index: int = 0
    max_length: Optional[int] = None
    default_value: Optional[str] = None


class NumberFieldCreate(BaseModel):
    field_type: Literal['number'] = 'number'
    field_key: str
    label: str
    is_required: bool = False
    order_index: int = 0
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    default_value: Optional[float] = None


class ChoiceFieldCreate(BaseModel):
    field_type: Literal['choice'] = 'choice'
    field_key: str
    label: str
    is_required: bool = False
    order_index: int = 0
    choices: List[str]
    multiple: bool = False
    default_value: Optional[Union[str, List[str]]] = None


FormFieldV2Create = Union[TextFieldCreate, NumberFieldCreate, ChoiceFieldCreate]


class TextFieldUpdate(BaseModel):
    field_type: Literal['text'] = 'text'
    field_key: Optional[str] = None
    label: Optional[str] = None
    is_required: Optional[bool] = None
    order_index: Optional[int] = None
    max_length: Optional[int] = None
    default_value: Optional[str] = None


class NumberFieldUpdate(BaseModel):
    field_type: Literal['number'] = 'number'
    field_key: Optional[str] = None
    label: Optional[str] = None
    is_required: Optional[bool] = None
    order_index: Optional[int] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    default_value: Optional[float] = None


class ChoiceFieldUpdate(BaseModel):
    field_type: Literal['choice'] = 'choice'
    field_key: Optional[str] = None
    label: Optional[str] = None
    is_required: Optional[bool] = None
    order_index: Optional[int] = None
    choices: Optional[List[str]] = None
    multiple: Optional[bool] = None
    default_value: Optional[Union[str, List[str]]] = None


FormFieldV2Update = Union[TextFieldUpdate, NumberFieldUpdate, ChoiceFieldUpdate]


class FormFieldV2Response(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    form_id: UUID
    field_type: str
    field_key: str
    label: str
    is_required: bool
    config: list
    order_index: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class FormV2Create(BaseModel):
    project_id: UUID
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    is_active: bool = True
    config: Optional[dict] = Field(default_factory=dict)
    fields: List[FormFieldV2Create] = Field(default_factory=list)


class FormV2Update(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    config: Optional[dict] = None


class FormV2Response(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID
    name: str
    form_type: str
    description: Optional[str]
    is_active: bool
    public_link: str
    config: dict
    created_at: datetime
    updated_at: Optional[datetime] = None
    fields: List[FormFieldV2Response] = Field(default_factory=list)


class FormV2ListResponse(BaseModel):
    total: int
    items: List[FormV2Response]


class FormResponseV2Create(BaseModel):
    answers: dict = Field(..., description='Answers keyed by field_key')
    submitter_email: Optional[str] = Field(None, max_length=255)
    submitter_name: Optional[str] = Field(None, max_length=255)


class FormResponseV2Response(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    form_id: UUID
    answers: dict
    feedback_ids: List[str] = Field(default_factory=list)
    submitter_email: Optional[str]
    submitter_name: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime] = None


class FormResponseV2ListResponse(BaseModel):
    total: int
    items: List[FormResponseV2Response]


class FormSubmissionSuccessResponse(BaseModel):
    message: str = 'Thank you for your submission'
    success: bool = True


class FormMetricsResponse(BaseModel):
    total_responses: int
    unique_users: int
    last_activity: Optional[str] = None
    time_range: str
