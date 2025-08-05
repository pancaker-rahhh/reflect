from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.core.auth import get_current_user_id
from app.core.exceptions import NotFoundError
from app.db import get_db
from app.services.party_service import PartyService
from app.services.couple_service import CoupleService
from app.services.user_service import user_service
from app.models.models import Party
from app.models.schemas.party_schemas import (
    PartyCreateRequest,
    PartyResponse,
    PartyUpdate,
    PartyListResponse,
    PartyMemberMetadata,
    PartyAddUsers,
    PartyRemoveUsers,
    CoupleCodeGenerateResponse,
    CoupleCodeJoinRequest,
    CoupleCodeJoinResponse,
)

router = APIRouter(tags=['parties'])


def _map_party_to_response(party: Party, current_user_id: UUID) -> PartyResponse:
    member_ids = [str(member.user_id) for member in party.members]

    user_details_map = user_service.get_multiple_user_details(member_ids)

    user_list = []
    for user_id_str, user_obj in user_details_map.items():
        user_list.append(
            PartyMemberMetadata(
                id=user_obj.id,
                name=user_obj.user_metadata.get('name', 'N/A'),
                email=user_obj.email,
                role=user_obj.user_metadata.get('role', 'user'),
            )
        )

    return PartyResponse(
        id=party.id,
        name=party.name,
        tag=party.tag,
        description=party.description,
        icon_id=party.icon_id,
        party_type=party.party_type,
        couple_type=party.couple_type,
        users=user_list,
        user_count=len(user_list),
        is_owner=(party.created_by_id == current_user_id),
        created_at=party.created_at,
        updated_at=party.updated_at,
    )


@router.get('/', response_model=PartyListResponse)
def get_all_parties(
    db: Session = Depends(get_db), current_user_id: UUID = Depends(get_current_user_id)
):
    service = PartyService(db, current_user_id)
    parties = service.get_all_user_parties()

    party_responses = [_map_party_to_response(p, current_user_id) for p in parties]
    return PartyListResponse(parties=party_responses, total=len(party_responses))


@router.post('/', response_model=PartyResponse, status_code=status.HTTP_201_CREATED)
def create_party(
    party_data: PartyCreateRequest,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    try:
        service = PartyService(db, current_user_id)
        new_party = service.create_party(party_data)
        return _map_party_to_response(new_party, current_user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get('/{party_id}', response_model=PartyResponse)
def get_party(
    party_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    service = PartyService(db, current_user_id)
    party = service.get_party_by_id(party_id)
    return _map_party_to_response(party, current_user_id)


@router.put('/{party_id}', response_model=PartyResponse)
def update_party(
    party_id: UUID,
    party_data: PartyUpdate,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    service = PartyService(db, current_user_id)
    updated_party = service.update_party(party_id, party_data)
    return _map_party_to_response(updated_party, current_user_id)


@router.delete('/{party_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_party(
    party_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    service = PartyService(db, current_user_id)
    service.delete_party(party_id)
    return None


@router.post('/{party_id}/users', response_model=PartyResponse)
def add_users_to_party(
    party_id: UUID,
    payload: PartyAddUsers,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    service = PartyService(db, current_user_id)
    updated_party = service.add_users_to_party(party_id, payload.user_ids)
    return _map_party_to_response(updated_party, current_user_id)


@router.delete('/{party_id}/users', response_model=PartyResponse)
def remove_users_from_party(
    party_id: UUID,
    payload: PartyRemoveUsers,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    service = PartyService(db, current_user_id)
    updated_party = service.remove_users_from_party(party_id, payload.user_ids)
    return _map_party_to_response(updated_party, current_user_id)


@router.post('/couple/generate-code', response_model=CoupleCodeGenerateResponse)
def generate_couple_invitation_code(
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    service = CoupleService(db, current_user_id)
    invitation_code = service.generate_invitation_code()

    return CoupleCodeGenerateResponse(
        code=invitation_code.code,
        expires_at=invitation_code.expires_at,
    )


@router.post('/couple/join-with-code', response_model=CoupleCodeJoinResponse)
def join_couple_with_code(
    request: CoupleCodeJoinRequest,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    try:
        service = CoupleService(db, current_user_id)
        couple, partner_name = service.join_couple_with_code(
            code=request.code,
            couple_type=request.couple_type,
            name=request.name,
            tag=request.tag,
            description=request.description,
            icon_id=request.icon_id,
        )

        party_response = _map_party_to_response(couple, current_user_id)

        return CoupleCodeJoinResponse(
            party=party_response,
            partner_name=partner_name,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get('/users/search', response_model=List[PartyMemberMetadata])
def search_users(
    query: str,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    service = PartyService(db, current_user_id)

    users = service.search_users_for_party(query)

    return [
        PartyMemberMetadata(
            id=user.id,
            name=user.user_metadata.get('name', 'N/A'),
            email=user.email,
            role=user.user_metadata.get('role', 'user'),
        )
        for user in users
    ]
