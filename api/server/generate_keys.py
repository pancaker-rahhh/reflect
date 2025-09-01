#!/usr/bin/env python3
"""
Script to generate secure encryption keys for the Reflect API.
Run this script to generate ENCRYPTION_KEY and ENCRYPTION_SALT values.
"""

import secrets
import base64
from cryptography.fernet import Fernet


def generate_encryption_key():
    """Generate a secure Fernet key"""
    return Fernet.generate_key().decode()


def generate_encryption_salt():
    """Generate a secure salt for key derivation"""
    return secrets.token_urlsafe(32)


def main():
    print('🔐 Generating secure encryption keys for Reflect API...')
    print()

    # Generate keys
    encryption_key = generate_encryption_key()
    encryption_salt = generate_encryption_salt()

    print('✅ Generated secure keys:')
    print()
    print(f'ENCRYPTION_KEY={encryption_key}')
    print(f'ENCRYPTION_SALT={encryption_salt}')
    print()

    print('📝 Add these to your .env file:')
    print('=' * 50)
    print(f'ENCRYPTION_KEY={encryption_key}')
    print(f'ENCRYPTION_SALT={encryption_salt}')
    print('=' * 50)
    print()

    print('⚠️  IMPORTANT:')
    print('- Keep these keys secure and never commit them to version control')
    print('- Use the same keys across all environments (dev, staging, prod)')
    print("- If you lose these keys, you won't be able to decrypt existing data")
    print()

    # Test the keys
    print('🧪 Testing encryption/decryption...')
    try:
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

        # Test key derivation
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=encryption_salt.encode(),
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(encryption_key.encode()))
        fernet = Fernet(key)

        # Test encryption/decryption
        test_data = 'test_secret_data'
        encrypted = fernet.encrypt(test_data.encode())
        decrypted = fernet.decrypt(encrypted).decode()

        if decrypted == test_data:
            print('✅ Encryption/decryption test passed!')
        else:
            print('❌ Encryption/decryption test failed!')

    except Exception as e:
        print(f'❌ Error testing encryption: {e}')


if __name__ == '__main__':
    main()
