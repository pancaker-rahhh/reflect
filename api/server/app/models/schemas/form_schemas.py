from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Union
from datetime import datetime
from uuid import UUID
from app.core.constants import FormModeEnum, FormStatusEnum, FieldStatusEnum
from .user_schemas import UserInfo


# TODO - these values cant be optional?
class FormCreateWithLLMRequest(BaseModel):
    template_id: UUID
    title: str
    context: Optional[str] = None
    feedback_giver_persona: Optional[str] = None
    feedback_receiver_persona: Optional[str] = None
    respondents: Optional[List[UUID]] = None
    parties: Optional[List[UUID]] = None
    mode: FormModeEnum = FormModeEnum.COLLECT_FEEDBACK
    expires_at: Optional[datetime] = None


class FieldCreateRequest(BaseModel):
    type: str
    question: str
    placeholder: Optional[str] = None
    is_required: bool = False
    options: Optional[List[str]] = None
    order: Optional[int] = None


class FormCreateRequest(BaseModel):
    title: str
    context: Optional[str] = None
    respondents: Optional[List[UUID]] = None
    parties: Optional[List[UUID]] = None
    mode: FormModeEnum = FormModeEnum.COLLECT_FEEDBACK
    expires_at: Optional[datetime] = None
    fields: List[FieldCreateRequest] = []


class FieldEditRequest(BaseModel):
    id: UUID
    type: Optional[str] = None
    question: Optional[str] = None
    placeholder: Optional[str] = None
    is_required: Optional[bool] = None
    options: Optional[List[str]] = None
    order: Optional[int] = None


class FormEditRequest(BaseModel):
    template_id: Optional[UUID] = None
    title: Optional[str] = None
    context: Optional[str] = None
    feedback_giver_persona: Optional[str] = None
    feedback_receiver_persona: Optional[str] = None
    mode: Optional[FormModeEnum] = None
    respondents: Optional[List[UUID]] = None
    parties: Optional[List[UUID]] = None
    status: Optional[FormStatusEnum] = None
    expires_at: Optional[datetime] = None
    fields: Optional[List[FieldEditRequest]] = None


class AppendFieldRequest(BaseModel):
    type: str
    question: str
    placeholder: Optional[str] = None
    is_required: bool = False
    options: Optional[List[str]] = None
    rejected_field_id: Optional[UUID] = None


class FieldResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    type: str
    question: str
    placeholder: Optional[str]
    is_required: bool
    options: Optional[List[str]]
    order: int
    status: FieldStatusEnum


class FormResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    template_id: UUID
    title: str
    context: Optional[str]
    feedback_giver_persona: Optional[str]
    feedback_receiver_persona: Optional[str]
    created_by: UserInfo
    status: str
    mode: FormModeEnum
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    fields: List[FieldResponse]
    respondents: Optional[List[UUID]] = None
    receiver: Optional[UserInfo] = None
    parties: Optional[List[UUID]] = None


class FormFieldAnswerRequest(BaseModel):
    field_id: UUID
    value: Union[str, int, List[str]]


class SubmitFormRequest(BaseModel):
    form_id: UUID
    receiver_id: UUID
    answers: List['FormFieldAnswerRequest']


class SubmitFormResponse(BaseModel):
    submission_id: UUID
    status: str
    message: str


class FormSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    created_at: datetime
    status: str


class FormFieldAnswerResponse(BaseModel):
    field_id: UUID
    value: Union[str, int, List[str]]
    question: str


class FullRespondedFormResponse(BaseModel):
    id: UUID
    form_id: UUID
    respondent: UserInfo
    receiver: Optional[UserInfo] = None
    submitted_at: datetime
    values: List[FormFieldAnswerResponse]

    class Config:
        from_attributes = True


class FormSubmissionResponse(BaseModel):
    submission_id: UUID
    status: str
    message: str


class RespondedFormSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    context: Optional[str]
    status: str
    created_at: datetime
    expires_at: Optional[datetime]
    receiver_id: Optional[UUID] = None
    respondent_id: Optional[UUID] = None


class AppendFieldResponse(BaseModel):
    success: bool
    message: str
    field_id: UUID
    form_id: UUID
