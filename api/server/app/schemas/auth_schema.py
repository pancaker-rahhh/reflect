from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class TokenData(BaseModel):
    user_id: str
    email: str
    role: Optional[str] = None
    exp: int
    iat: int
    iss: str
    aud: str


class AuthUser(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    last_sign_in_at: Optional[datetime] = None
