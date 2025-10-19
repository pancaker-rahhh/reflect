#!/bin/bash
set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./setup-runtime-service-account.sh <gcp-project-id> <service-name>"
  echo "Example: ./setup-runtime-service-account.sh reflect-dev-473413 reflectfeedback"
  exit 1
fi

PROJECT_ID="$1"
SERVICE_NAME="$2"
RUNTIME_SA_NAME="${SERVICE_NAME}-runtime"
RUNTIME_SA_EMAIL="${RUNTIME_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "=== Setting up Cloud Run Runtime Service Account ==="
echo ""

if gcloud iam service-accounts describe ${RUNTIME_SA_EMAIL} --project=${PROJECT_ID} &>/dev/null; then
  echo "✓ Service account already exists: ${RUNTIME_SA_EMAIL}"
else
  echo "Creating service account: ${RUNTIME_SA_EMAIL}"
  gcloud iam service-accounts create ${RUNTIME_SA_NAME} \
    --display-name="${SERVICE_NAME} Cloud Run Runtime" \
    --project=${PROJECT_ID}
  echo "✓ Service account created successfully"
fi

echo ""
echo "=== Granting Secret Manager Access ==="
echo ""

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${RUNTIME_SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"

echo ""
echo "✅ Runtime service account configured successfully!"
echo ""
echo "Service Account: ${RUNTIME_SA_EMAIL}"
echo "Role: roles/secretmanager.secretAccessor"
echo ""
echo "Add this to your terraform.tfvars:"
echo "service_account_email = \"${RUNTIME_SA_EMAIL}\""
echo ""