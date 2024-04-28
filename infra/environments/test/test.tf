locals {
  region     = "us-central1"
  project_id = "helth-service-test"
}

provider "google" {
  project = var.project_id
  region  = local.region
}


## Services
module "api_service" {
  source = "../../services/api"

  region      = local.region
  environment = var.environment
  project_id  = var.project_id
  image_name  = "us-docker.pkg.dev/helth-service-test/helth-ar/api:latest"
}

module "fe" {
  source = "../../services/fe"

  region      = local.region
  environment = var.environment
  project_id  = var.project_id
  image_name  = "us-docker.pkg.dev/helth-service-test/helth-ar/fe:latest"
  api_url     = module.api_service.url
}

module "discord_client" {
  source = "../../services/discord-client"

  region      = local.region
  project_id  = var.project_id
  environment = var.environment
  image_name  = "us-docker.pkg.dev/helth-service-test/helth-ar/client:latest"
  api_url     = module.api_service.url

  discord_bot_token     = var.discord_bot_token
  discord_client_id     = var.discord_client_id
  discord_client_secret = var.discord_client_secret
}

module "pubsub_topic" {
  source = "../../services/pubsub-topic"

  region      = local.region
  project_id  = var.project_id
  environment = var.environment
  name        = "helth-service-pubsub-topic"
  service = {
    name     = module.discord_client.name
    url      = "${module.discord_client.url}/webhook"
    location = local.region
  }
}

output "api_url" {
  value = module.api_service.url
}

output "discord_client_url" {
  value = module.discord_client.url
}

output "fe_url" {
  value = module.fe.url
}
