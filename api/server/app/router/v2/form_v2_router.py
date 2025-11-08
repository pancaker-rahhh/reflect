from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.core.auth import get_current_token_data
from app.schemas.auth_schema import TokenData
from app.schemas.v2.form_v2_schema import (
    FormV2Response,
    FormV2Create,
    FormV2Update,
    FormFieldV2Response,
    FormFieldV2Create,
    FormFieldV2Update,
)
from app.services.v2.form_v2_service import form_v2_service
from app.services.organization_service import organization_service

form_router = APIRouter(prefix='/forms', tags=['forms-v2'])


@form_router.post('/', response_model=FormV2Response, status_code=status.HTTP_201_CREATED)
async def create_form(
    form_data: FormV2Create,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
):
    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form_data.project_id, required_role='Admin'
    )
    return await form_v2_service.create_form(db, form_data)


@form_router.get('/{form_id}', response_model=FormV2Response)
async def get_form(
    form_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
):
    form = await form_v2_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail='Form not found')

    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id
    )
    return form


@form_router.get('/', response_model=List[FormV2Response])
async def list_forms(
    project_id: Optional[UUID] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
):
    if project_id:
        await organization_service.check_project_access(
            db, UUID(current_user.user_id), project_id
        )
    return await form_v2_service.list_forms(db, project_id, skip, limit)


@form_router.put('/{form_id}', response_model=FormV2Response)
async def update_form(
    form_id: UUID,
    form_data: FormV2Update,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
):
    form = await form_v2_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail='Form not found')

    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id, required_role='Admin'
    )
    return await form_v2_service.update_form(db, form_id, form_data)


@form_router.delete('/{form_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_form(
    form_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
):
    form = await form_v2_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail='Form not found')

    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id, required_role='Admin'
    )
    success = await form_v2_service.delete_form(db, form_id)
    if not success:
        raise HTTPException(status_code=404, detail='Form not found')


@form_router.post('/{form_id}/fields', response_model=FormFieldV2Response)
async def create_form_field(
    form_id: UUID,
    field_data: FormFieldV2Create,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
):
    form = await form_v2_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail='Form not found')

    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id, required_role='Admin'
    )
    return await form_v2_service.add_field_to_form(db, form_id, field_data)


@form_router.get('/{form_id}/fields', response_model=List[FormFieldV2Response])
async def list_form_fields(
    form_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
):
    form = await form_v2_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail='Form not found')

    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id
    )
    return await form_v2_service.get_form_fields(db, form_id)


@form_router.delete(
    '/{form_id}/fields/{field_id}', status_code=status.HTTP_204_NO_CONTENT
)
async def delete_form_field(
    form_id: UUID,
    field_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
):
    form = await form_v2_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail='Form not found')

    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id, required_role='Admin'
    )
    success = await form_v2_service.delete_field(db, field_id)
    if not success:
        raise HTTPException(status_code=404, detail='Form field not found')


@form_router.put('/{form_id}/fields/{field_id}', response_model=FormFieldV2Response)
async def update_form_field(
    form_id: UUID,
    field_id: UUID,
    field_data: FormFieldV2Update,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data),
):
    form = await form_v2_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail='Form not found')

    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id, required_role='Admin'
    )
    updated_field = await form_v2_service.update_field(db, field_id, field_data)
    if not updated_field:
        raise HTTPException(status_code=404, detail='Form field not found')
    
    return updated_field

