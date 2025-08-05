resource "aws_ecr_repository" "reflect_api" {
  name                 = "reflect-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "Reflect-API-Repository"
  }
}

resource "aws_ecr_repository" "reflect_web" {
  name                 = "reflect-web"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "Reflect-Web-Repository"
  }
}

resource "aws_ecr_lifecycle_policy" "reflect_api_policy" {
  repository = aws_ecr_repository.reflect_api.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 5 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "reflect_web_policy" {
  repository = aws_ecr_repository.reflect_web.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 5 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

output "api_repository_url" {
  description = "URL of the API ECR repository"
  value       = aws_ecr_repository.reflect_api.repository_url
}

output "web_repository_url" {
  description = "URL of the Web ECR repository"
  value       = aws_ecr_repository.reflect_web.repository_url
}
