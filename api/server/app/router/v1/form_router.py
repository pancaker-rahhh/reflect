from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.core.auth import get_current_token_data
from app.schemas.auth_schema import TokenData
from app.schemas.form_schema import (
    FormResponse,
    FormCreate,
    FormUpdate,
    FormFieldResponse,
    FormFieldCreate,
    FormFieldUpdate,
)
from app.services.form_service import form_service
from app.services.organization_service import organization_service

form_router = APIRouter(prefix='/forms', tags=['forms'])


@form_router.post('/', response_model=FormResponse, status_code=status.HTTP_201_CREATED)
async def create_form(
    form_data: FormCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form_data.project_id, required_role='Admin'
    )
    return await form_service.create_form(db, form_data)


@form_router.get('/{form_id}', response_model=FormResponse)
async def get_form(
    form_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    form = await form_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id
    )
    return form


@form_router.get('/', response_model=List[FormResponse])
async def list_forms(
    project_id: Optional[UUID] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    if project_id:
        await organization_service.check_project_access(
            db, UUID(current_user.user_id), project_id
        )
    return await form_service.list_forms(db, project_id, skip, limit)


@form_router.put('/{form_id}', response_model=FormResponse)
async def update_form(
    form_id: UUID,
    form_data: FormUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    form = await form_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id, required_role='Admin'
    )
    return await form_service.update_form(db, form_id, form_data)


@form_router.delete('/{form_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_form(
    form_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    form = await form_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id, required_role='Admin'
    )
    success = await form_service.delete_form(db, form_id)
    if not success:
        raise HTTPException(status_code=404, detail="Form not found")


@form_router.post('/{form_id}/fields', response_model=FormFieldResponse)
async def create_form_field(
    form_id: UUID,
    field_data: FormFieldCreate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    form = await form_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id, required_role='Admin'
    )
    return await form_service.create_form_field(db, form_id, field_data)


@form_router.get('/{form_id}/fields', response_model=List[FormFieldResponse])
async def list_form_fields(
    form_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    form = await form_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id
    )
    return await form_service.get_form_fields(db, form_id)


@form_router.put('/{form_id}/fields/{field_id}', response_model=FormFieldResponse)
async def update_form_field(
    form_id: UUID,
    field_id: UUID,
    field_data: FormFieldUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    form = await form_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id, required_role='Admin'
    )
    field = await form_service.update_form_field(db, field_id, field_data)
    if not field:
        raise HTTPException(status_code=404, detail="Form field not found")
    return field


@form_router.delete('/{form_id}/fields/{field_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_form_field(
    form_id: UUID,
    field_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    form = await form_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id, required_role='Admin'
    )
    success = await form_service.delete_form_field(db, field_id)
    if not success:
        raise HTTPException(status_code=404, detail="Form field not found")


@form_router.put('/{form_id}/fields/reorder', status_code=status.HTTP_204_NO_CONTENT)
async def reorder_form_fields(
    form_id: UUID,
    field_ids: List[UUID],
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_token_data)
):
    form = await form_service.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    await organization_service.check_project_access(
        db, UUID(current_user.user_id), form.project_id, required_role='Admin'
    )
    await form_service.reorder_form_fields(db, form_id, field_ids)
