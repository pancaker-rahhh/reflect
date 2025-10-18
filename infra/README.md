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

3. **Required GCP APIs enabled:**
   - Cloud Run API
   - Secret Manager API
   - Container Registry API
   - Artifact Registry API

4. **Environment file** with secrets (`.env` format)

---

## Setup Steps for New Developers

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
- `RAILWAY_DEPLOYMENT_TOKEN` - Railway deployment token (if using Railway)
- `RAILWAY_SERVICE_NAME` - Railway service name (if using Railway)

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
2. Deploys to Railway

---

## Troubleshooting

### Secrets not found
Verify secrets exist in GCP Secret Manager:
```bash
gcloud secrets list --project=<project-id>
```

### Terraform state issues
State is stored in GCS bucket `reflectfeedback-terraform-state`. Ensure service account has access.

### Database connection errors
Ensure `DATABASE_URL` format is correct:
```
postgresql+asyncpg://<user>:<password>@<host>:<port>/<database>?ssl=true
```

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