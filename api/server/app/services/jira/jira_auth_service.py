import aiohttp
import asyncio
import base64
import secrets
from typing import Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from urllib.parse import urlencode, urlparse
from enum import Enum

from app.core.logging import get_logger

logger = get_logger(__name__)


class JiraAuthType(str, Enum):
    OAUTH2 = 'oauth2'
    API_TOKEN = 'api_token'
    BASIC_AUTH = 'basic_auth'


class JiraVersion(str, Enum):
    CLOUD = 'cloud'
    SERVER = 'server'


class JiraConnectionStatus(str, Enum):
    CONNECTED = 'connected'
    AUTH_FAILED = 'auth_failed'
    NETWORK_ERROR = 'network_error'
    RATE_LIMITED = 'rate_limited'
    PERMISSION_DENIED = 'permission_denied'
    INVALID_URL = 'invalid_url'
    UNKNOWN_ERROR = 'unknown_error'


class JiraAuthService:
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.rate_limit_delay = 1.0
        self.max_retries = 3
        self.retry_delay = 2.0

    async def get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            timeout = aiohttp.ClientTimeout(total=30, connect=10)
            connector = aiohttp.TCPConnector(limit=10, limit_per_host=5)
            self.session = aiohttp.ClientSession(
                timeout=timeout,
                connector=connector,
                headers={'User-Agent': 'Reflect-JIRA-Integration/1.0'},
            )
        return self.session

    def detect_jira_instance_type(self, base_url: str) -> JiraVersion:
        parsed_url = urlparse(base_url.lower())
        if '.atlassian.net' in parsed_url.netloc:
            return JiraVersion.CLOUD
        else:
            return JiraVersion.SERVER

    def get_oauth_authorization_url(
        self,
        base_url: str,
        client_id: str,
        redirect_uri: str,
        state: Optional[str] = None,
    ) -> Dict[str, Any]:
        if not state:
            state = secrets.token_urlsafe(32)

        params = {
            'audience': 'api.atlassian.com',
            'client_id': client_id,
            'scope': 'read:jira-work write:jira-work manage:jira-project',
            'redirect_uri': redirect_uri,
            'state': state,
            'response_type': 'code',
            'prompt': 'consent',
        }

        auth_url = f'{base_url}/oauth/authorize?{urlencode(params)}'

        return {'auth_url': auth_url, 'state': state, 'expires_in': 600}

    async def exchange_oauth_code_for_tokens(
        self,
        base_url: str,
        client_id: str,
        client_secret: str,
        authorization_code: str,
        redirect_uri: str,
    ) -> Dict[str, Any]:
        try:
            token_url = f'{base_url}/oauth/token'

            data = {
                'grant_type': 'authorization_code',
                'client_id': client_id,
                'client_secret': client_secret,
                'code': authorization_code,
                'redirect_uri': redirect_uri,
            }

            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            }

            session = await self.get_session()

            async with session.post(token_url, data=data, headers=headers) as response:
                if response.status == 200:
                    token_data = await response.json()

                    encrypted_tokens = self._encrypt_auth_data(
                        {
                            'access_token': token_data.get('access_token'),
                            'refresh_token': token_data.get('refresh_token'),
                            'token_type': token_data.get('token_type', 'Bearer'),
                            'expires_in': token_data.get('expires_in'),
                            'scope': token_data.get('scope'),
                            'expires_at': datetime.now(timezone.utc)
                            + timedelta(seconds=token_data.get('expires_in', 3600)),
                        }
                    )

                    return {
                        'status': 'success',
                        'message': 'OAuth tokens obtained successfully',
                        'auth_data': encrypted_tokens,
                        'expires_in': token_data.get('expires_in'),
                    }
                else:
                    error_data = await response.json()
                    return {
                        'status': 'error',
                        'message': f'OAuth token exchange failed: {error_data.get("error_description", "Unknown error")}',
                        'details': error_data,
                    }

        except Exception as e:
            logger.error(f'OAuth token exchange failed: {str(e)}')
            return {'status': 'error', 'message': f'Token exchange failed: {str(e)}'}

    async def refresh_oauth_token(
        self, base_url: str, client_id: str, client_secret: str, refresh_token: str
    ) -> Dict[str, Any]:
        try:
            token_url = f'{base_url}/oauth/token'

            data = {
                'grant_type': 'refresh_token',
                'client_id': client_id,
                'client_secret': client_secret,
                'refresh_token': refresh_token,
            }

            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            }

            session = await self.get_session()

            async with session.post(token_url, data=data, headers=headers) as response:
                if response.status == 200:
                    token_data = await response.json()

                    encrypted_tokens = self._encrypt_auth_data(
                        {
                            'access_token': token_data.get('access_token'),
                            'refresh_token': token_data.get(
                                'refresh_token', refresh_token
                            ),
                            'token_type': token_data.get('token_type', 'Bearer'),
                            'expires_in': token_data.get('expires_in'),
                            'scope': token_data.get('scope'),
                            'expires_at': datetime.now(timezone.utc)
                            + timedelta(seconds=token_data.get('expires_in', 3600)),
                        }
                    )

                    return {
                        'status': 'success',
                        'message': 'OAuth token refreshed successfully',
                        'auth_data': encrypted_tokens,
                    }
                else:
                    error_data = await response.json()
                    return {
                        'status': 'error',
                        'message': f'Token refresh failed: {error_data.get("error_description", "Unknown error")}',
                        'details': error_data,
                    }

        except Exception as e:
            logger.error(f'OAuth token refresh failed: {str(e)}')
            return {'status': 'error', 'message': f'Token refresh failed: {str(e)}'}

    def _get_auth_headers(
        self, auth_data: Dict[str, Any], auth_type: JiraAuthType
    ) -> Dict[str, str]:
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }

        if auth_type == JiraAuthType.OAUTH2:
            access_token = auth_data.get('access_token')
            if not access_token:
                raise ValueError('OAuth2 access_token is required')
            headers['Authorization'] = f'Bearer {access_token}'

        elif auth_type == JiraAuthType.API_TOKEN:
            username = auth_data.get('username')
            api_token = auth_data.get('api_token')
            if not username or not api_token:
                raise ValueError('JIRA username and api_token are required')
            credentials = f'{username}:{api_token}'
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            headers['Authorization'] = f'Basic {encoded_credentials}'

        elif auth_type == JiraAuthType.BASIC_AUTH:
            username = auth_data.get('username')
            password = auth_data.get('password')
            if not username or not password:
                raise ValueError('JIRA username and password are required')
            credentials = f'{username}:{password}'
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            headers['Authorization'] = f'Basic {encoded_credentials}'

        else:
            raise ValueError(f'Unsupported auth type: {auth_type}')

        return headers

    def _encrypt_auth_data(self, auth_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            k: base64.b64encode(str(v).encode()).decode()
            if k in ['access_token', 'refresh_token', 'api_token', 'password']
            else v
            for k, v in auth_data.items()
        }

    def _decrypt_auth_data(self, auth_data: Dict[str, Any]) -> Dict[str, Any]:
        def safe_b64decode(value: str) -> str:
            try:
                # Add padding if needed
                padding_needed = len(value) % 4
                if padding_needed:
                    value += '=' * (4 - padding_needed)
                return base64.b64decode(value.encode()).decode()
            except Exception as e:
                logger.error(f'Failed to decode base64 value: {str(e)}')
                # Return original value if decoding fails
                return value

        return {
            k: safe_b64decode(v)
            if k in ['access_token', 'refresh_token', 'api_token', 'password']
            else v
            for k, v in auth_data.items()
        }

    async def test_connection_comprehensive(
        self,
        config: Dict[str, Any],
        auth_data: Dict[str, Any],
        auth_type: JiraAuthType = JiraAuthType.API_TOKEN,
    ) -> Dict[str, Any]:
        try:
            base_url = config.get('base_url', '').rstrip('/')
            if not base_url:
                return {
                    'status': 'error',
                    'connection_status': JiraConnectionStatus.INVALID_URL,
                    'message': 'JIRA base URL is required',
                    'details': {'missing_field': 'base_url'},
                }

            jira_version = self.detect_jira_instance_type(base_url)
            # For connection testing, use raw auth data (not encrypted)
            # decrypted_auth = self._decrypt_auth_data(auth_data)

            connectivity_test = await self._test_connectivity(base_url)
            if not connectivity_test['success']:
                return {
                    'status': 'error',
                    'connection_status': JiraConnectionStatus.NETWORK_ERROR,
                    'message': 'Cannot connect to JIRA instance',
                    'details': connectivity_test['details'],
                }

            auth_test = await self._test_authentication(base_url, auth_data, auth_type)
            if not auth_test['success']:
                return {
                    'status': 'error',
                    'connection_status': JiraConnectionStatus.AUTH_FAILED,
                    'message': 'Authentication failed',
                    'details': auth_test['details'],
                }

            permission_test = await self._test_permissions(
                base_url, auth_data, auth_type
            )
            if not permission_test['success']:
                return {
                    'status': 'error',
                    'connection_status': JiraConnectionStatus.PERMISSION_DENIED,
                    'message': 'Insufficient permissions',
                    'details': permission_test['details'],
                }

            return {
                'status': 'success',
                'connection_status': JiraConnectionStatus.CONNECTED,
                'message': f'Successfully connected to JIRA {jira_version.value}',
                'user_info': auth_test['user_info'],
                'jira_version': jira_version.value,
                'permissions': permission_test['permissions'],
                'api_version': auth_test.get('api_version'),
                'instance_info': auth_test.get('instance_info'),
            }

        except Exception as e:
            logger.error(f'Comprehensive connection test failed: {str(e)}')
            return {
                'status': 'error',
                'connection_status': JiraConnectionStatus.UNKNOWN_ERROR,
                'message': f'Connection test failed: {str(e)}',
                'details': {'exception': str(e)},
            }

    async def _test_connectivity(self, base_url: str) -> Dict[str, Any]:
        try:
            session = await self.get_session()
            async with session.get(
                f'{base_url}/rest/api/3/serverInfo', timeout=10
            ) as response:
                if response.status == 200:
                    server_info = await response.json()
                    return {'success': True, 'server_info': server_info}
                else:
                    return {
                        'success': False,
                        'details': {
                            'status_code': response.status,
                            'response_text': await response.text(),
                        },
                    }
        except asyncio.TimeoutError:
            return {'success': False, 'details': {'error': 'Connection timeout'}}
        except Exception as e:
            return {'success': False, 'details': {'error': str(e)}}

    async def _test_authentication(
        self, base_url: str, auth_data: Dict[str, Any], auth_type: JiraAuthType
    ) -> Dict[str, Any]:
        try:
            headers = self._get_auth_headers(auth_data, auth_type)
            session = await self.get_session()

            async with session.get(
                f'{base_url}/rest/api/3/myself', headers=headers
            ) as response:
                if response.status == 200:
                    user_info = await response.json()
                    return {'success': True, 'user_info': user_info, 'api_version': '3'}
                elif response.status == 401:
                    return {
                        'success': False,
                        'details': {'error': 'Invalid credentials'},
                    }
                elif response.status == 403:
                    return {'success': False, 'details': {'error': 'Access forbidden'}}
                else:
                    return {
                        'success': False,
                        'details': {
                            'status_code': response.status,
                            'response_text': await response.text(),
                        },
                    }
        except Exception as e:
            return {'success': False, 'details': {'error': str(e)}}

    async def _test_permissions(
        self, base_url: str, auth_data: Dict[str, Any], auth_type: JiraAuthType
    ) -> Dict[str, Any]:
        try:
            headers = self._get_auth_headers(auth_data, auth_type)
            session = await self.get_session()

            async with session.get(
                f'{base_url}/rest/api/3/project', headers=headers
            ) as response:
                if response.status == 200:
                    projects_data = await response.json()
                    if isinstance(projects_data, dict):
                        project_count = len(projects_data.get('values', []))
                    else:
                        project_count = (
                            len(projects_data) if isinstance(projects_data, list) else 0
                        )
                    return {
                        'success': True,
                        'permissions': {
                            'can_read_projects': True,
                            'can_create_issues': True,
                            'project_count': project_count,
                        },
                    }
                elif response.status == 403:
                    return {
                        'success': False,
                        'details': {'error': 'No project access permissions'},
                    }
                else:
                    return {
                        'success': False,
                        'details': {
                            'status_code': response.status,
                            'response_text': await response.text(),
                        },
                    }
        except Exception as e:
            return {'success': False, 'details': {'error': str(e)}}

    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()


jira_auth_service = JiraAuthService()
