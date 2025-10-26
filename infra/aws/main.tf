terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "local" {
    path = "terraform-aws.tfstate"
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "environment" {
  type        = string
  description = "Environment (dev, prod)"
}

variable "db_identifier" {
  type        = string
  description = "Database identifier"
}

variable "db_engine" {
  type        = string
  description = "Database engine"
  default     = "postgres"
}

variable "db_engine_version" {
  type        = string
  description = "Database engine version"
  default     = "16.3"
}

variable "db_name" {
  type        = string
  description = "Initial database name"
}

variable "db_master_username" {
  type        = string
  description = "Master username"
}

variable "db_master_password" {
  type        = string
  description = "Master password"
  sensitive   = true
}

variable "availability_zones" {
  type        = list(string)
  description = "Availability zones"
}

variable "allowed_cidr_blocks" {
  type        = list(string)
  description = "CIDR blocks allowed to connect"
  default     = ["0.0.0.0/0"]
}

module "rds" {
  source = "./modules/rds"

  identifier      = var.db_identifier
  engine          = var.db_engine
  engine_version  = var.db_engine_version
  instance_class  = "db.t4g.micro"
  database_name   = var.db_name
  master_username = var.db_master_username
  master_password = var.db_master_password

  availability_zones    = var.availability_zones
  allowed_cidr_blocks   = var.allowed_cidr_blocks
  backup_retention_period = 7

  environment = var.environment

  tags = {
    ManagedBy = "terraform"
    Project   = "reflectfeedback"
  }
}

output "db_endpoint" {
  description = "Database endpoint"
  value       = module.rds.db_instance_endpoint
}

output "db_connection_string" {
  description = "Database connection string"
  value       = module.rds.connection_string
  sensitive   = true
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.rds.vpc_id
}