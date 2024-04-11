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

module "api_service" {
  source = "../../services/api"

  vpc_id              = var.vpc_id
  security_group_id   = var.security_group_id
  exec_role_arn       = var.exec_role_arn
  ecs_cluster_id      = data.terraform_remote_state.shared.outputs.ecs_cluster_id
  ssl_certificate_arn = var.ssl_certificate_arn
  environment         = var.environment
}
module "discord_client" {
  source = "../../services/discord-client"

  vpc_id            = var.vpc_id
  security_group_id = var.security_group_id
  exec_role_arn     = var.exec_role_arn
  ecs_cluster_id    = data.terraform_remote_state.shared.outputs.ecs_cluster_id
  environment       = var.environment
  api_url           = var.api_url
}

module "fe" {
  source = "../../services/fe"

  vpc_id              = var.vpc_id
  security_group_id   = var.security_group_id
  exec_role_arn       = var.exec_role_arn
  ecs_cluster_id      = data.terraform_remote_state.shared.outputs.ecs_cluster_id
  ssl_certificate_arn = var.ssl_certificate_arn
  environment         = var.environment
  api_url             = var.api_url
}

output "fe_dns_name" {
  value = module.fe.dns_name
}
