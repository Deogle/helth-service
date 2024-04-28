locals {
  region     = "us-central1"
  project_id = "helth-service-test"
}

provider "google" {
  project = var.project_id
  region  = local.region
}

module "api_service" {
  source = "../../services/api"

  region      = local.region
  environment = var.environment
  project_id  = var.project_id
  image_name  = "us-docker.pkg.dev/helth-service-test/helth-ar/api:latest"
}

# module "discord_client" {
#   source = "../../services/discord-client"
#
#   vpc_id            = var.vpc_id
#   security_group_id = var.security_group_id
#   exec_role_arn     = var.exec_role_arn
#   ecs_cluster_id    = data.terraform_remote_state.shared.outputs.ecs_cluster_id
#   environment       = var.environment
#   api_url           = var.api_url
# }
#
module "fe" {
  source = "../../services/fe"

  region      = local.region
  environment = var.environment
  project_id  = var.project_id
  image_name  = "us-docker.pkg.dev/helth-service-test/helth-ar/fe:latest"
  api_url     = module.api_service.url
}
#
output "api_url" {
  value = module.api_service.url
}
