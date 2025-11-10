import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db import (
    create_engine_and_session_maker,
    set_engine_and_session_maker,
    get_session_maker,
    close_db,
)
from app.core.logging import get_logger
from app.services.subscription_service import subscription_service
from app.services.payment_service import payment_service

logger = get_logger(__name__)


class BackgroundTaskManager:
    def __init__(self):
        self.stop_event = asyncio.Event()
        self.task = None

    async def start_cancellation_worker(self):
        self.task = asyncio.create_task(self._cancellation_worker())

    async def _cancellation_worker(self):
        while not self.stop_event.is_set():
            try:
                # Get the session maker
                try:
                    session_maker = get_session_maker()
                except RuntimeError:
                    logger.warning(
                        'Database not initialized yet. '
                        'Skipping subscription cancellation cycle.'
                    )
                    await asyncio.sleep(60)
                    continue

                async with session_maker() as db:
                    try:
                        orgs = await subscription_service.list_organizations_due_cancellation(
                            db
                        )
                        logger.info(
                            f'Found {len(orgs)} organizations due for cancellation'
                        )

                        for org in orgs:
                            try:
                                # Perform actual cancellation in Dodo if subscription exists
                                if org.dodo_subscription_id:
                                    await payment_service.cancel_subscription(
                                        db, org.id
                                    )
                                    logger.info(
                                        f'Successfully cancelled Dodo subscription for org {org.id}'
                                    )
                                else:
                                    await subscription_service.cancel_subscription(
                                        db, org.id
                                    )
                                    logger.info(
                                        f'Successfully cancelled subscription for org {org.id}'
                                    )
                            except Exception as e:
                                logger.error(
                                    f'Failed to cancel subscription for org {org.id}: {str(e)}',
                                    exc_info=True,
                                )
                                # Continue processing other organizations
                                continue

                    except Exception as e:
                        logger.error(
                            f'Failed to fetch organizations due for cancellation: {str(e)}',
                            exc_info=True,
                        )

            except Exception as e:
                logger.error(
                    f'Unexpected error in cancellation worker: {str(e)}', exc_info=True
                )

            # Sleep a minute between scans
            await asyncio.sleep(60)

    async def stop(self):
        logger.info('Stopping background task manager...')
        self.stop_event.set()

        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                logger.info(
                    'Background cancellation worker task cancelled successfully'
                )
            except Exception as e:
                logger.error(
                    f'Error while cancelling background task: {str(e)}', exc_info=True
                )


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info('Starting application...')

    # Initialize database engine and session maker
    engine, session_maker = create_engine_and_session_maker()
    set_engine_and_session_maker(engine, session_maker)
    logger.info('Database engine initialized successfully')

    # Import all models to ensure SQLAlchemy relationships are properly configured
    import app.models  # noqa: F401

    task_manager = BackgroundTaskManager()
    await task_manager.start_cancellation_worker()

    try:
        yield
    finally:
        logger.info('Shutting down application...')

        # Stop background tasks
        await task_manager.stop()

        # Dispose database engine
        try:
            await close_db()
            logger.info('Database engine disposed successfully')
        except Exception as e:
            logger.error(
                f'Error disposing database engine: {str(e)}', exc_info=True
            )
