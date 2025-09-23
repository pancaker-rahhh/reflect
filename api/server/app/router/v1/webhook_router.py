import json
from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.db import get_db
from app.services.payment_service import payment_service
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


class WebhookResponse(BaseModel):
    success: bool
    message: str


@router.post('/webhook', response_model=WebhookResponse)
async def process_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    webhook_id: str = Header(..., alias='webhook-id'),
    webhook_signature: str = Header(..., alias='webhook-signature'),
    webhook_timestamp: str = Header(..., alias='webhook-timestamp'),
) -> WebhookResponse:
    """
    Process Dodo Payments webhooks.

    This endpoint receives and processes webhook events from Dodo Payments
    for payment and subscription status updates.

    Webhook URL: https://reflectfeedback.com/api/v1/organization/payments/webhook
    """
    try:
        # Get raw body
        raw_body = await request.body()
        body_str = raw_body.decode('utf-8')

        logger.info(
            f'Received webhook: {webhook_id}',
            extra={
                'webhook_id': webhook_id,
                'timestamp': webhook_timestamp,
            },
        )

        # Parse payload
        try:
            payload = json.loads(body_str)
        except json.JSONDecodeError as e:
            logger.error(f'Invalid JSON in webhook payload: {str(e)}')
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid JSON payload'
            )

        # Process webhook
        success = await payment_service.process_webhook(
            db=db,
            payload=payload,
            signature=webhook_signature,
            timestamp=webhook_timestamp,
        )

        if success:
            logger.info(f'Webhook processed successfully: {webhook_id}')
            return WebhookResponse(
                success=True, message='Webhook processed successfully'
            )
        else:
            logger.warning(f'Webhook processing failed: {webhook_id}')
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Webhook processing failed',
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Webhook processing error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Internal server error',
        )
