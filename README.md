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

## Client Setup

