from datetime import datetime, timedelta
import logging
import random
import string
from typing import List, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from app.core.exceptions import DatabaseError, NotFoundError
from app.models.models import Couple, CoupleInvitationCode
from app.models.schemas.party_schemas import CoupleCreateRequest, CoupleUpdate
from app.services.party_service import PartyService
from app.core.constants import CoupleTypeEnum, PartyTypeEnum

logger = logging.getLogger(__name__)


class CoupleService(PartyService):
    def __init__(self, db: Session, user_id: UUID):
        super().__init__(db, user_id)

    def get_all_user_couples(self) -> List[Couple]:
        try:
            all_parties = super().get_all_user_parties()
            return [
                party
                for party in all_parties
                if party.party_type == PartyTypeEnum.COUPLE
            ]
        except Exception as e:
            raise DatabaseError('Failed to retrieve couples') from e

    def get_couple_by_id(self, couple_id: UUID) -> Couple:
        party = super().get_party_by_id(couple_id)
        if party.party_type != PartyTypeEnum.COUPLE:
            raise DatabaseError('Requested party is not a couple')
        return party

    def create_couple(self, couple_data: CoupleCreateRequest) -> Couple:
        if not couple_data.creator_joins:
            raise ValueError("Creator must be a member of the couple they're creating.")

        partner_count = len(couple_data.user_ids or [])
        if partner_count != 1:
            raise ValueError(
                f'When creating a couple, you must provide exactly 1 partner ID. '
                f'You provided {partner_count} user ID(s).'
            )

        creator_id = str(self.user_id)
        if creator_id in couple_data.user_ids:
            raise ValueError('You cannot add yourself as your own partner.')

        party_request = couple_data.to_party_request()
        return super().create_party(party_request)

    def update_couple(self, couple_id: UUID, couple_data: CoupleUpdate) -> Couple:
        party_update = couple_data.to_party_update()
        return super().update_party(couple_id, party_update)

    def add_users_to_couple(self, couple_id: UUID, user_ids: List[UUID]) -> Couple:
        couple = self.get_couple_by_id(couple_id)

        current_member_count = len(couple.members)

        if current_member_count >= 2:
            raise ValueError(
                'This couple already has 2 members. '
                'Couples cannot have more than 2 members.'
            )

        if current_member_count + len(user_ids) > 2:
            raise ValueError(
                f'Couples can only have 2 members. '
                f'Current: {current_member_count}, '
                f'Attempting to add: {len(user_ids)}. '
                f'This would exceed the limit.'
            )

        return super().add_users_to_party(couple_id, user_ids)

    def generate_invitation_code(self) -> CoupleInvitationCode:
        try:
            existing_code = (
                self.db.query(CoupleInvitationCode)
                .filter(
                    CoupleInvitationCode.created_by_id == self.user_id,
                    CoupleInvitationCode.used_at.is_(None),
                    CoupleInvitationCode.expires_at > datetime.now(),
                )
                .first()
            )

            if existing_code:
                return existing_code

            max_attempts = 10
            for _ in range(max_attempts):
                code = ''.join(random.choices(string.digits, k=6))

                existing = (
                    self.db.query(CoupleInvitationCode)
                    .filter(CoupleInvitationCode.code == code)
                    .first()
                )

                if not existing:
                    break
            else:
                raise DatabaseError('Unable to generate unique invitation code')

            invitation_code = CoupleInvitationCode(
                code=code,
                created_by_id=self.user_id,
                expires_at=datetime.now() + timedelta(hours=24),
            )

            self.db.add(invitation_code)
            self.db.commit()
            self.db.refresh(invitation_code)

            return invitation_code

        except Exception as e:
            self.db.rollback()
            raise DatabaseError('Failed to generate invitation code') from e

    def join_couple_with_code(
        self,
        code: str,
        couple_type: CoupleTypeEnum,
        name=None,
        tag=None,
        description=None,
        icon_id=None,
    ) -> Tuple[Couple, str]:
        """Create a couple using an invitation code."""
        try:
            invitation = (
                self.db.query(CoupleInvitationCode)
                .filter(
                    CoupleInvitationCode.code == code,
                    CoupleInvitationCode.used_at.is_(None),
                    CoupleInvitationCode.expires_at > datetime.now(),
                )
                .first()
            )

            if not invitation:
                raise NotFoundError('Invalid or expired invitation code')

            if invitation.created_by_id == self.user_id:
                raise ValueError('You cannot use your own invitation code')

            from app.services.user_service import user_service

            partner_details = user_service.get_user_details_by_id(
                str(invitation.created_by_id)
            )
            partner_name = (
                partner_details.user_metadata.get('name', 'Your partner')
                if partner_details
                else 'Your partner'
            )

            couple_data = CoupleCreateRequest(
                name=name,
                tag=tag,
                description=description,
                icon_id=icon_id,
                couple_type=couple_type,
                user_ids=[str(invitation.created_by_id)],
                creator_joins=True,
            )

            couple = self.create_couple(couple_data)

            invitation.used_at = datetime.now()
            invitation.used_by_id = self.user_id

            self.db.commit()

            return couple, partner_name

        except Exception as e:
            self.db.rollback()
            if isinstance(e, (NotFoundError, ValueError)):
                raise e
            raise DatabaseError('Failed to create couple with invitation code') from e

    def remove_users_from_couple(self, couple_id: UUID, user_ids: List[UUID]) -> Couple:
        return super().remove_users_from_party(couple_id, user_ids)

    def delete_couple(self, couple_id: UUID) -> None:
        super().delete_party(couple_id)

    def search_users_for_couple(self, query: str) -> list:
        return super().search_users_for_party(query)
