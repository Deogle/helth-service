locals {
  region = "us-central1"
}

provider "google" {
  project = var.project_id
  region  = local.region
}

## Services
module "api_service" {
  source = "../../services/api"

  region       = local.region
  environment  = var.environment
  project_id   = var.project_id
  image_name   = "us-docker.pkg.dev/helth-service-test/helth-ar/api:latest"
  pubsub_topic = module.pubsub_topic.name
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
  sa          = module.pubsub_topic.sa
}

module "pubsub_topic" {
  source = "../../services/pubsub-topic"

  region      = local.region
  project_id  = var.project_id
  environment = var.environment
  name        = "helth-service-pubsub-topic-${var.environment}"
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
