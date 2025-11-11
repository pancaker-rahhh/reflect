from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload

from app.models.v2.forms_v2_model import FormV2, FormFieldV2, FormResponseV2
from app.repositories.base_repository import BaseRepository
from app.domain.forms.form import TextField, NumberField, ChoiceField
from app.models.form_model import FeedbackForm, FormField as DBFormField


def map_domain_field_to_db_field_v2(field) -> dict:
    config = []

    if isinstance(field, TextField):
        if field.max_length is not None:
            config.append({'key': 'max_length', 'value': field.max_length})
        if field.default_value is not None:
            config.append({'key': 'default_value', 'value': field.default_value})

    elif isinstance(field, NumberField):
        if field.min_value is not None:
            config.append({'key': 'min_value', 'value': field.min_value})
        if field.max_value is not None:
            config.append({'key': 'max_value', 'value': field.max_value})
        if field.default_value is not None:
            config.append({'key': 'default_value', 'value': field.default_value})

    elif isinstance(field, ChoiceField):
        config.append({'key': 'choices', 'value': list(field.choices)})
        config.append({'key': 'multiple', 'value': field.multiple})
        if field.default_value is not None:
            config.append({'key': 'default_value', 'value': field.default_value})
    else:
        raise TypeError(f'Unknown field type: {type(field)}')

    return {
        'field_type': field.field_type,
        'field_key': field.field_key,
        'label': field.label,
        'is_required': field.is_required,
        'config': config,
        'order_index': field.order_index,
    }


def form_do_to_model_mapper_v2(form, project_id: UUID) -> FormV2:
    db_fields = []
    for field in form.fields:
        field_data = map_domain_field_to_db_field_v2(field)
        field_data['form_id'] = None
        db_fields.append(FormFieldV2(**field_data))

    db_form = FormV2(
        project_id=project_id,
        name=form.name,
        form_type='custom',
        description=form.description,
        is_active=form.is_active,
        config={},
        fields=db_fields,
    )
    return db_form


def form_do_to_model_mapper(form, project_id: UUID):
    def map_domain_field_to_db_field(field) -> DBFormField:
        validation_rules = {}
        options = []

        if isinstance(field, TextField):
            if field.max_length is not None:
                validation_rules['max_length'] = field.max_length
            if field.default_value is not None:
                validation_rules['default'] = field.default_value
        elif isinstance(field, NumberField):
            if field.min_value is not None:
                validation_rules['min_value'] = field.min_value
            if field.max_value is not None:
                validation_rules['max_value'] = field.max_value
            if field.default_value is not None:
                validation_rules['default'] = field.default_value
        elif isinstance(field, ChoiceField):
            options = list(field.choices)
            validation_rules['multiple'] = field.multiple
            if field.default_value is not None:
                validation_rules['default'] = field.default_value
        else:
            raise TypeError(f'Unknown field type: {type(field)}')

        return DBFormField(
            form_id=None,
            field_type=field.field_type,
            field_key=field.field_key,
            label=field.label,
            is_required=field.is_required,
            validation_rules=validation_rules,
            options=options,
            order_index=field.order_index,
        )

    db_fields = [map_domain_field_to_db_field(field) for field in form.fields]
    db_form = FeedbackForm(
        project_id=project_id,
        name=form.name,
        form_type='custom',
        description=form.description,
        is_active=form.is_active,
        config={},
        form_fields=db_fields,
    )
    return db_form


class FormV2Repository(BaseRepository[FormV2]):
    def __init__(self):
        super().__init__(FormV2)

    async def get_with_fields(
        self, db: AsyncSession, form_id: UUID
    ) -> Optional[FormV2]:
        stmt = (
            select(FormV2)
            .where(FormV2.id == form_id)
            .options(selectinload(FormV2.fields))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_public_link(
        self, db: AsyncSession, public_link: str
    ) -> Optional[FormV2]:
        stmt = (
            select(FormV2)
            .where(FormV2.public_link == public_link)
            .options(selectinload(FormV2.fields))
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_project(
        self, db: AsyncSession, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[FormV2]:
        stmt = (
            select(FormV2)
            .where(FormV2.project_id == project_id)
            .options(selectinload(FormV2.fields))
            .offset(skip)
            .limit(limit)
            .order_by(FormV2.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_multi_with_fields(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[FormV2]:
        stmt = (
            select(FormV2)
            .options(selectinload(FormV2.fields))
            .offset(skip)
            .limit(limit)
            .order_by(FormV2.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())


class FormFieldV2Repository(BaseRepository[FormFieldV2]):
    def __init__(self):
        super().__init__(FormFieldV2)

    async def get_by_form(self, db: AsyncSession, form_id: UUID) -> List[FormFieldV2]:
        stmt = (
            select(FormFieldV2)
            .where(FormFieldV2.form_id == form_id)
            .order_by(FormFieldV2.order_index.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())


class FormResponseV2Repository(BaseRepository[FormResponseV2]):
    def __init__(self):
        super().__init__(FormResponseV2)

    async def get_by_form(
        self, db: AsyncSession, form_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[FormResponseV2]:
        stmt = (
            select(FormResponseV2)
            .where(FormResponseV2.form_id == form_id)
            .offset(skip)
            .limit(limit)
            .order_by(FormResponseV2.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def count_by_form(self, db: AsyncSession, form_id: UUID) -> int:
        stmt = (
            select(func.count())
            .select_from(FormResponseV2)
            .where(FormResponseV2.form_id == form_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one()

    async def get_form_metrics(
        self, db: AsyncSession, form_id: UUID, time_range: str = 'all'
    ) -> dict:
        time_filter = ''
        params = {'form_id': str(form_id)}

        if time_range != 'all':
            if time_range == '7d':
                time_filter = "AND fr.created_at >= NOW() - INTERVAL '7 days'"
            elif time_range == '30d':
                time_filter = "AND fr.created_at >= NOW() - INTERVAL '30 days'"
            elif time_range == '90d':
                time_filter = "AND fr.created_at >= NOW() - INTERVAL '90 days'"

        responses_query = f"""
        SELECT COUNT(*) as total_responses
        FROM form_responses_v2 fr
        WHERE fr.form_id = :form_id {time_filter}
        """

        responses_result = await db.execute(text(responses_query), params)
        total_responses = responses_result.scalar() or 0

        users_query = f"""
        SELECT COUNT(DISTINCT fr.submitter_email) as unique_users
        FROM form_responses_v2 fr
        WHERE fr.form_id = :form_id 
        AND fr.submitter_email IS NOT NULL {time_filter}
        """

        users_result = await db.execute(text(users_query), params)
        unique_users = users_result.scalar() or 0

        last_activity_query = f"""
        SELECT MAX(fr.created_at) as last_activity
        FROM form_responses_v2 fr
        WHERE fr.form_id = :form_id {time_filter}
        """

        last_activity_result = await db.execute(text(last_activity_query), params)
        last_activity = last_activity_result.scalar()

        return {
            'total_responses': total_responses,
            'unique_users': unique_users,
            'last_activity': last_activity.isoformat() if last_activity else None,
            'time_range': time_range,
        }


form_v2_repository = FormV2Repository()
form_field_v2_repository = FormFieldV2Repository()
form_response_v2_repository = FormResponseV2Repository()
