# Database Migrations with Alembic

This directory contains Alembic database migration scripts for the Reflect API server. Alembic is configured for async database operations using SQLAlchemy with PostgreSQL.

## Configuration

- **Migration Scripts Location**: `migrations/`
- **Database Configuration**: Set via `DATABASE_URL` environment variable
- **Target Metadata**: All models imported in `env.py` are included in migrations

## Common Commands

### Auto-Generate Migrations

Generate a new migration file based on model changes:

```bash
# From the api/server directory
alembic revision --autogenerate -m "description of changes"
```

Examples:
```bash
alembic revision --autogenerate -m "add user table"
alembic revision --autogenerate -m "add email column to user"
alembic revision --autogenerate -m "create workspace and project tables"
```

### Apply Migrations (Upgrade)

Apply pending migrations to the database:

```bash
# Upgrade to the latest migration
alembic upgrade head

# Upgrade to a specific revision
alembic upgrade <revision_id>

# Upgrade by relative steps
alembic upgrade +2  # Apply next 2 migrations
```

### Rollback Migrations (Downgrade)

Rollback database to a previous state:

```bash
# Downgrade to previous migration
alembic downgrade -1

# Downgrade to a specific revision
alembic downgrade <revision_id>

# Downgrade by relative steps
alembic downgrade -2  # Rollback 2 migrations

# Downgrade to base (empty database)
alembic downgrade base
```

### Check Migration Status

View current migration status:

```bash
# Show current revision
alembic current

# Show migration history
alembic history

# Show pending migrations
alembic heads
```

### Create Empty Migration

Create a blank migration file for custom changes:

```bash
alembic revision -m "custom database changes"
```

## Best Practices

1. **Always review auto-generated migrations** before applying them
2. **Test migrations on a copy of production data** before deploying
3. **Keep migration descriptions clear and descriptive**
4. **Never edit applied migrations** - create new ones instead
5. **Import all models in env.py** to ensure they're included in auto-generation