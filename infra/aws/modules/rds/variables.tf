variable "identifier" {
  type        = string
  description = "Database identifier"
}

variable "engine" {
  type        = string
  description = "Database engine (postgres, mysql, mariadb)"
}

variable "engine_version" {
  type        = string
  description = "Database engine version"
}

variable "instance_class" {
  type        = string
  description = "Instance class (db.t4g.micro for smallest)"
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  type        = number
  description = "Allocated storage in GB"
  default     = 20
}

variable "database_name" {
  type        = string
  description = "Initial database name"
}

variable "master_username" {
  type        = string
  description = "Master username"
}

variable "master_password" {
  type        = string
  description = "Master password"
  sensitive   = true
}

variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR block"
  default     = "10.0.0.0/16"
}

variable "subnet_cidrs" {
  type        = list(string)
  description = "Subnet CIDR blocks"
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "availability_zones" {
  type        = list(string)
  description = "Availability zones for subnets"
}

variable "backup_retention_period" {
  type        = number
  description = "Backup retention period in days"
  default     = 7
}

variable "allowed_cidr_blocks" {
  type        = list(string)
  description = "CIDR blocks allowed to connect to RDS"
  default     = ["0.0.0.0/0"]
}

variable "environment" {
  type        = string
  description = "Environment name (dev, prod)"
}

variable "tags" {
  type        = map(string)
  description = "Additional tags"
  default     = {}
}