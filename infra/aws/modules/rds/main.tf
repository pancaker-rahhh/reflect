resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    {
      Name        = "${var.identifier}-vpc"
      Environment = var.environment
    },
    var.tags
  )
}

resource "aws_subnet" "private" {
  count             = length(var.subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(
    {
      Name        = "${var.identifier}-private-subnet-${count.index + 1}"
      Environment = var.environment
    },
    var.tags
  )
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    {
      Name        = "${var.identifier}-igw"
      Environment = var.environment
    },
    var.tags
  )
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.identifier}-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = merge(
    {
      Name        = "${var.identifier}-subnet-group"
      Environment = var.environment
    },
    var.tags
  )
}

resource "aws_security_group" "rds" {
  name        = "${var.identifier}-rds-sg"
  description = "Security group for RDS instance"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
    description = "PostgreSQL access"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = merge(
    {
      Name        = "${var.identifier}-rds-sg"
      Environment = var.environment
    },
    var.tags
  )
}

resource "aws_db_instance" "main" {
  identifier     = var.identifier
  engine         = var.engine
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  max_allocated_storage = var.allocated_storage * 2

  db_name  = var.database_name
  username = var.master_username
  password = var.master_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = true

  backup_retention_period = var.backup_retention_period
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled    = false
  monitoring_interval             = 0

  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.identifier}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  copy_tags_to_snapshot     = true

  deletion_protection = var.environment == "prod" ? true : false
  apply_immediately   = var.environment == "dev" ? true : false

  tags = merge(
    {
      Name        = var.identifier
      Environment = var.environment
    },
    var.tags
  )
}

resource "aws_db_snapshot" "daily" {
  count = 0
  db_instance_identifier = aws_db_instance.main.id
  db_snapshot_identifier = "${var.identifier}-snapshot-${formatdate("YYYY-MM-DD", timestamp())}"

  tags = merge(
    {
      Name        = "${var.identifier}-daily-snapshot"
      Environment = var.environment
    },
    var.tags
  )

  lifecycle {
    ignore_changes = [db_snapshot_identifier]
  }
}