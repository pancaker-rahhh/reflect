from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from app.core.constants import PartyTypeEnum, CoupleTypeEnum


class PartyMetadata(BaseModel):
    name: Optional[str] = None
    tag: Optional[str] = None
    description: Optional[str] = None
    icon_id: Optional[str] = None


class PartyCreateRequest(PartyMetadata):
    party_type: PartyTypeEnum
    user_ids: Optional[List[str]] = []
    creator_joins: bool = True
    couple_type: Optional[CoupleTypeEnum] = None


class PartyUpdate(BaseModel):
    name: Optional[str] = None
    tag: Optional[str] = None
    description: Optional[str] = None
    icon_id: Optional[str] = None
    couple_type: Optional[CoupleTypeEnum] = None


class PartyAddUsers(BaseModel):
    user_ids: List[str]


class PartyRemoveUsers(BaseModel):
    user_ids: List[str]


class PartyMemberMetadata(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    email: str
    role: str


class PartySummary(BaseModel):
    id: str
    name: Optional[str]
    tag: Optional[str] = None
    description: Optional[str] = None
    party_type: PartyTypeEnum
    couple_type: Optional[CoupleTypeEnum] = None
    user_count: int = 0


class PartyResponse(PartyMetadata):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    party_type: PartyTypeEnum
    couple_type: Optional[CoupleTypeEnum] = None
    users: List[PartyMemberMetadata] = []
    user_count: int = 0
    is_owner: bool = False
    created_at: datetime
    updated_at: datetime


class PartyListResponse(BaseModel):
    parties: List[PartyResponse]
    total: int


class GroupCreateRequest(PartyMetadata):
    user_ids: Optional[List[str]] = []
    creator_joins: bool = True

    def to_party_request(self) -> PartyCreateRequest:
        return PartyCreateRequest(
            name=self.name,
            tag=self.tag,
            description=self.description,
            icon_id=self.icon_id,
            party_type=PartyTypeEnum.GROUP,
            user_ids=self.user_ids,
            creator_joins=self.creator_joins,
        )


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    tag: Optional[str] = None
    description: Optional[str] = None
    icon_id: Optional[str] = None

    def to_party_update(self) -> PartyUpdate:
        return PartyUpdate(
            name=self.name,
            tag=self.tag,
            description=self.description,
            icon_id=self.icon_id,
        )


class CoupleCreateRequest(PartyMetadata):
    couple_type: CoupleTypeEnum
    user_ids: List[str]  # Should contain exactly 1 partner ID
    creator_joins: bool = True  # Always true for couples, but kept for API consistency

    def to_party_request(self) -> PartyCreateRequest:
        # Force creator_joins to True for couples
        return PartyCreateRequest(
            name=self.name,
            tag=self.tag,
            description=self.description,
            icon_id=self.icon_id,
            party_type=PartyTypeEnum.COUPLE,
            couple_type=self.couple_type,
            user_ids=self.user_ids,
            creator_joins=True,  # Always true for couples
        )


class CoupleUpdate(BaseModel):
    name: Optional[str] = None
    tag: Optional[str] = None
    description: Optional[str] = None
    icon_id: Optional[str] = None
    couple_type: Optional[CoupleTypeEnum] = None

    def to_party_update(self) -> PartyUpdate:
        return PartyUpdate(
            name=self.name,
            tag=self.tag,
            description=self.description,
            icon_id=self.icon_id,
            couple_type=self.couple_type,
        )


class CoupleCodeGenerateResponse(BaseModel):
    code: str
    expires_at: datetime


class CoupleCodeJoinRequest(BaseModel):
    code: str
    couple_type: CoupleTypeEnum
    name: Optional[str] = None
    tag: Optional[str] = None
    description: Optional[str] = None
    icon_id: Optional[str] = None


class CoupleCodeJoinResponse(BaseModel):
    party: PartyResponse
    partner_name: str
