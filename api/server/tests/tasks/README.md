# ARQ Task Queue Testing

This directory contains tests for the ARQ task queue implementation in the Reflect API.

## Setup

Make sure you have the following prerequisites installed:

- Python 3.9+
- Poetry
- Docker and Docker Compose

## Running Unit Tests

From the `api/server` directory, run:

```bash
poetry install
poetry run pytest tests/tasks -v
```

This will run all the unit tests for the ARQ task queue implementation.

## Running Integration Tests

To run the integration tests, you need to have Redis running. The tests will use database 9 in Redis to avoid conflicts with your development environment.

1. Start Redis:

```bash
docker-compose -f docker-compose.dev.yml up redis -d
```

2. Run the integration tests:

```bash
poetry run pytest tests/tasks -m integration -v
```

## Manual Testing with Postman

A Postman collection (`arq_testing.postman_collection.json`) is provided for manual testing of the ARQ task queue implementation. Import this collection into Postman to get started.

1. Start the development environment:

```bash
docker-compose -f docker-compose.dev.yml up
```

2. Import the Postman collection:
   - Open Postman
   - Click "Import" button
   - Select the `arq_testing.postman_collection.json` file

3. Update the variables in the collection:
   - `base_url`: The base URL of your API (default: `http://localhost:8000`)
   - `integration_id`: ID of an integration to test with
   - `feedback_id`: ID of a feedback item to test with
   - `project_id`: ID of a project to test with

4. Run the requests in the collection to test the various aspects of the ARQ task queue implementation.

## Testing Error Handling and Retries

To test error handling and retry mechanisms:

1. Use the "Trigger Error Task" request in the Postman collection to create tasks that will fail.
2. Monitor the logs to see how the errors are handled and retried.

Example error types:
- `connection_error`: Simulates a connection error (will be retried)
- `validation_error`: Simulates a validation error (will not be retried)

## Load Testing

To test performance under load:

1. Use the "Queue Multiple Tasks" request in the Postman collection to create multiple tasks at once.
2. Monitor Redis and worker logs to see how the tasks are processed.
3. For more advanced load testing, you can use tools like k6:

```bash
# Example k6 script
k6 run --vus 10 --duration 30s load-test.js
```

## Monitoring Worker Health

Use the "Worker Health Check" request in the Postman collection to monitor the health of the ARQ worker.

This endpoint provides information about:
- Redis connection status
- Queue size
- Task execution capability

## Best Practices for Testing Tasks

1. Always mock external dependencies in unit tests
2. Use the test Redis database (9) for integration tests
3. Clean up after tests to avoid contaminating the test environment
4. Test both success and failure scenarios
5. Test retry mechanisms by simulating failures
