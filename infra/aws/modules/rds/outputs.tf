output "db_instance_endpoint" {
  description = "Database endpoint"
  value       = aws_db_instance.main.endpoint
}

output "db_instance_address" {
  description = "Database address"
  value       = aws_db_instance.main.address
}

output "db_instance_port" {
  description = "Database port"
  value       = aws_db_instance.main.port
}

output "db_instance_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "db_instance_username" {
  description = "Database master username"
  value       = aws_db_instance.main.username
  sensitive   = true
}

output "db_instance_arn" {
  description = "Database ARN"
  value       = aws_db_instance.main.arn
}

output "connection_string" {
  description = "PostgreSQL connection string"
  value       = "postgresql://${aws_db_instance.main.username}:${var.master_password}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
  sensitive   = true
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.rds.id
}