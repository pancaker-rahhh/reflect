# ARQ Task Queue Implementation Guide

## Overview

This document describes how the ARQ task queue is implemented and used in the Reflect API codebase. ARQ is an asyncio task queue built on top of Redis, making it a perfect fit for our FastAPI application.

## Architecture

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│               │      │               │      │               │
│   FastAPI     │      │     Redis     │      │  ARQ Worker   │
│   Server      │─────▶│   Queue       │─────▶│  Process      │
│               │      │               │      │               │
└───────────────┘      └───────────────┘      └───────────────┘
        │                                             │
        │                                             │
        ▼                                             ▼
┌───────────────┐                           ┌───────────────┐
│               │                           │               │
│   Database    │                           │  External     │
│               │                           │  Services     │
│               │                           │               │
└───────────────┘                           └───────────────┘
```

## Configuration

ARQ is configured in `app/worker.py`. The key configuration options are:

- **Redis Settings**: Connection details for Redis
- **Retry Configuration**: Settings for exponential backoff and maximum retries
- **Job Timeout**: Maximum time a task can run before being considered failed

## Available Tasks

### Webhook Tasks
- `dispatch_webhook_event`: Sends webhooks to external systems when events occur.

### Notification Tasks
- `send_notification`: Sends a notification to a single user.
- `send_bulk_notifications`: Sends notifications to multiple users in a batch.

### Integration Tasks
- `sync_integration_data`: Synchronizes data with external systems like GitHub or JIRA.
- `create_external_issue`: Creates an issue in an external system based on feedback.

### Analytics Tasks
- `calculate_project_metrics`: Calculates various metrics for a project.
- `generate_feedback_report`: Generates a report based on feedback data.

## How to Add a New Task

1. **Create a Task Function**:
   - Create a new function in an appropriate module under `app/services/tasks/`.
   - Function should be async and accept `ctx` as its first parameter.
   - Function should return a dict with status and result information.

```python
async def my_new_task(ctx: dict, param1: str, param2: int) -> Dict[str, Any]:
    # Task implementation
    return {"status": "success", "result": {...}}
```

2. **Register the Task**:
   - Add your function to the `functions` list in `app/worker.py`.

```python
functions = [
    # Existing tasks
    webhook_tasks.dispatch_webhook_event,

    # Your new task
    my_module.my_new_task
]
```

3. **Create a Service Method**:
   - Create a method in an appropriate service to queue your task.

```python
async def trigger_my_task(
    self,
    db: AsyncSession,
    background_tasks: BackgroundTasks,
    param1: str,
    param2: int
) -> Dict[str, Any]:
    executor = task_executor_factory(background_tasks)
    await executor.execute(
        "my_new_task",
        {"param1": param1, "param2": param2}
    )
    return {"status": "queued"}
```

## Error Handling

Tasks should handle errors properly to determine if a retry is appropriate:

- **Validation errors**: Should not be retried
- **Connection errors**: Should be retried
- **Unexpected errors**: Should be retried with logging

Example:

```python
try:
    # Task logic
except ValueError:
    # Don't retry for validation errors
    return {"status": "error", "retry": False}
except ConnectionError:
    # Will be retried automatically
    raise
except Exception as e:
    # Log and retry
    logger.error("Unexpected error", error=str(e))
    raise
```

## Health Checks

The ARQ worker health can be monitored via the `/health/worker` endpoint, which:

- Checks Redis connection
- Verifies queue access
- Submits a test task
- Returns information about the Redis instance and queue

## Best Practices

1. **Keep Tasks Small**: Each task should do one thing well
2. **Handle Idempotency**: Tasks should be idempotent (can be run multiple times)
3. **Proper Error Handling**: Distinguish between retriable and non-retriable errors
4. **Log Extensively**: Include important context in logs
5. **Consider Backpressure**: Don't overwhelm external services
6. **Add Monitoring**: Track task execution times and failure rates

## Migration to Vercel Queues (Future Option)

If we decide to migrate to Vercel Queues in the future:

1. Create a new task executor implementation for Vercel Queues
2. Update the task_executor_factory to use the new implementation when appropriate
3. The task interface remains the same, making migration simple

## Deployment Considerations

- **Scaling**: Deploy multiple worker instances for higher throughput
- **Monitoring**: Set up alerts for queue backlogs and worker failures
- **Resource Allocation**: Ensure enough memory for Redis and CPU for workers
- **Failure Recovery**: Have a plan for handling Redis outages
