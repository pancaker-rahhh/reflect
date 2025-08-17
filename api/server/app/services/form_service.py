from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.form_repository import (
    feedback_form_repository,
    form_field_repository,
)
from app.schemas.form_schema import (
    FormFieldCreate,
    FormFieldUpdate,
    FormFieldResponse,
    FormSubmissionData,
    FormCreate,
    FormUpdate,
    FormResponse,
)
from app.core.exceptions import NotFoundError, ValidationError
from app.core.logging import get_logger

logger = get_logger(__name__)


class FormService:
    async def create_form(
        self, db: AsyncSession, form_data: FormCreate
    ) -> FormResponse:
        form_dict = form_data.model_dump()
        form = await feedback_form_repository.create(db, **form_dict)
        logger.info(f'Created form {form.id} for project {form_data.project_id}')
        return FormResponse.model_validate(form)

    async def get_form(self, db: AsyncSession, form_id: UUID) -> Optional[FormResponse]:
        form = await feedback_form_repository.get_with_fields(db, form_id)
        if not form:
            return None
        return FormResponse.model_validate(form)

    async def list_forms(
        self,
        db: AsyncSession,
        project_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[FormResponse]:
        if project_id:
            forms = await feedback_form_repository.get_by_project(
                db, project_id, skip, limit
            )
        else:
            forms = await feedback_form_repository.get_multi(db, skip=skip, limit=limit)
        return [FormResponse.model_validate(form) for form in forms]

    async def update_form(
        self, db: AsyncSession, form_id: UUID, form_data: FormUpdate
    ) -> Optional[FormResponse]:
        update_dict = form_data.model_dump(exclude_unset=True)
        form = await feedback_form_repository.update(db, form_id, **update_dict)
        if not form:
            return None
        return FormResponse.model_validate(form)

    async def delete_form(self, db: AsyncSession, form_id: UUID) -> bool:
        return await feedback_form_repository.delete(db, form_id)

    async def create_form_field(
        self, db: AsyncSession, form_id: UUID, field_data: FormFieldCreate
    ) -> FormFieldResponse:
        form = await feedback_form_repository.get(db, form_id)
        if not form:
            raise NotFoundError('Form not found')

        existing_fields = await form_field_repository.get_by_form(db, form_id)
        max_order = max([f.order_index for f in existing_fields], default=-1)

        field_dict = field_data.model_dump()
        if field_dict.get('order_index', 0) <= max_order:
            field_dict['order_index'] = max_order + 1

        field = await form_field_repository.create_field(db, form_id, **field_dict)
        logger.info(f'Added field {field.id} to form {form_id}')
        return FormFieldResponse.model_validate(field)

    async def get_form_fields(
        self, db: AsyncSession, form_id: UUID
    ) -> List[FormFieldResponse]:
        fields = await form_field_repository.get_by_form(db, form_id)
        return [FormFieldResponse.model_validate(field) for field in fields]

    async def update_form_field(
        self, db: AsyncSession, field_id: UUID, field_data: FormFieldUpdate
    ) -> Optional[FormFieldResponse]:
        update_dict = field_data.model_dump(exclude_unset=True)
        field = await form_field_repository.update(db, field_id, **update_dict)
        if not field:
            return None
        return FormFieldResponse.model_validate(field)

    async def delete_form_field(self, db: AsyncSession, field_id: UUID) -> bool:
        return await form_field_repository.delete(db, field_id)

    async def reorder_form_fields(
        self, db: AsyncSession, form_id: UUID, field_ids: List[UUID]
    ) -> None:
        for index, field_id in enumerate(field_ids):
            await form_field_repository.update(db, field_id, order_index=index)

    async def validate_form_submission(
        self, db: AsyncSession, submission: FormSubmissionData
    ) -> Dict[str, Any]:
        form = await feedback_form_repository.get_with_fields(db, submission.form_id)
        if not form:
            raise NotFoundError('Form not found')

        if not bool(form.is_active):  # type: ignore
            raise ValidationError('Form is not active')

        errors = []
        validated_data = {}

        for field in form.form_fields:
            field_key = field.field_key
            value = submission.field_data.get(field_key)

            if bool(field.is_required) and (value is None or value == ''):  # type: ignore
                errors.append(f"Field '{field.label}' is required")
                continue

            if value is None or value == '':
                validated_data[field_key] = value
                continue

            validated_data[field_key] = value

        if errors:
            raise ValidationError(f'Form validation failed: {"; ".join(errors)}')

        return validated_data


form_service = FormService()
