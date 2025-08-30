import boto3
import json
import httpx
from typing import Dict, Any, List, Optional
from botocore.exceptions import ClientError
from app.core.settings import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()


class R2StorageService:
    def __init__(self):
        self.s3_client = None
        self._initialize_s3_client()

    def _initialize_s3_client(self):
        if not all(
            [
                settings.R2_ACCOUNT_ID,
                settings.R2_ACCESS_KEY_ID,
                settings.R2_SECRET_ACCESS_KEY,
            ]
        ):
            logger.warning('R2 credentials not configured, using fallback CDN')
            return

        try:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=settings.r2_endpoint_url,
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                region_name='auto',
            )
        except Exception as e:
            logger.error(f'Failed to initialize R2 client: {str(e)}')

    async def upload_widget_files(
        self, public_key: str, widget_js_content: str, config: Dict[str, Any]
    ) -> Dict[str, str]:
        if not self.s3_client:
            raise Exception('R2 client not initialized')

        try:
            widget_key = f'widgets/{public_key}/widget.js'
            config_key = f'widgets/{public_key}/config.json'

            self.s3_client.put_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=widget_key,
                Body=widget_js_content.encode('utf-8'),
                ContentType='application/javascript',
                CacheControl='public, max-age=3600',
                Metadata={'public_key': public_key},
            )

            self.s3_client.put_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=config_key,
                Body=json.dumps(config, indent=2).encode('utf-8'),
                ContentType='application/json',
                CacheControl='public, max-age=3600',
            )

            widget_url = f'{settings.CDN_BASE_URL}/{widget_key}'
            config_url = f'{settings.CDN_BASE_URL}/{config_key}'

            logger.info(f'Successfully uploaded widget {public_key} to R2')

            return {
                'widget_url': widget_url,
                'config_url': config_url,
                'widget_key': widget_key,
                'config_key': config_key,
            }

        except ClientError as e:
            logger.error(f'R2 upload failed for {public_key}: {str(e)}')
            raise Exception(f'Failed to upload widget to R2: {str(e)}')

    async def upload_widget_file(
        self, public_key: str, widget_js_content: str
    ) -> Dict[str, str]:
        if not self.s3_client:
            raise Exception('R2 client not initialized')

        try:
            widget_key = f'widgets/{public_key}/widget.js'

            self.s3_client.put_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=widget_key,
                Body=widget_js_content.encode('utf-8'),
                ContentType='application/javascript',
                CacheControl='public, max-age=3600',
                Metadata={'public_key': public_key, 'type': 'widget_with_config'},
            )

            widget_url = f'{settings.CDN_BASE_URL}/{widget_key}'

            logger.info(
                f'Successfully uploaded widget {public_key} with embedded config to R2'
            )

            return {'widget_url': widget_url, 'widget_key': widget_key}

        except ClientError as e:
            logger.error(f'R2 upload failed for {public_key}: {str(e)}')
            raise Exception(f'Failed to upload widget to R2: {str(e)}')

    async def delete_widget_files(self, public_key: str) -> bool:
        if not self.s3_client:
            return False

        try:
            widget_key = f'widgets/{public_key}/widget.js'
            config_key = f'widgets/{public_key}/config.json'

            # Delete widget.js file
            self.s3_client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=widget_key)

            # Try to delete config.json file if it exists (ignore errors for non-existent files)
            try:
                self.s3_client.delete_object(
                    Bucket=settings.R2_BUCKET_NAME, Key=config_key
                )
                logger.info(f'Deleted config.json for widget {public_key} from R2')
            except ClientError:
                # Config file might not exist, which is fine
                pass

            logger.info(f'Deleted widget {public_key} from R2')
            return True

        except ClientError as e:
            logger.error(f'Failed to delete widget {public_key} from R2: {str(e)}')
            return False

    async def purge_cdn_cache(self, file_paths: List[str]) -> bool:
        if not settings.CDN_ZONE_ID or not settings.CDN_API_TOKEN:
            logger.warning(
                'Cloudflare credentials not configured, skipping cache purge'
            )
            return True

        try:
            headers = {
                'Authorization': f'Bearer {settings.CDN_API_TOKEN}',
                'Content-Type': 'application/json',
            }

            urls = [f'{settings.CDN_BASE_URL}/{path}' for path in file_paths]

            data = {'files': urls}

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f'https://api.cloudflare.com/client/v4/zones/{settings.CDN_ZONE_ID}/purge_cache',
                    headers=headers,
                    json=data,
                    timeout=30.0,
                )

                if response.status_code == 200:
                    logger.info(f'Successfully purged CDN cache for {len(urls)} files')
                    return True
                else:
                    logger.error(
                        f'CDN cache purge failed: {response.status_code} {response.text}'
                    )
                    return False

        except Exception as e:
            logger.error(f'CDN cache purge error: {str(e)}')
            return False


r2_storage_service = R2StorageService()
