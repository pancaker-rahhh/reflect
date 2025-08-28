import os
import base64
from typing import Dict, Any, Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from app.core.logging import get_logger

logger = get_logger(__name__)


class EncryptionService:
    def __init__(self):
        self._fernet: Optional[Fernet] = None
        self._initialize_fernet()

    def _initialize_fernet(self) -> None:
        try:
            encryption_key = os.getenv('ENCRYPTION_KEY')
            if not encryption_key:
                logger.error('ENCRYPTION_KEY environment variable not set')
                raise ValueError('ENCRYPTION_KEY environment variable not set')

            if len(encryption_key) != 44:  # Fernet key length
                salt = os.getenv('ENCRYPTION_SALT', 'default_salt_for_development')
                kdf = PBKDF2HMAC(
                    algorithm=hashes.SHA256(),
                    length=32,
                    salt=salt.encode(),
                    iterations=100000,
                )
                key = base64.urlsafe_b64encode(kdf.derive(encryption_key.encode()))
            else:
                key = encryption_key.encode()

            self._fernet = Fernet(key)
            logger.info('Encryption service initialized successfully')

        except Exception as e:
            logger.error(f'Failed to initialize encryption service: {str(e)}')
            raise

    def encrypt_data(self, data: str) -> str:
        try:
            if not self._fernet:
                self._initialize_fernet()

            encrypted_data = self._fernet.encrypt(data.encode())
            return base64.urlsafe_b64encode(encrypted_data).decode()

        except Exception as e:
            logger.error(f'Failed to encrypt data: {str(e)}')
            raise ValueError(f'Encryption failed: {str(e)}')

    def decrypt_data(self, encrypted_data: str) -> str:
        try:
            if not self._fernet:
                self._initialize_fernet()

            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode())
            decrypted_data = self._fernet.decrypt(encrypted_bytes)
            return decrypted_data.decode()

        except Exception as e:
            logger.error(f'Failed to decrypt data: {str(e)}')
            return encrypted_data

    def encrypt_auth_data(self, auth_data: Dict[str, Any]) -> Dict[str, Any]:
        sensitive_fields = ['access_token', 'refresh_token', 'api_token', 'password']
        encrypted_data = {}

        for key, value in auth_data.items():
            if key in sensitive_fields and value:
                try:
                    encrypted_data[key] = self.encrypt_data(str(value))
                except Exception as e:
                    logger.error(f'Failed to encrypt field {key}: {str(e)}')
                    encrypted_data[key] = base64.b64encode(str(value).encode()).decode()
            else:
                encrypted_data[key] = value

        return encrypted_data

    def decrypt_auth_data(self, auth_data: Dict[str, Any]) -> Dict[str, Any]:
        sensitive_fields = ['access_token', 'refresh_token', 'api_token', 'password']
        decrypted_data = {}

        for key, value in auth_data.items():
            if key in sensitive_fields and value:
                try:
                    decrypted_data[key] = self.decrypt_data(str(value))
                except Exception as e:
                    logger.error(f'Failed to decrypt field {key}: {str(e)}')
                    try:
                        decrypted_data[key] = base64.b64decode(
                            str(value).encode()
                        ).decode()
                    except Exception:
                        decrypted_data[key] = str(value)
            else:
                decrypted_data[key] = value

        return decrypted_data


encryption_service = EncryptionService()
