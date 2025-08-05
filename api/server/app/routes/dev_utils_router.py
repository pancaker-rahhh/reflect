from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
from app.core.config import get_settings

router = APIRouter(tags=['Development Utilities'])

supabase_client: Client = create_client(
    get_settings().SUPABASE_URL, get_settings().SUPABASE_ANON_KEY
)


class TestUserLogin(BaseModel):
    email: EmailStr
    password: str


@router.post('/login', summary='Get JWT for a test user')
def get_test_user_token(credentials: TestUserLogin):
    try:
        response = supabase_client.auth.sign_in_with_password(
            {'email': credentials.email, 'password': credentials.password}
        )
        return {'access_token': response.session.access_token}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=f'Failed to sign in: {e}'
        )
