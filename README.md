# Reflect 🪞

> This is the forge.<br>
> Where mirrors burn and masks don't stick.<br>
> We gut the noise,<br>
> Name the lie,<br>
> Sharpen the self.<br>
> Then hand you the blade.

## Pre-commit Setup Instructions

To ensure code quality and consistency, this project uses [pre-commit](https://pre-commit.com/) hooks. Follow these steps to set up pre-commit in your development environment:

### 1. Install Pre-commit

```sh
pip install pre-commit
```

### 2. Verify Pre-commit Installation

```sh
pre-commit --version
```

### 3. Install the Pre-commit Hooks

Run this command in the root of your repository to install the hooks defined in `.pre-commit-config.yaml`:

```sh
pre-commit install
```

### 4. Run All Hooks on All Files (Optional)

To check and fix all files in the repository with the configured hooks, run:

```sh
pre-commit run --all-files
```

### 5. Docker Requirement

Some hooks (such as Dockerfile linting) require Docker to be installed and running on your system.
[Download Docker Desktop](https://www.docker.com/products/docker-desktop/) if you don't have it already.

---

## CDN Server Setup

To test widgets in external environments, you can run a local CDN server that serves widgets with proper CSS inlining.

### Quick Start

```sh
cd client
./start-cdn.sh
```

The CDN server will start on `http://localhost:3001` and automatically:
- Install dependencies if needed
- Enable CSS inlining for perfect styling
- Set up proper CORS headers
- Provide caching and compression

### Manual Setup

If you prefer to set up the CDN server manually:

```sh
cd client/cdn-server
npm install
npm start
```

### Available Endpoints

- **Health Check**: `http://localhost:3001/health`
- **Loader Script**: `http://localhost:3001/cdn/loader.js`
- **Widget Config**: `http://localhost:3001/cdn/widgets/{widgetId}/config.json`
- **Versioned Widgets**: `http://localhost:3001/cdn/widgets/{widgetId}/v{version}/widget.js`

---

## Client Setup

