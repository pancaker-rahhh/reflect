---
sidebar_position: 1
---

# Overview

Reflect is a modern feedback collection platform built with a focus on performance, flexibility, and developer experience.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing fast builds
- **TailwindCSS** for styling
- **Radix UI** for accessible components
- **React Query** for data fetching
- **Preact** for widget builds (smaller bundle size)

### Backend
- **FastAPI** (Python) for the REST API
- **PostgreSQL** for data storage
- **SQLAlchemy** for ORM
- **Alembic** for database migrations
- **Pydantic** for data validation

### Infrastructure
- **Docker** for containerization
- **Cloudflare R2** for CDN storage
- **Nginx** as reverse proxy
- **GitHub Actions** for CI/CD

## Architecture Highlights

### Monorepo Structure
```
reflect/
├── client/          # React frontend application
├── api/             # FastAPI backend
├── docs/            # Documentation (Docusaurus)
├── infra/           # Terraform infrastructure code
└── docker-compose.yaml
```

### Widget System
- Widgets are built separately from the main app
- Compiled to standalone JavaScript files
- Deployed to CDN for global distribution
- Automatically updated when configuration changes

### Key Design Principles

1. **Separation of Concerns**: Widget code is isolated from the main application
2. **Performance First**: Widgets are optimized for minimal bundle size
3. **Developer Experience**: Simple API, clear documentation, easy integration
4. **Security**: Rate limiting, input sanitization, and authentication built-in
5. **Scalability**: CDN distribution, database indexing, and caching strategies

## Next Steps

- [Quick Start Guide](/docs/getting-started/quick-start) - Get up and running in 5 minutes
- [Widget Architecture](/docs/widgets/architecture) - Deep dive into how widgets work
- [CDN Deployment](/docs/architecture/cdn-deployment) - Learn about the deployment system
