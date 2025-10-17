terraform {
  required_version = ">= 1.6.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "reflectfeedback-terraform-state"
    prefix = "cloud-run"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  type = string
}

variable "service_name" {
  type = string
}

variable "region" {
  type = string
}

variable "image" {
  type = string
}

variable "env_vars" {
  type    = map(string)
  default = {}
}

variable "secrets" {
  type = map(object({
    secret_name = string
    version     = string
  }))
  default = {}
}

module "cloud_run_service" {
  source = "./modules/cloud-run"

  project_id   = var.project_id
  service_name = var.service_name
  region       = var.region
  image        = var.image
  env_vars     = var.env_vars
  secrets      = var.secrets
}

output "service_url" {
  value = module.cloud_run_service.service_url
}
