from fastapi import APIRouter, Depends, status
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.core.auth import get_current_user_id
from app.db import get_db
from app.services.action_item_service import ActionItemService
from app.models.schemas.action_item_schemas import (
    ActionItemResponse,
    ActionItemUpdateRequest,
)
from app.models.models import ActionItem
from app.services.user_service import user_service
from app.models.schemas.user_schemas import UserInfo

router = APIRouter(tags=['action-items'])


def _map_action_item_to_response(
    action_item: ActionItem, assignee_info: UserInfo
) -> ActionItemResponse:
    return ActionItemResponse(
        id=action_item.id,
        title=action_item.title,
        description=action_item.description,
        category=action_item.category,
        priority=action_item.priority,
        status=action_item.status,
        due_date=action_item.due_date,
        is_completed=action_item.is_completed,
        submission_id=action_item.submission_id,
        assignee=assignee_info,
    )


@router.get(
    '/',
    response_model=List[ActionItemResponse],
    status_code=status.HTTP_200_OK,
)
def get_all_action_items_for_user(
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    service = ActionItemService(db)
    action_items = service.get_action_items_for_assignee(current_user_id)

    if not action_items:
        return []
    assignee_info = user_service.get_user_info_from_id(current_user_id)

    return [_map_action_item_to_response(item, assignee_info) for item in action_items]


@router.post(
    '/',
    response_model=List[ActionItemResponse],
    status_code=status.HTTP_201_CREATED,
)
def generate_action_items_from_submission(
    form_id: UUID,
    receiver_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    service = ActionItemService(db)
    action_items = service.generate_action_items_from_submission(form_id, receiver_id)

    if not action_items:
        return []
    assignee_info = user_service.get_user_info_from_id(current_user_id)

    return [_map_action_item_to_response(item, assignee_info) for item in action_items]


@router.put(
    '/{action_item_id}',
    response_model=ActionItemResponse,
    status_code=status.HTTP_200_OK,
)
def update_action_item(
    action_item_id: UUID,
    update_data: ActionItemUpdateRequest,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    service = ActionItemService(db)

    update_dict = update_data.model_dump(exclude_unset=True)

    updated_item = service.update_action_item(
        action_item_id, current_user_id, update_dict
    )
    assignee_info = user_service.get_user_info_from_id(current_user_id)

    return _map_action_item_to_response(updated_item, assignee_info)


@router.delete(
    '/{action_item_id}',
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_action_item(
    action_item_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    service = ActionItemService(db)
    service.delete_action_item(action_item_id, current_user_id)
