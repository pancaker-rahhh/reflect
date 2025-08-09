import structlog
import logging.config
from typing import Any, Dict
import httpx
import asyncio
from contextlib import asynccontextmanager

from api.server.app.core.settings import get_settings


class CorrelationIDProcessor:
    def __call__(self, logger, method_name, event_dict):
        correlation_id = event_dict.get('correlation_id')
        if correlation_id:
            event_dict['correlation_id'] = correlation_id
        return event_dict


class AxiomProcessor:
    def __init__(self):
        self.settings = get_settings()
        self.client = httpx.AsyncClient()

    def __call__(self, logger, method_name, event_dict):
        if self.settings.AXIOM_TOKEN and self.settings.AXIOM_DATASET:
            asyncio.create_task(self._send_to_axiom(event_dict))
        return event_dict

    async def _send_to_axiom(self, event_dict: Dict[str, Any]):
        try:
            await self.client.post(
                f'https://api.axiom.co/v1/datasets/{self.settings.AXIOM_DATASET}/ingest',
                headers={
                    'Authorization': f'Bearer {self.settings.AXIOM_TOKEN}',
                    'Content-Type': 'application/json',
                },
                json=[event_dict],
                timeout=5.0,
            )
        except Exception:
            pass


class PosthogProcessor:
    def __init__(self):
        self.settings = get_settings()
        self.client = httpx.AsyncClient()

    def __call__(self, logger, method_name, event_dict):
        if self.settings.POSTHOG_API_KEY and event_dict.get('event_type') == 'product':
            asyncio.create_task(self._send_to_posthog(event_dict))
        return event_dict

    async def _send_to_posthog(self, event_dict: Dict[str, Any]):
        try:
            await self.client.post(
                f'{self.settings.POSTHOG_HOST}/capture/',
                headers={'Content-Type': 'application/json'},
                json={
                    'api_key': self.settings.POSTHOG_API_KEY,
                    'event': event_dict.get('event'),
                    'properties': event_dict.get('properties', {}),
                    'distinct_id': event_dict.get('user_id', 'anonymous'),
                },
                timeout=5.0,
            )
        except Exception:
            pass


def setup_logging():
    processors = [
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt='iso'),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        CorrelationIDProcessor(),
        structlog.processors.CallsiteParameterAdder(
            parameters=[
                structlog.processors.CallsiteParameter.FILENAME,
                structlog.processors.CallsiteParameter.LINENO,
            ]
        ),
    ]

    settings = get_settings()

    if settings.AXIOM_TOKEN:
        processors.append(AxiomProcessor())

    if settings.POSTHOG_API_KEY:
        processors.append(PosthogProcessor())

    processors.append(structlog.dev.ConsoleRenderer())

    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    logging.config.dictConfig(
        {
            'version': 1,
            'disable_existing_loggers': False,
            'formatters': {
                'plain': {
                    '()': structlog.stdlib.ProcessorFormatter,
                    'processor': structlog.dev.ConsoleRenderer(),
                },
            },
            'handlers': {
                'default': {
                    'level': settings.LOG_LEVEL,
                    'class': 'logging.StreamHandler',
                    'formatter': 'plain',
                },
            },
            'loggers': {
                '': {
                    'handlers': ['default'],
                    'level': settings.LOG_LEVEL,
                    'propagate': True,
                }
            },
        }
    )


@asynccontextmanager
async def correlation_id_context(correlation_id: str):
    tokens = structlog.contextvars.bind_contextvars(correlation_id=correlation_id)
    try:
        yield
    finally:
        structlog.contextvars.reset_contextvars(**tokens)


def get_logger(name: str | None = None):
    return structlog.get_logger(name)
