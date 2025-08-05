import logging
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.core.constants import PartyTypeEnum
from app.core.exceptions import AuthorizationError, DatabaseError, NotFoundError
from app.models.models import Party, PartyMember, Notification
from app.models.schemas.party_schemas import PartyCreateRequest, PartyUpdate
from app.services.user_service import user_service

logger = logging.getLogger(__name__)


class PartyService:
    def __init__(self, db: Session, user_id: UUID):
        self.db = db
        self.user_id = user_id

    def _validate_party_member_count(
        self, party: Party, additional_users: int = 0
    ) -> None:
        if party.party_type == PartyTypeEnum.COUPLE:
            current_member_count = len(party.members)
            total_after_addition = current_member_count + additional_users

            if total_after_addition > 2:
                raise ValueError(
                    f'Couples can only have 2 members. '
                    f'Current: {current_member_count}, '
                    f'Attempting to add: {additional_users}, '
                    f'Would result in: {total_after_addition} members.'
                )

    def get_all_user_parties(self) -> List[Party]:
        try:
            return (
                self.db.query(Party)
                .outerjoin(Party.members)
                .filter(
                    (Party.created_by_id == self.user_id)
                    | (PartyMember.user_id == self.user_id)
                )
                .options(selectinload(Party.members))
                .distinct()
                .all()
            )
        except SQLAlchemyError as e:
            raise DatabaseError('Failed to retrieve parties') from e

    def get_party_by_id(self, party_id: UUID) -> Party:
        return self._get_party_and_verify_access(party_id, check_owner=False)

    def create_party(self, party_data: PartyCreateRequest) -> Party:
        try:
            new_party = Party(
                party_type=party_data.party_type,
                name=party_data.name,
                tag=party_data.tag,
                description=party_data.description,
                icon_id=party_data.icon_id,
                couple_type=party_data.couple_type,
                created_by_id=self.user_id,
            )

            user_ids_to_add = (
                {UUID(uid) for uid in party_data.user_ids}
                if party_data.user_ids
                else set()
            )

            if party_data.creator_joins:
                user_ids_to_add.add(self.user_id)
            else:
                user_ids_to_add.discard(self.user_id)

            if party_data.party_type == PartyTypeEnum.COUPLE:
                if len(user_ids_to_add) > 2:
                    raise ValueError(
                        f'Couples can only have 2 members. '
                        f'Attempting to create couple with {len(user_ids_to_add)} members.'
                    )

            for user_id in user_ids_to_add:
                new_party.members.append(PartyMember(user_id=user_id))

            self.db.add(new_party)
            self.db.commit()
            self.db.refresh(new_party)

            if user_ids_to_add:
                inviter = user_service.get_user_details_by_id(str(self.user_id))
                inviter_name = (
                    inviter.user_metadata.get('name', 'A user') if inviter else 'A user'
                )
                self._send_party_invitation_notifications(
                    new_party, list(user_ids_to_add), inviter_name
                )
            return new_party
        except SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError('Failed to create party') from e

    def update_party(self, party_id: UUID, party_data: PartyUpdate) -> Party:
        party = self._get_party_and_verify_access(party_id, check_owner=True)
        try:
            update_data = party_data.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(party, key, value)

            self.db.commit()
            self.db.refresh(party)
            return party
        except SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError('Failed to update party') from e

    def add_users_to_party(self, party_id: UUID, user_ids: List[UUID]) -> Party:
        party = self._get_party_and_verify_access(party_id, check_owner=True)
        if not user_ids:
            return party

        try:
            existing_member_ids = {member.user_id for member in party.members}
            new_user_ids = [uid for uid in user_ids if uid not in existing_member_ids]

            self._validate_couple_member_count(party, len(new_user_ids))

            new_members = [
                PartyMember(party_id=party_id, user_id=uid) for uid in new_user_ids
            ]

            if new_members:
                self.db.bulk_save_objects(new_members)
                self.db.commit()
                self.db.refresh(party)

            inviter = user_service.get_user_details_by_id(str(self.user_id))
            inviter_name = (
                inviter.user_metadata.get('name', 'A user') if inviter else 'A user'
            )
            self._send_party_invitation_notifications(party, user_ids, inviter_name)

            return party
        except (IntegrityError, SQLAlchemyError) as e:
            self.db.rollback()
            raise DatabaseError('Failed to add users to party.') from e
        except ValueError as e:
            raise e

    def remove_users_from_party(self, party_id: UUID, user_ids: List[UUID]) -> Party:
        party = self._get_party_and_verify_access(party_id, check_owner=True)
        if not user_ids:
            return party

        if self.user_id in user_ids:
            raise AuthorizationError('Party owner cannot be removed from the party.')

        try:
            (
                self.db.query(PartyMember)
                .filter(
                    PartyMember.party_id == party_id, PartyMember.user_id.in_(user_ids)
                )
                .delete(synchronize_session=False)
            )
            self.db.commit()
            self.db.refresh(party)
            return party
        except SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError('Failed to remove users from party') from e

    def delete_party(self, party_id: UUID) -> None:
        party = self._get_party_and_verify_access(party_id, check_owner=True)
        try:
            self.db.delete(party)
            self.db.commit()
        except SQLAlchemyError as e:
            self.db.rollback()
            raise DatabaseError('Failed to delete party') from e

    def search_users_for_party(self, query: str) -> list:
        try:
            return user_service.search_users(query)
        except Exception as e:
            raise DatabaseError('Failed to search users') from e

    def _get_party_and_verify_access(
        self, party_id: UUID, check_owner: bool = False
    ) -> Party:
        try:
            query = (
                self.db.query(Party)
                .options(selectinload(Party.members))
                .filter(Party.id == party_id)
            )

            access_filter = (Party.created_by_id == self.user_id) | (
                Party.members.any(PartyMember.user_id == self.user_id)
            )

            party = query.filter(access_filter).one_or_none()

            if not party:
                raise NotFoundError('Party not found or access denied')

            if check_owner and party.created_by_id != self.user_id:
                raise AuthorizationError(
                    'You do not have permission to modify this party'
                )

            return party
        except SQLAlchemyError as e:
            raise DatabaseError('Database error while retrieving party') from e

    def _send_party_invitation_notifications(
        self, party: Party, new_user_ids: List[UUID], inviter_name: str
    ):
        if not new_user_ids:
            return

        try:
            recipients = [uid for uid in new_user_ids if uid != self.user_id]
            if not recipients:
                return

            party_type_name = 'group' if party.party_type.value == 'group' else 'couple'
            party_name = party.name or f'a {party_type_name}'

            notifications = [
                Notification(
                    user_id=user_id,
                    type='party_update',
                    title=f'Added to {party_type_name.title()}',
                    message=f'{inviter_name} has added you to the {party_type_name}: "{party_name}"',
                    data={
                        'party_id': str(party.id),
                        'party_name': party_name,
                        'party_type': party.party_type.value,
                    },
                )
                for user_id in recipients
            ]

            self.db.add_all(notifications)
            self.db.commit()

        except Exception as e:
            logger.error(f'Failed to send party notifications: {e}')
            self.db.rollback()
