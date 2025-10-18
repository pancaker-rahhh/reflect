project_id   = "reflect-dev"
service_name = "reflectfeedback"
region       = "us-east4"
image        = ""

env_vars = {
  DEBUG       = "true"
  ENV         = "dev"
  POSTGRES_DB = ""
  POSTGRES_PORT = ""
}

secrets = {
  POSTGRES_HOST = {
    secret_name = ""
    version     = ""
  }
  POSTGRES_USER = {
    secret_name = ""
    version     = ""
  }
  POSTGRES_PASSWORD = {
    secret_name = ""
    version     = ""
  }
  SUPABASE_URL = {
    secret_name = ""
    version     = ""
  }
  SUPABASE_SERVICE_KEY = {
    secret_name = ""
    version     = ""
  }
  SUPABASE_JWT_SECRET = {
    secret_name = ""
    version     = ""
  }
  SUPABASE_WEBHOOK_SECRET = {
    secret_name = ""
    version     = ""
  }
  SUPABASE_ANON_KEY = {
    secret_name = ""
    version     = ""
  }
  R2_ACCESS_KEY_ID = {
    secret_name = ""
    version     = ""
  }
  R2_SECRET_ACCESS_KEY = {
    secret_name = ""
    version     = ""
  }
  R2_BUCKET_NAME = {
    secret_name = ""
    version     = ""
  }
  CDN_BASE_URL = {
    secret_name = ""
    version     = ""
  }
  CDN_ZONE_ID = {
    secret_name = ""
    version     = ""
  }
  CDN_API_TOKEN = {
    secret_name = ""
    version     = ""
  }
  DODO_API_KEY = {
    secret_name = ""
    version     = ""
  }
  DODO_RETURN_URL = {
    secret_name = ""
    version     = ""
  }
  DODO_WEBHOOK_SECRET = {
    secret_name = ""
    version     = ""
  }
  DODO_PRODUCT_ID_PRO_MONTHLY = {
    secret_name = ""
    version     = ""
  }
  DODO_PRODUCT_ID_PRO_YEARLY = {
    secret_name = ""
    version     = ""
  }
}