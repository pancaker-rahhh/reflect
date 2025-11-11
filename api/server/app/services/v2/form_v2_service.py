import random
import string
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.v2.forms_v2_model import FormV2
from app.repositories.v2.forms_v2_repository import (
    form_v2_repository,
    form_field_v2_repository,
    form_response_v2_repository,
)
from app.schemas.v2.form_v2_schema import (
    FormV2Create,
    FormV2Update,
    FormV2Response,
    FormFieldV2Response,
    FormResponseV2Create,
    TextFieldCreate,
    NumberFieldCreate,
    ChoiceFieldCreate,
    TextFieldUpdate,
    NumberFieldUpdate,
    ChoiceFieldUpdate,
)
from app.core.exceptions import NotFoundError
from app.core.logging import get_logger

logger = get_logger(__name__)


class FormV2Service:
    def _generate_public_link(self) -> str:
        letters = string.ascii_letters
        return ''.join(random.choices(letters, k=16))

    def _field_to_config(self, field_data) -> list:
        config = []

        if isinstance(field_data, TextFieldCreate):
            if field_data.max_length is not None:
                config.append({'key': 'max_length', 'value': field_data.max_length})
            if field_data.default_value is not None:
                config.append(
                    {'key': 'default_value', 'value': field_data.default_value}
                )

        elif isinstance(field_data, NumberFieldCreate):
            if field_data.min_value is not None:
                config.append({'key': 'min_value', 'value': field_data.min_value})
            if field_data.max_value is not None:
                config.append({'key': 'max_value', 'value': field_data.max_value})
            if field_data.default_value is not None:
                config.append(
                    {'key': 'default_value', 'value': field_data.default_value}
                )

        elif isinstance(field_data, ChoiceFieldCreate):
            config.append({'key': 'choices', 'value': field_data.choices})
            config.append({'key': 'multiple', 'value': field_data.multiple})
            if field_data.default_value is not None:
                config.append(
                    {'key': 'default_value', 'value': field_data.default_value}
                )

        return config

    async def create_form(
        self, db: AsyncSession, form_data: FormV2Create
    ) -> FormV2Response:
        form_dict = {
            'project_id': form_data.project_id,
            'name': form_data.name,
            'description': form_data.description,
            'is_active': form_data.is_active,
            'form_type': 'custom',
            'public_link': self._generate_public_link(),
            'config': form_data.config or {},
        }
        form = await form_v2_repository.create(db, **form_dict)

        if form_data.fields:
            for field_data in form_data.fields:
                field_dict = {
                    'form_id': form.id,
                    'field_type': field_data.field_type,
                    'field_key': field_data.field_key,
                    'label': field_data.label,
                    'is_required': field_data.is_required,
                    'order_index': field_data.order_index,
                    'config': self._field_to_config(field_data),
                }
                await form_field_v2_repository.create(db, **field_dict)

        form_with_fields = await form_v2_repository.get_with_fields(db, form.id)
        logger.info(f'Created form v2 {form.id} for project {form_data.project_id}')

        return FormV2Response.model_validate(form_with_fields)

    async def get_form(
        self, db: AsyncSession, form_id: UUID
    ) -> Optional[FormV2Response]:
        form = await form_v2_repository.get_with_fields(db, form_id)
        if not form:
            return None
        return FormV2Response.model_validate(form)

    async def get_form_by_public_link(
        self, db: AsyncSession, public_link: str
    ) -> Optional[FormV2Response]:
        form = await form_v2_repository.get_by_public_link(db, public_link)
        if not form:
            return None
        return FormV2Response.model_validate(form)

    async def list_forms(
        self,
        db: AsyncSession,
        project_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[FormV2Response]:
        if project_id:
            forms = await form_v2_repository.get_by_project(db, project_id, skip, limit)
        else:
            forms = await form_v2_repository.get_multi_with_fields(db, skip, limit)

        return [FormV2Response.model_validate(form) for form in forms]

    async def update_form(
        self, db: AsyncSession, form_id: UUID, form_data: FormV2Update
    ) -> Optional[FormV2Response]:
        update_dict = form_data.model_dump(exclude_unset=True)
        form = await form_v2_repository.update(db, form_id, **update_dict)
        if not form:
            return None

        form_with_fields = await form_v2_repository.get_with_fields(db, form_id)
        logger.info(f'Updated form v2 {form_id}')

        return FormV2Response.model_validate(form_with_fields)

    async def delete_form(self, db: AsyncSession, form_id: UUID) -> bool:
        success = await form_v2_repository.delete(db, form_id)
        if success:
            logger.info(f'Deleted form v2 {form_id}')
        return success

    async def get_form_fields(
        self, db: AsyncSession, form_id: UUID
    ) -> List[FormFieldV2Response]:
        fields = await form_field_v2_repository.get_by_form(db, form_id)
        return [FormFieldV2Response.model_validate(field) for field in fields]

    async def add_field_to_form(
        self,
        db: AsyncSession,
        form_id: UUID,
        field_data: TextFieldCreate | NumberFieldCreate | ChoiceFieldCreate,
    ) -> FormFieldV2Response:
        form = await form_v2_repository.get(db, form_id)
        if not form:
            raise NotFoundError(f'Form {form_id} not found')

        existing_fields = await form_field_v2_repository.get_by_form(db, form_id)
        max_order = max([f.order_index for f in existing_fields], default=-1)

        field_dict = {
            'form_id': form_id,
            'field_type': field_data.field_type,
            'field_key': field_data.field_key,
            'label': field_data.label,
            'is_required': field_data.is_required,
            'order_index': max(field_data.order_index, max_order + 1),
            'config': self._field_to_config(field_data),
        }
        field = await form_field_v2_repository.create(db, **field_dict)
        logger.info(f'Added field {field.id} to form v2 {form_id}')

        return FormFieldV2Response.model_validate(field)

    async def update_field(
        self,
        db: AsyncSession,
        field_id: UUID,
        field_data: TextFieldUpdate | NumberFieldUpdate | ChoiceFieldUpdate,
    ) -> Optional[FormFieldV2Response]:
        field = await form_field_v2_repository.get(db, field_id)
        if not field:
            return None

        update_dict = {}

        if field_data.field_key is not None:
            update_dict['field_key'] = field_data.field_key
        if field_data.label is not None:
            update_dict['label'] = field_data.label
        if field_data.is_required is not None:
            update_dict['is_required'] = field_data.is_required
        if field_data.order_index is not None:
            update_dict['order_index'] = field_data.order_index

        if field_data.field_type != field.field_type:
            update_dict['field_type'] = field_data.field_type

        new_config = self._field_to_config(field_data)
        if new_config:
            update_dict['config'] = new_config

        if not update_dict:
            return FormFieldV2Response.model_validate(field)

        updated_field = await form_field_v2_repository.update(
            db, field_id, **update_dict
        )
        logger.info(f'Updated field v2 {field_id}')

        return FormFieldV2Response.model_validate(updated_field)

    async def delete_field(self, db: AsyncSession, field_id: UUID) -> bool:
        success = await form_field_v2_repository.delete(db, field_id)
        if success:
            logger.info(f'Deleted field v2 {field_id}')
        return success

    async def submit_form_response(
        self,
        db: AsyncSession,
        public_link: str,
        response_data: FormResponseV2Create,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> None:
        form = await form_v2_repository.get_by_public_link(db, public_link)
        if not form:
            raise NotFoundError('Form not found')

        if not form.is_active:
            raise ValueError('This form is no longer accepting responses')

        await self._validate_required_fields(form, response_data.answers)

        response_dict = {
            'form_id': form.id,
            'answers': response_data.answers,
            'submitter_email': response_data.submitter_email,
            'submitter_name': response_data.submitter_name,
            'ip_address': ip_address,
            'user_agent': user_agent,
        }

        response = await form_response_v2_repository.create(db, **response_dict)
        logger.info(f'Created form response {response.id} for form {form.id}')

    async def _validate_required_fields(self, form: FormV2, answers: dict) -> None:
        if not form.fields:
            pass

        missing_fields = []
        for field in form.fields:
            if field.is_required:
                answer = answers.get(field.field_key)
                if (
                    answer is None
                    or answer == ''
                    or (isinstance(answer, list) and len(answer) == 0)
                ):
                    missing_fields.append(field.label)

        if missing_fields:
            raise ValueError(f"Required fields missing: {', '.join(missing_fields)}")

    async def get_form_responses(
        self, db: AsyncSession, form_id: UUID, skip: int = 0, limit: int = 100
    ) -> dict:
        responses = await form_response_v2_repository.get_by_form(
            db, form_id, skip, limit
        )
        total = await form_response_v2_repository.count_by_form(db, form_id)

        return {'total': total, 'items': responses}

    async def get_form_metrics(
        self, db: AsyncSession, form_id: UUID, time_range: str = 'all'
    ) -> dict:
        return await form_response_v2_repository.get_form_metrics(
            db, form_id, time_range
        )


form_v2_service = FormV2Service()
