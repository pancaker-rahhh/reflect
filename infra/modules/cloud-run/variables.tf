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