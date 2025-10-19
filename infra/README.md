# Infrastructure Setup Guide

## Prerequisites

Before setting up the infrastructure, ensure you have:

1. **Google Cloud CLI** installed and authenticated
   ```bash
   gcloud auth login
   gcloud config set project <your-project-id>
   ```

2. **Terraform** installed (v1.6.0+)
   ```bash
   terraform --version
   ```

3. **Environment file** with secrets (`.env` format)

---

## Setup Steps for New Developers

### 0. Enable Required GCP APIs

**IMPORTANT:** Enable these APIs before running any scripts or CI/CD workflows to avoid authentication and permission errors.

#### For Local Development & CLI Operations:

```bash
# Set your project
gcloud config set project <your-project-id>

# Enable all required APIs
gcloud services enable \
  secretmanager.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  compute.googleapis.com \
  --project=<your-project-id>
```

#### For CI/CD (GitHub Actions):

The service account created in step 2 needs these APIs enabled in the project:

- **Secret Manager API** (`secretmanager.googleapis.com`) - Store and access secrets
- **Cloud Run API** (`run.googleapis.com`) - Deploy containerized services
- **Artifact Registry API** (`artifactregistry.googleapis.com`) - Store Docker images
- **Cloud Build API** (`cloudbuild.googleapis.com`) - Build and push Docker images
- **Compute Engine API** (`compute.googleapis.com`) - Cloud Run backend dependency

**After enabling APIs, wait 1-2 minutes for changes to propagate.**

#### Create Artifact Registry Repository:

```bash
# Create Docker repository for your images
gcloud artifacts repositories create reflectfeedback \
  --repository-format=docker \
  --location=us-east4 \
  --project=<your-project-id> \
  --description="Docker images for Reflect API"

# Verify creation
gcloud artifacts repositories list --project=<your-project-id>
```

**Do this for both dev and prod projects:**
- `reflect-dev` (development environment)
- `<your-prod-project-id>` (production environment)

### 1. Create GCP Secrets

Use the `seed-secrets.sh` script to upload secrets to GCP Secret Manager:

```bash
cd infra/scripts
./seed-secrets.sh <path-to-env-file> <gcp-project-id>
```

**Example:**
```bash
./seed-secrets.sh ../../api/server/.env.prod corded-nature-474915-q9
```

**What it does:**
- Reads key-value pairs from your `.env` file
- Converts variable names to lowercase with dashes (e.g., `POSTGRES_HOST` → `postgres-host`)
- Creates secrets in GCP Secret Manager
- Updates existing secrets if they already exist

**Required secrets for production:**
- `postgres-host`
- `postgres-user`
- `postgres-password`
- `supabase-url`
- `supabase-service-key`
- `supabase-jwt-secret`
- `supabase-webhook-secret`
- `supabase-anon-key`
- `r2-access-key-id`
- `r2-secret-access-key`
- `r2-bucket-name`
- `cdn-base-url`
- `cdn-zone-id`
- `cdn-api-token`
- `dodo-api-key`
- `dodo-return-url`
- `dodo-webhook-secret`
- `dodo-product-id-pro-monthly`
- `dodo-product-id-pro-yearly`

### 2. Setup CI/CD Service Account

Create a fine-grained service account for GitHub Actions:

```bash
cd infra/scripts
./setup-ci-cd-permissions.sh
```

Follow the prompts to:
1. Provide required values (project ID, service account name, etc.)
2. Create a service account key (command provided by script)
3. Copy the key JSON for GitHub secrets

### 3. Configure GitHub Secrets

Go to **Settings → Environments** and create two environments:

#### **`production` Environment:**
- `PROD_DATABASE_URL` - Full PostgreSQL connection string
- `PROD_GCP_SERVICE_ACCOUNT_KEY` - JSON key from step 2
- `PROD_GCP_PROJECT_ID` - Your GCP project ID
- `PROD_DOCKER_IMAGE_TAG` - Format: `us-east4-docker.pkg.dev/<project-id>/<repo>/<image-name>`

#### **`dev` Environment:**
- `DEV_DATABASE_URL` - Dev database connection string
- `DEV_GCP_SERVICE_ACCOUNT_KEY` - JSON key from step 2 (for dev project)
- `DEV_GCP_PROJECT_ID` - Your dev GCP project ID (e.g., `reflect-dev-473413`)
- `DEV_DOCKER_IMAGE_TAG` - Format: `us-east4-docker.pkg.dev/<dev-project-id>/reflectfeedback/api`

**Optional (if using Railway for dev):**
- `RAILWAY_DEPLOYMENT_TOKEN` - Railway deployment token
- `RAILWAY_SERVICE_NAME` - Railway service name

### 4. Initialize Terraform

```bash
cd infra
terraform init
```

### 5. Review and Deploy

**For development:**
```bash
terraform plan -var-file=environments/dev/terraform.tfvars
terraform apply -var-file=environments/dev/terraform.tfvars
```

**For production:**
```bash
terraform plan -var-file=environments/prod/terraform.tfvars
terraform apply -var-file=environments/prod/terraform.tfvars
```

---

## CI/CD Workflows

### Production Deployment (prod branch)
Triggers on push to `prod` branch:
1. Runs Alembic migrations on production database
2. Builds Docker image for AMD64
3. Pushes to GCP Artifact Registry
4. Deploys to Cloud Run via Terraform

### Dev Deployment (main branch)
Triggers on push to `main` branch:
1. Runs Alembic migrations on dev database
2. Builds Docker image for AMD64
3. Pushes to GCP Artifact Registry (dev project)
4. Deploys to Cloud Run via Terraform (dev environment)

### Railway Deployment (main branch)
Legacy workflow - triggers on push to `main` branch:
1. Runs Alembic migrations on dev database
2. Deploys to Railway

---

## Troubleshooting

### API not enabled errors
If you see errors like "API has not been used in project before or it is disabled":

```bash
# Enable the specific API
gcloud services enable <api-name>.googleapis.com --project=<project-id>

# Wait 1-2 minutes for propagation
```

Common APIs:
- `secretmanager.googleapis.com`
- `artifactregistry.googleapis.com`
- `run.googleapis.com`
- `cloudbuild.googleapis.com`

### Secrets not found
Verify secrets exist in GCP Secret Manager:
```bash
gcloud secrets list --project=<project-id>
```

### Terraform state issues
State is stored in GCS bucket `reflectfeedback-terraform-state` (prod) or `reflectfeedback-dev-terraform-state` (dev). Ensure service account has access.

### Database connection errors
Ensure `DATABASE_URL` format is correct:
```
postgresql+asyncpg://<user>:<password>@<host>:<port>/<database>?ssl=true
```

### Docker push failed to Artifact Registry
Ensure:
1. Artifact Registry API is enabled
2. Repository exists: `gcloud artifacts repositories list --project=<project-id>`
3. Service account has `artifactregistry.writer` role

---

## Custom Domain Setup (Optional)

To use `api.reflectfeedback.com`:

1. Add to `environments/prod/terraform.tfvars`:
   ```hcl
   custom_domain = "api.reflectfeedback.com"
   ```

2. After deployment, add DNS record:
   ```
   Type:   CNAME
   Name:   api.reflectfeedback.com
   Target: ghs.googlehosted.com
   ```

3. Wait for DNS propagation and Google domain verification (~5-10 minutes)