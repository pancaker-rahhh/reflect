# API

This is the backend service built using FastAPI and managed by Poetry.

## Setup

To install all packages, run

```
poetry install --no-root
```

In case you wish to add a package, simply run

```
poetry add <package-name>
```

and then run `poetry install --no-root`

## Running

We use `api/server/app/main.py` as an entrypoint into the application. However, this FastAPI application is run using Uvicorn as an ASGI server.
To start the application, at api/server/ run:

```
python run.py
```
