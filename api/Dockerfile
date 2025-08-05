FROM python:3.12.10-slim-bookworm

RUN pip install poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1

WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN poetry install --only=main

COPY server/ ./server/
EXPOSE 8000

CMD ["poetry", "run", "python", "server/run.py"]
