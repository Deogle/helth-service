locals {
  environment = "shared"
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_ecr_repository" "helth_service_api" {
  name = "helth_service_api"
  tags = {
    environment = local.environment
  }
}

resource "aws_ecr_repository" "helth_service_frontend" {
  name = "helth_service_frontend"
  tags = {
    environment = local.environment
  }
}

resource "aws_ecr_repository" "helth_service_discord_client" {
  name = "helth_service_discord_client"
  tags = {
    environment = local.environment
  }
}

resource "aws_ecs_cluster" "helth_service_test_cluster" {
  name = "helth_service_test_cluster"
  tags = {
    environment = local.environment
  }
}

output "ecs_cluster_id" {
  value = aws_ecs_cluster.helth_service_test_cluster.id
}

output "helth_service_api_repository_url" {
  value = aws_ecr_repository.helth_service_api.repository_url
}

output "helth_service_frontend_repository_url" {
  value = aws_ecr_repository.helth_service_frontend.repository_url
}

output "helth_service_discord_client_repository_url" {
  value = aws_ecr_repository.helth_service_discord_client.repository_url
}
