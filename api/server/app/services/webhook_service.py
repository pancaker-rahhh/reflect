import aiohttp
import json
import hmac
import hashlib
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.webhook_model import Webhook, WebhookEventType, WebhookStatus
from app.repositories.integration_repository import webhook_repository
from app.core.logging import get_logger

logger = get_logger(__name__)


class WebhookDeliveryService:
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None

    async def get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session

    def _generate_signature(self, payload: str, secret: str) -> str:
        return hmac.new(
            secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    def _prepare_headers(self, webhook: Webhook, payload: str) -> Dict[str, str]:
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Reflect-Webhooks/1.0',
            **webhook.headers
        }
        
        if webhook.secret:
            signature = self._generate_signature(payload, webhook.secret)
            headers['X-Reflect-Signature'] = f'sha256={signature}'
            headers['X-Reflect-Timestamp'] = str(int(datetime.now(timezone.utc).timestamp()))
        
        return headers

    async def deliver_webhook(
        self, 
        db: AsyncSession, 
        webhook: Webhook, 
        event_type: WebhookEventType, 
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Deliver webhook with retry logic"""
        
        # Prepare payload
        webhook_payload = {
            'event': event_type.value,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'webhook_id': str(webhook.id),
            'project_id': str(webhook.project_id),
            'data': payload
        }
        
        payload_str = json.dumps(webhook_payload, default=str)
        headers = self._prepare_headers(webhook, payload_str)
        
        session = await self.get_session()
        last_error = None
        
        # Retry logic
        for attempt in range(webhook.retry_count + 1):
            try:
                timeout = aiohttp.ClientTimeout(total=webhook.timeout_seconds)
                
                async with session.post(
                    webhook.url,
                    data=payload_str,
                    headers=headers,
                    timeout=timeout
                ) as response:
                    response_text = await response.text()
                    
                    await webhook_repository.update(
                        db, webhook.id,
                        last_triggered_at=datetime.now(timezone.utc).isoformat(),
                        last_response_code=response.status,
                        error_message=None if response.status < 400 else response_text
                    )
                    
                    if response.status < 400:
                        logger.info(f"Webhook {webhook.id} delivered successfully to {webhook.url}")
                        return {
                            'status': 'success',
                            'response_code': response.status,
                            'attempt': attempt + 1
                        }
                    else:
                        last_error = f"HTTP {response.status}: {response_text}"
                        logger.warning(f"Webhook {webhook.id} failed (attempt {attempt + 1}): {last_error}")
                        
            except aiohttp.ClientError as e:
                last_error = f"Client error: {str(e)}"
                logger.warning(f"Webhook {webhook.id} failed (attempt {attempt + 1}): {last_error}")
            except Exception as e:
                last_error = f"Unexpected error: {str(e)}"
                logger.error(f"Webhook {webhook.id} failed (attempt {attempt + 1}): {last_error}")
        
        # All retries failed
        await webhook_repository.update(
            db, webhook.id,
            last_triggered_at=datetime.now(timezone.utc).isoformat(),
            last_response_code=0,
            error_message=last_error,
            status=WebhookStatus.FAILED
        )
        
        logger.error(f"Webhook {webhook.id} failed after {webhook.retry_count + 1} attempts: {last_error}")
        return {
            'status': 'failed',
            'error': last_error,
            'attempts': webhook.retry_count + 1
        }

    async def trigger_webhooks(
        self, 
        db: AsyncSession, 
        project_id: UUID, 
        event_type: WebhookEventType, 
        payload: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Trigger all webhooks for a project and event type"""
        
        webhooks = await webhook_repository.get_webhooks_for_event(
            db, project_id, event_type.value
        )
        
        active_webhooks = [w for w in webhooks if w.status == WebhookStatus.ACTIVE]
        
        if not active_webhooks:
            logger.debug(f"No active webhooks found for project {project_id} and event {event_type}")
            return []
        
        logger.info(f"Triggering {len(active_webhooks)} webhooks for event {event_type} in project {project_id}")
        
        results = []
        for webhook in active_webhooks:
            try:
                result = await self.deliver_webhook(db, webhook, event_type, payload)
                results.append({
                    'webhook_id': str(webhook.id),
                    'webhook_name': webhook.name,
                    **result
                })
            except Exception as e:
                logger.error(f"Failed to process webhook {webhook.id}: {str(e)}")
                results.append({
                    'webhook_id': str(webhook.id),
                    'webhook_name': webhook.name,
                    'status': 'error',
                    'error': str(e)
                })
        
        return results

    async def test_webhook(
        self, 
        db: AsyncSession, 
        webhook: Webhook
    ) -> Dict[str, Any]:
        """Test webhook delivery with a sample payload"""
        
        test_payload = {
            'test': True,
            'message': 'This is a test webhook delivery',
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        result = await self.deliver_webhook(
            db, webhook, WebhookEventType.FEEDBACK_CREATED, test_payload
        )
        
        return result

    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()


webhook_service = WebhookDeliveryService()