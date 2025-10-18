#!/bin/bash

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./create-secrets.sh <env-file> <gcp-project-id>"
  exit 1
fi

ENV_FILE=$1
PROJECT_ID=$2

while IFS='=' read -r key value; do
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue
  
  value=$(echo "$value" | xargs)
  
  if [ -z "$value" ]; then
    echo "Skipping empty value for $key"
    continue
  fi

  secret_name=$(echo "$key" | tr '[:upper:]' '[:lower:]' | tr '_' '-')
  
  echo "Creating secret: $secret_name"
  echo -n "$value" | gcloud secrets create "$secret_name" \
    --project="$PROJECT_ID" \
    --data-file=- 2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo "✓ Created $secret_name"
  else
    echo "Updating $secret_name"
    echo -n "$value" | gcloud secrets versions add "$secret_name" \
      --project="$PROJECT_ID" \
      --data-file=-
  fi
done < "$ENV_FILE"

echo "Done!"