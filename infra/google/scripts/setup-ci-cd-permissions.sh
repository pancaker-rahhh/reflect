#!/bin/bash
set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./setup-ci-cd-permissions.sh <gcp-project-id> <service-account-name>"
  exit 1
fi

PROJECT_ID="$1"
SERVICE_ACCOUNT_NAME="$2"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "=== Setting up CI/CD Service Account ==="
echo ""

# Check if service account exists, create if not
if gcloud iam service-accounts describe ${SERVICE_ACCOUNT_EMAIL} --project=${PROJECT_ID} &>/dev/null; then
  echo "✓ Service account already exists: ${SERVICE_ACCOUNT_EMAIL}"
else
  echo "Creating service account: ${SERVICE_ACCOUNT_EMAIL}"
  gcloud iam service-accounts create ${SERVICE_ACCOUNT_NAME} \
    --display-name="GitHub Actions CI/CD" \
    --project=${PROJECT_ID}
  echo "✓ Service account created successfully"
fi

echo ""
echo "=== Granting IAM Permissions ==="
echo ""

# 1. Artifact Registry - Push Docker images
echo "Granting Artifact Registry Writer..."
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/artifactregistry.writer"

# 2. Cloud Run - Deploy and manage services
echo "Granting Cloud Run Admin..."
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/run.admin"

# 3. Service Account User - Act as Cloud Run runtime service account
echo "Granting Service Account User..."
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

# 4. Storage Admin - Manage Terraform state bucket
echo "Granting Storage Admin..."
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/storage.admin"

# 5. Secret Manager Accessor - Allow Cloud Run to access secrets
echo "Granting Secret Manager Accessor (for secret binding)..."
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"

echo ""
echo "✅ All permissions granted successfully!"
echo ""
echo "Summary of roles granted to ${SERVICE_ACCOUNT_EMAIL}:"
echo "  - roles/artifactregistry.writer       (Push Docker images)"
echo "  - roles/run.admin                     (Deploy Cloud Run services)"
echo "  - roles/iam.serviceAccountUser        (Act as service accounts)"
echo "  - roles/storage.admin                 (Manage Terraform state)"
echo "  - roles/secretmanager.secretAccessor  (Bind secrets to Cloud Run)"
echo ""
echo "========================================="
echo "Next Steps:"
echo "========================================="
echo ""
echo "1. Create service account key:"
echo "   gcloud iam service-accounts keys create key.json --iam-account=${SERVICE_ACCOUNT_EMAIL}"
echo ""
echo "2. Add key to GitHub Secrets:"
echo "   - Secret name: <ENV>_GCP_SERVICE_ACCOUNT_KEY (e.g., PROD_GCP_SERVICE_ACCOUNT_KEY)"
echo "   - Secret value: Paste entire contents of key.json"
echo ""
echo "3. Delete the key file locally (IMPORTANT for security):"
echo "   rm key.json"
echo ""

