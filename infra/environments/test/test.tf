provider "aws" {
  region = "us-east-1"
}

data "terraform_remote_state" "shared" {
  backend = "s3"
  config = {
    bucket = "helth-service-state-bucket"
    key    = "shared/terraform.tfstate"
    region = "us-east-1"
  }
}

resource "aws_secretsmanager_secret" "discord_bot_token" {
  name                           = "helth_service_test_discord_bot_token"
  force_overwrite_replica_secret = false
  tags = {
    environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "discord_bot_token" {
  secret_id     = aws_secretsmanager_secret.discord_bot_token.id
  secret_string = var.discord_bot_token
}

resource "aws_secretsmanager_secret" "discord_client_id" {
  name                           = "helth_service_test_discord_client_id"
  force_overwrite_replica_secret = false
  tags = {
    environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "discord_client_id" {
  secret_id     = aws_secretsmanager_secret.discord_client_id.id
  secret_string = var.discord_client_id
}

resource "aws_secretsmanager_secret" "discord_client_secret" {
  name                           = "helth_service_test_discord_client_secret"
  force_overwrite_replica_secret = false
  tags = {
    environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "discord_client_secret" {
  secret_id     = aws_secretsmanager_secret.discord_client_secret.id
  secret_string = var.discord_client_secret
}

# module "api_service" {
#   source = "../../services/api"

#   vpc_id            = var.vpc_id
#   security_group_id = var.security_group_id
#   exec_role_arn     = var.exec_role_arn
#   ecs_cluster_id    = data.terraform_remote_state.shared.outputs.ecs_cluster_id
#   environment       = var.environment
# }

# module "discord_client" {
#   source = "../../services/discord-client"

#   vpc_id                    = var.vpc_id
#   security_group_id         = var.security_group_id
#   exec_role_arn             = var.exec_role_arn
#   ecs_cluster_id            = data.terraform_remote_state.shared.outputs.ecs_cluster_id
#   environment               = var.environment
#   discord_bot_token_arn     = aws_secretsmanager_secret_version.discord_bot_token.arn
#   discord_client_id_arn     = aws_secretsmanager_secret_version.discord_client_id.arn
#   discord_client_secret_arn = aws_secretsmanager_secret_version.discord_client_secret.arn
#   api_url                   = "test"
# }
