variable "region" {
  description = "GCP region for the Artifact Registry repository"
  type        = string
}

variable "repository_name" {
  description = "Name of the Artifact Registry repository"
  type        = string
  default     = "reflectfeedback"
}

variable "service_account_email" {
  description = "Service account email for repository access"
  type        = string
}
