data "aws_iam_policy_document" "github_oidc_trust_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    actions = ["sts:AssumeRoleWithWebIdentity"]

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:keshavrathinavel/Reflect:*"]
    }
  }
}

data "aws_iam_policy_document" "ec2_assume_role_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "github_actions_policy" {
  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com"
  ]

  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd"
  ]

  tags = {
    Name = "GitHub-OIDC-Provider"
  }
}

resource "aws_iam_role" "github_actions_role" {
  name               = "GitHubActionsRole"
  assume_role_policy = data.aws_iam_policy_document.github_oidc_trust_policy.json

  tags = {
    Name = "GitHub-Actions-Role"
  }
}

resource "aws_iam_policy" "github_actions_policy" {
  name        = "GitHubActionsPolicy"
  description = "Policy for GitHub Actions CI/CD"
  policy      = data.aws_iam_policy_document.github_actions_policy.json
}

resource "aws_iam_role_policy_attachment" "github_actions_policy_attachment" {
  role       = aws_iam_role.github_actions_role.name
  policy_arn = aws_iam_policy.github_actions_policy.arn
}

resource "aws_iam_role" "ec2_github_runner_role" {
  name               = "EC2GitHubRunnerRole"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role_policy.json

  tags = {
    Name = "EC2-GitHub-Runner-Role"
  }
}

resource "aws_iam_role_policy_attachment" "ec2_runner_policy_attachment" {
  role       = aws_iam_role.ec2_github_runner_role.name
  policy_arn = aws_iam_policy.github_actions_policy.arn
}

resource "aws_iam_instance_profile" "ec2_github_runner_profile" {
  name = "EC2GitHubRunnerProfile"
  role = aws_iam_role.ec2_github_runner_role.name
}

output "github_actions_role_arn" {
  description = "ARN of the GitHub Actions role for OIDC"
  value       = aws_iam_role.github_actions_role.arn
}

output "ec2_instance_profile_name" {
  description = "Name of the EC2 instance profile"
  value       = aws_iam_instance_profile.ec2_github_runner_profile.name
}

output "oidc_provider_arn" {
  description = "ARN of the GitHub OIDC provider"
  value       = aws_iam_openid_connect_provider.github.arn
}
