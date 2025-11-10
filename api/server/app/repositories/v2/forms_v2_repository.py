"""
Repository for Form V2 operations.

Form Response Schema Evolution:
-------------------------------
The FormResponseV2 model stores answers as JSONB keyed by field_key.
This design supports form schema changes over time:

1. Added Fields: New fields won't exist in old responses
   - Business logic can detect: response.answers.keys() vs current form.fields
   - Can mark these as "N/A" or "Not collected at submission time"

2. Deleted Fields: Deleted fields remain in old responses  
   - Business logic can detect: field_key in response but not in current form
   - Can mark these as "Obsolete field" or hide from display

3. Renamed Fields: Old responses keep old key, new responses use new key
   - This appears as a delete + add from the perspective above
   - Migration scripts can be written to copy old_key -> new_key if needed

4. Changed Field Types: Field type is stored in form_fields_v2, not in response
   - Response validation should use the form schema at submission time
   - Display logic should handle type mismatches gracefully

Example usage in service layer:
    response = await repository.get_response_with_form(db, response_id)
    current_field_keys = {f.field_key for f in response.form.fields}
    response_keys = set(response.answers.keys())
    
    missing_fields = current_field_keys - response_keys  # Added since submission
    obsolete_fields = response_keys - current_field_keys  # Deleted since submission
"""
from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.v2.forms_v2_model import FormV2, FormFieldV2, FormResponseV2
from app.repositories.base_repository import BaseRepository


def map_domain_field_to_db_field_v2(field) -> dict:
    """
    Map a domain field (TextField, NumberField, ChoiceField) to FormFieldV2 data.
    Returns a dict suitable for creating a FormFieldV2.
    """
    from app.domain.forms.form import TextField, NumberField, ChoiceField
    
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
        raise TypeError(f"Unknown field type: {type(field)}")
    
    return {
        'field_type': field.field_type,
        'field_key': field.field_key,
        'label': field.label,
        'is_required': field.is_required,
        'config': config,
        'order_index': field.order_index,
    }


def form_do_to_model_mapper_v2(form, project_id: UUID) -> FormV2:
    """
    Map a domain Form object to a FormV2 DB model.
    Field constraints are stored in the config JSONB field.
    """
    from app.domain.forms.form import Form
    
    db_fields = []
    for field in form.fields:
        field_data = map_domain_field_to_db_field_v2(field)
        field_data['form_id'] = None  # Will be set by SQLAlchemy relationship
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


# Legacy mapper for backward compatibility with existing tests
def form_do_to_model_mapper(form, project_id: UUID):
    """
    Legacy mapper for v1 FeedbackForm. 
    Maps domain Form to FeedbackForm (v1 model).
    Kept for backward compatibility with existing tests.
    """
    from app.domain.forms.form import Form, TextField, NumberField, ChoiceField
    from app.models.form_model import FeedbackForm, FormField as DBFormField
    
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
            raise TypeError(f"Unknown field type: {type(field)}")
        
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
        """Get a form with all its fields eagerly loaded."""
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
        """Get a form by its public link with all fields eagerly loaded."""
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
        """Get all forms for a project with fields eagerly loaded."""
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
        """Get multiple forms with fields eagerly loaded."""
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

    async def get_by_form(
        self, db: AsyncSession, form_id: UUID
    ) -> List[FormFieldV2]:
        """Get all fields for a specific form, ordered by order_index."""
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
        """Get all responses for a specific form."""
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
        """Count total responses for a specific form."""
        from sqlalchemy import func
        
        stmt = select(func.count()).select_from(FormResponseV2).where(
            FormResponseV2.form_id == form_id
        )
        result = await db.execute(stmt)
        return result.scalar_one()


# Singleton instances
form_v2_repository = FormV2Repository()
form_field_v2_repository = FormFieldV2Repository()
form_response_v2_repository = FormResponseV2Repository()
