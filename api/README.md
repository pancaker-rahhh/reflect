# API

This is the backend service built using FastAPI and managed by Poetry.

## Setup

To install all packages, run

```bash
poetry install --no-root
```

In case you wish to add a package, simply run

```bash
poetry add <package-name>
```

and then run `poetry install --no-root`

## Running

We use `api/server/app/main.py` as an entrypoint into the application. However, this FastAPI application is run using Uvicorn as an ASGI server.
To start the application, at api/server/ run:

```bash
python run.py
```

## Code Formatting & Linting

This project uses Ruff for both linting and formatting Python code.

### Quick Commands

```bash
# Auto-fix and format all code (recommended)
poetry run ruff check . --fix && poetry run ruff format .

# Check for issues without fixing
poetry run ruff check .

# Format code
poetry run ruff format .
```

### Development Workflow

Before committing code, run:

```bash
# 1. Fix linting issues
poetry run ruff check . --fix

# 2. Format the code
poetry run ruff format .

# 3. Check if any issues need manual fixing
poetry run ruff check .
```