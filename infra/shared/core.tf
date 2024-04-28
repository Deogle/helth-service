locals {
  environment = "shared"
  region      = "us"
  project_id  = "helth-service-test"
}

provider "google" {
  project = local.project_id
  region  = local.region
}

# Required services
variable "gcp-service-list" {
  description = "The list of apis necessary for the project"
  type        = list(string)
  default = [
    "artifactregistry.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
  ]
}

resource "google_project_service" "gcp-services" {
  for_each = toset(var.gcp-service-list)
  project  = local.project_id
  service  = each.key
}

resource "google_storage_bucket" "helth-tf-state" {
  name     = "helth-tf-state"
  location = local.region
  labels = {
    environment = local.environment
  }
}

resource "google_artifact_registry_repository" "helth-ar" {
  location      = local.region
  repository_id = "helth-ar"
  description   = "Helth Service Artifact Registry"
  format        = "DOCKER"

  docker_config {
    immutable_tags = true
  }
}
