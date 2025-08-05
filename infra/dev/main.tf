resource "aws_default_vpc" "default" {
  tags = {
    Name = "Reflect"
  }
}

data "aws_subnet" "default" {
  vpc_id            = aws_default_vpc.default.id
  availability_zone = "ap-south-1a"
  default_for_az    = true
}

data "aws_internet_gateway" "default" {
  filter {
    name   = "attachment.vpc-id"
    values = [aws_default_vpc.default.id]
  }
}

resource "aws_security_group" "reflect_sg" {
  name        = "reflect-security-group"
  description = "Security group for Reflect instance"
  vpc_id      = aws_default_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Reflect-SG"
  }
}

resource "aws_instance" "reflect_instance" {
  ami                    = "ami-0e35ddab05955cf57"
  instance_type          = "t2.micro"
  key_name               = "pancake"
  subnet_id              = data.aws_subnet.default.id
  vpc_security_group_ids = [aws_security_group.reflect_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_github_runner_profile.name

  associate_public_ip_address = true

  root_block_device {
    volume_type = "gp3"
    volume_size = 25
    encrypted   = true

    tags = {
      Name = "Reflect-Root-Volume"
    }
  }

  credit_specification {
    cpu_credits = "standard"
  }

  tags = {
    Name = "Reflect-Dev"
  }
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.reflect_instance.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.reflect_instance.public_dns
}

output "ssh_connection_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i pancake.pem ec2-user@${aws_instance.reflect_instance.public_ip}"
}
