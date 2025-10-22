---
sidebar_position: 3
---

# Installation

This guide covers installation for different use cases: running the full Reflect platform locally, or just integrating the widget into your application.

## Widget Integration Only

If you just want to use Reflect widgets on your site, you don't need to install anything locally. Simply follow the [Quick Start Guide](/docs/getting-started/quick-start).

## Full Platform Development Setup

Follow these steps to run the entire Reflect platform locally for development.

### Prerequisites

- **Node.js** v20.0 or higher
- **Python** 3.11 or higher
- **Docker** and Docker Compose
- **PostgreSQL** 14 or higher (or use Docker)
- **Git**

### 1. Clone the Repository

```bash
cd reflect
```

### 2. Install Pre-commit Hooks

```bash
pip install pre-commit
pre-commit install
```

### 3. Setup Backend (API)

```bash
cd api
pip install -e .

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
# nano .env

# Run database migrations
cd server
alembic upgrade head

# Generate JWT keys
python generate_keys.py
```

### 4. Setup Frontend (Client)

```bash
cd ../../client
npm install

# Copy environment file
cp src/config/local.ts.example src/config/local.ts
```

### 5. Start with Docker Compose (Recommended)

The easiest way to run everything:

```bash
# From the root directory
docker-compose up
```

This starts:
- Frontend on `http://localhost:5173`
- Backend API on `http://localhost:8000`
- PostgreSQL database
- Nginx reverse proxy

### 6. Or Start Services Individually

If you prefer to run services separately:

**Terminal 1 - Database:**
```bash
docker-compose up postgres
```

**Terminal 2 - Backend:**
```bash
cd api/server
python run.py
```

**Terminal 3 - Frontend:**
```bash
cd client
npm run dev
```

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/reflect

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=RS256

# Cloudflare R2 (for CDN)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=reflect-widgets

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
```

### Frontend (config/local.ts)

```typescript
export default {
  apiBaseUrl: 'http://localhost:8000',
  cdnBaseUrl: 'https://cdn.reflect.app',
  environment: 'local',
};
```

## Building Widgets

To build widgets for production:

```bash
cd client
npm run build:widget
```

The compiled widget will be in `client/dist-widget/widget.js`.

## Running Tests

### Backend Tests
```bash
cd api
pytest
```

### Frontend Tests
```bash
cd client
npm test
```

## Troubleshooting

### Port already in use

If you get port conflicts, modify `docker-compose.yaml` or stop the conflicting service.

### Database connection failed

1. Check PostgreSQL is running: `docker-compose ps`
2. Verify credentials in `.env`
3. Check database exists: `psql -U postgres -l`

### Widget build fails

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check Node version: `node -v` (should be 20+)
3. Try: `npm run build:widget-base`

## Next Steps

- [Architecture Overview](/docs/getting-started/overview)
- [API Documentation](/docs/api/intro)
- [Widget Development](/docs/widgets/architecture)
