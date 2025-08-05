import logging
import sys


def setup_logging(log_level: str = 'INFO') -> None:
    log_format = '%(asctime)s | %(levelname)s | %(message)s'

    level = getattr(logging, log_level.upper(), logging.INFO)

    logging.basicConfig(
        level=level, format=log_format, handlers=[logging.StreamHandler(sys.stdout)]
    )

    logging.getLogger('uvicorn.access').setLevel(logging.WARNING)
    logging.getLogger('uvicorn.error').setLevel(logging.ERROR)
