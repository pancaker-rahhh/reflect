from fastapi import APIRouter, Depends, status
from typing import List
from uuid import UUID
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.core.auth import get_current_user_id
from app.models.schemas.template_schemas import (
    TemplateRequest,
    TemplateResponse,
    TemplateEditRequest,
)
from app.models.schemas.user_schemas import UserInfo
from app.services.user_service import user_service
from app.db import get_db
from app.services.template_service import TemplateService
from app.models.models import Template

router = APIRouter(tags=['templates'])


def _map_template_to_response(
    template: Template, user_details: UserInfo
) -> TemplateResponse:
    return TemplateResponse(
        id=template.id,
        name=template.name,
        description=template.description,
        category=template.category,
        created_by=user_details,
    )


@router.post('/', response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_request: TemplateRequest,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    template_service = TemplateService(db)
    new_template = template_service.create_template(template_request, current_user_id)
    user_info = user_service.get_user_info_from_id(current_user_id)
    return _map_template_to_response(new_template, user_info)


@router.get('/', response_model=List[TemplateResponse])
async def get_user_templates(
    db: Session = Depends(get_db), current_user_id: UUID = Depends(get_current_user_id)
):
    template_service = TemplateService(db)
    templates = template_service.get_user_templates(current_user_id)
    if not templates:
        return []

    user_info = user_service.get_user_info_from_id(current_user_id)
    return [_map_template_to_response(t, user_info) for t in templates]


@router.get('/{template_id}', response_model=TemplateResponse)
async def get_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    template_service = TemplateService(db)
    template = template_service.get_template_by_id(template_id, current_user_id)
    user_info = user_service.get_user_info_from_id(template.created_by_id)
    return _map_template_to_response(template, user_info)


@router.put('/{template_id}', response_model=TemplateResponse)
async def edit_template(
    template_id: UUID,
    template_request: TemplateEditRequest,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    template_service = TemplateService(db)
    updated_template = template_service.edit_template(
        template_id, template_request, current_user_id
    )
    user_info = user_service.get_user_info_from_id(updated_template.created_by_id)
    return _map_template_to_response(updated_template, user_info)


@router.delete('/{template_id}', status_code=status.HTTP_200_OK)
async def delete_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    template_service = TemplateService(db)
    template_service.delete_template(template_id, current_user_id)
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={'message': 'Template deleted successfully'},
    )
