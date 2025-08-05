from fastapi import APIRouter, Depends, Query, status
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.services.user_service import user_service
from app.models.schemas.user_schemas import UserInfo
from app.core.auth import get_current_user_id
from app.db import get_db
from app.models.models import Form
from app.services.form_service import FormService
from app.models.schemas.form_schemas import (
    AppendFieldRequest,
    AppendFieldResponse,
    FormCreateRequest,
    FormResponse,
    FieldResponse,
    FormEditRequest,
    SubmitFormRequest,
    SubmitFormResponse,
    FormSummaryResponse,
    RespondedFormSummaryResponse,
    FormCreateWithLLMRequest,
)
from app.models.schemas.form_schemas import FullRespondedFormResponse

router = APIRouter(tags=['forms'])


def _map_form_to_response(
    form: Form, receiver: Optional[UserInfo] = None
) -> FormResponse:
    field_responses = [
        FieldResponse(
            id=ff.field.id,
            type=ff.field.type,
            question=ff.field.question,
            placeholder=ff.field.placeholder,
            is_required=ff.field.is_required,
            options=ff.field.options,
            order=ff.order,
            status=ff.status,
        )
        for ff in sorted(form.form_fields, key=lambda ff: ff.order)
    ]
    creator_info = user_service.get_user_info_from_id(form.created_by_id)

    return FormResponse(
        id=form.id,
        template_id=form.template_id,
        title=form.title,
        context=form.context,
        feedback_giver_persona=form.feedback_giver_persona,
        feedback_receiver_persona=form.feedback_receiver_persona,
        created_by=creator_info,
        created_at=form.created_at,
        updated_at=form.updated_at,
        status=form.status,
        mode=form.mode,
        expires_at=form.expires_at,
        fields=field_responses,
        respondents=form.respondents,
        receiver=receiver,
        parties=[p.id for p in form.parties] if form.parties else [],
    )


def _map_assigned_summary_to_response(
    form_row, receiver_id: Optional[UUID], respondent_id: Optional[UUID]
) -> RespondedFormSummaryResponse:
    return RespondedFormSummaryResponse(
        id=form_row.id,
        title=form_row.title,
        context=form_row.context,
        status=form_row.status,
        created_at=form_row.created_at,
        updated_at=form_row.updated_at,
        expires_at=form_row.expires_at,
        receiver_id=receiver_id,
        respondent_id=respondent_id,
    )


def _map_form_summary_to_response(form_row) -> FormSummaryResponse:
    return FormSummaryResponse(
        id=form_row.id,
        title=form_row.title,
        created_at=form_row.created_at,
        status=form_row.status,
    )


@router.get('/', response_model=List[FormResponse])
def get_forms_by_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    form_service = FormService(db)
    forms = form_service.get_forms_by_template(template_id, current_user_id)
    return [_map_form_to_response(form) for form in forms]


@router.get('/summaries', response_model=List[FormSummaryResponse])
def get_form_summaries(
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    form_service = FormService(db)
    form_summaries = form_service.get_all_user_form_summaries(current_user_id)
    return [_map_form_summary_to_response(row) for row in form_summaries]


@router.get('/{form_id}', response_model=FormResponse)
def get_form(
    form_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    form_service = FormService(db)
    form = form_service.get_form_by_id(form_id, current_user_id)
    return _map_form_to_response(form)


@router.get('/responses/summaries', response_model=List[RespondedFormSummaryResponse])
def get_forms_to_respond_to_summary(
    responded: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    form_service = FormService(db)
    forms_with_details = form_service.get_forms_to_respond_to_summary(
        user_id=current_user_id, responded=responded
    )
    return [
        _map_assigned_summary_to_response(form, receiver_id, respondent_id)
        for form, receiver_id, respondent_id in forms_with_details
    ]


@router.post('/', response_model=FormResponse, status_code=status.HTTP_201_CREATED)
def create_form(
    form_request: FormCreateRequest,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    form_service = FormService(db)
    new_form = form_service.create_form(form_request, current_user_id)
    return _map_form_to_response(new_form)


@router.post('/llm', response_model=FormResponse, status_code=status.HTTP_201_CREATED)
def create_form_with_llm(
    form_request: FormCreateWithLLMRequest,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    form_service = FormService(db)
    new_form = form_service.create_form_with_llm(form_request, current_user_id)
    return _map_form_to_response(new_form)


@router.post('/expire-forms', status_code=status.HTTP_200_OK)
def trigger_form_expiration(db: Session = Depends(get_db)):
    form_service = FormService(db)
    result = form_service.expire_forms()
    return result


@router.put('/{form_id}', response_model=FormResponse)
def update_form(
    form_id: UUID,
    form_request: FormEditRequest,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    form_service = FormService(db)
    updated_form = form_service.update_form(form_id, form_request, current_user_id)
    return _map_form_to_response(updated_form)


@router.delete('/{form_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_form(
    form_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    form_service = FormService(db)
    form_service.delete_form(form_id, current_user_id)
    return None


@router.get('/submissions/received', response_model=List[FullRespondedFormResponse])
def get_my_received_feedback(
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    form_service = FormService(db)
    return form_service.get_all_my_received_feedback_forms(user_id=current_user_id)


# TODO - Follow Restful conventions
@router.get('/{form_id}/submissions', response_model=List[FullRespondedFormResponse])
def get_form_submissions(
    form_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    form_service = FormService(db)
    return form_service.get_submissions_for_creator(
        form_id=form_id, creator_id=current_user_id
    )


@router.get(
    '/submission/{form_id}/{receiver_id}/{respondent_id}',
    response_model=FullRespondedFormResponse,
)
def get_submission(
    form_id: UUID,
    receiver_id: UUID,
    respondent_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    form_service = FormService(db)
    return form_service.get_submission(
        form_id=form_id,
        receiver_id=receiver_id,
        respondent_id=respondent_id,
        current_user_id=current_user_id,
    )


@router.post(
    '/submissions',
    response_model=SubmitFormResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_form(
    submission_data: SubmitFormRequest,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    service = FormService(db)
    submission = service.submit_form(
        form_submission_data=submission_data, respondent_id=current_user_id
    )
    return submission


@router.post(
    '/{form_id}/append-field',
    response_model=AppendFieldResponse,
    status_code=status.HTTP_201_CREATED,
)
def append_field_to_form(
    form_id: UUID,
    field_request: AppendFieldRequest,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    form_service = FormService(db)
    result = form_service.append_field_to_form(form_id, field_request, current_user_id)
    return result
