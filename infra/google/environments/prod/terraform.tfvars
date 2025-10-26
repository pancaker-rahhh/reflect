project_id            = "corded-nature-474915-q9"
service_name          = "reflectfeedback"
region                = "us-east4"
image                 = "us-east4-docker.pkg.dev/corded-nature-474915-q9/reflectfeedback/app:latest"
bucket_name           = "reflectfeedback-terraform-state"
service_account_email = "reflectfeedback-runtime@corded-nature-474915-q9.iam.gserviceaccount.com"
custom_domain         = "api.reflectfeedback.com"

env_vars = {
  DEBUG         = "false"
  ENV           = "production"
  POSTGRES_DB   = "reflectfeedback"
  POSTGRES_PORT = "5432"
}

secrets = {
  POSTGRES_HOST = {
    secret_name = "postgres-host"
    version     = "latest"
  }
  POSTGRES_USER = {
    secret_name = "postgres-user"
    version     = "latest"
  }
  POSTGRES_PASSWORD = {
    secret_name = "postgres-password"
    version     = "latest"
  }
  SUPABASE_URL = {
    secret_name = "supabase-url"
    version     = "latest"
  }
  SUPABASE_SERVICE_KEY = {
    secret_name = "supabase-service-key"
    version     = "latest"
  }
  SUPABASE_JWT_SECRET = {
    secret_name = "supabase-jwt-secret"
    version     = "latest"
  }
  SUPABASE_WEBHOOK_SECRET = {
    secret_name = "supabase-webhook-secret"
    version     = "latest"
  }
  SUPABASE_ANON_KEY = {
    secret_name = "supabase-anon-key"
    version     = "latest"
  }
  R2_ACCESS_KEY_ID = {
    secret_name = "r2-access-key-id"
    version     = "latest"
  }
  R2_SECRET_ACCESS_KEY = {
    secret_name = "r2-secret-access-key"
    version     = "latest"
  }
  R2_BUCKET_NAME = {
    secret_name = "r2-bucket-name"
    version     = "latest"
  }
  CDN_BASE_URL = {
    secret_name = "cdn-base-url"
    version     = "latest"
  }
  CDN_ZONE_ID = {
    secret_name = "cdn-zone-id"
    version     = "latest"
  }
  CDN_API_TOKEN = {
    secret_name = "cdn-api-token"
    version     = "latest"
  }
  DODO_API_KEY = {
    secret_name = "dodo-api-key"
    version     = "latest"
  }
  DODO_RETURN_URL = {
    secret_name = "dodo-return-url"
    version     = "latest"
  }
  DODO_WEBHOOK_SECRET = {
    secret_name = "dodo-webhook-secret"
    version     = "latest"
  }
  DODO_PRODUCT_ID_PRO_MONTHLY = {
    secret_name = "dodo-product-id-pro-monthly"
    version     = "latest"
  }
  DODO_PRODUCT_ID_PRO_YEARLY = {
    secret_name = "dodo-product-id-pro-yearly"
    version     = "latest"
  }
}
