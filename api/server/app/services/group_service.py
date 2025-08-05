import logging
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.core.exceptions import DatabaseError
from app.models.models import Group
from app.models.schemas.group_schemas import GroupCreateRequest, GroupUpdate
from app.services.party_service import PartyService
from app.core.constants import PartyTypeEnum

logger = logging.getLogger(__name__)


class GroupService(PartyService):
    def __init__(self, db: Session, user_id: UUID):
        super().__init__(db, user_id)

    def get_all_user_groups(self) -> List[Group]:
        try:
            all_parties = super().get_all_user_parties()
            return [
                party
                for party in all_parties
                if party.party_type == PartyTypeEnum.GROUP
            ]
        except Exception as e:
            raise DatabaseError('Failed to retrieve groups') from e

    def get_group_by_id(self, group_id: UUID) -> Group:
        party = super().get_party_by_id(group_id)
        if party.party_type != PartyTypeEnum.GROUP:
            raise DatabaseError('Requested party is not a group')
        return party

    def create_group(self, group_data: GroupCreateRequest) -> Group:
        party_request = group_data.to_party_request()
        return super().create_party(party_request)

    def update_group(self, group_id: UUID, group_data: GroupUpdate) -> Group:
        party_update = group_data.to_party_update()
        return super().update_party(group_id, party_update)

    def add_users_to_group(self, group_id: UUID, user_ids: List[UUID]) -> Group:
        return super().add_users_to_party(group_id, user_ids)

    def remove_users_from_group(self, group_id: UUID, user_ids: List[UUID]) -> Group:
        return super().remove_users_from_party(group_id, user_ids)

    def delete_group(self, group_id: UUID) -> None:
        super().delete_party(group_id)

    def search_users_for_group(self, query: str) -> list:
        return super().search_users_for_party(query)

    # Keep the original private method name for backward compatibility
    def _get_group_and_verify_access(
        self, group_id: UUID, check_owner: bool = False
    ) -> Group:
        return super()._get_party_and_verify_access(group_id, check_owner)

    def _send_group_invitation_notifications(
        self, group: Group, new_user_ids: List[UUID], inviter_name: str
    ):
        super()._send_party_invitation_notifications(group, new_user_ids, inviter_name)
