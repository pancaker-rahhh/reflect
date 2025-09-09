FROM python:3.12.10-slim-bookworm AS builder

RUN pip install --no-cache-dir poetry==2.1.4
ENV POETRY_NO_INTERACTION=1 POETRY_VENV_IN_PROJECT=1 POETRY_VIRTUALENVS_IN_PROJECT=true

WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN poetry install --without dev

FROM python:3.12.10-slim-bookworm AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY server/ ./server/
RUN chown -R appuser:appuser /app

RUN echo '#!/bin/bash\n\
set -e\n\
echo "Running database migrations..."\n\
cd /app/server\n\
/app/.venv/bin/alembic upgrade head\n\
echo "Migrations completed. Starting application..."\n\
exec /app/.venv/bin/python server/run.py' > /app/start.sh \
    && chmod +x /app/start.sh \
    && chown appuser:appuser /app/start.sh

USER appuser
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["/app/start.sh"]