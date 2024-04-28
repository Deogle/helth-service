provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_service_account" "sa" {
  account_id   = "cloud-run-pubsub-invoker"
  display_name = "Cloud Run Pub/Sub Invoker"
}

resource "google_pubsub_topic" "topic" {
  name = var.name
  labels = {
    environment = var.environment
  }
}

resource "google_cloud_run_service_iam_binding" "binding" {
  location = var.service.location
  service  = var.service.name
  role     = "roles/run.invoker"
  members  = ["serviceAccount:${google_service_account.sa.email}"]
}

resource "google_project_service_identity" "pubsub_agent" {
  provider = google-beta
  project  = var.project_id
  service  = "pubsub.googleapis.com"
}

resource "google_project_iam_binding" "project_token_creator" {
  project = var.project_id
  role    = "roles/iam.serviceAccountTokenCreator"
  members = ["serviceAccount:${google_project_service_identity.pubsub_agent.email}"]
}

resource "google_pubsub_subscription" "subscription" {
  name  = "${var.service.name}-pubsub_subscription"
  topic = google_pubsub_topic.topic.name

  push_config {
    push_endpoint = var.service.url
    oidc_token {
      service_account_email = google_service_account.sa.email
    }
    attributes = {
      x-goog-version = "v1"
    }
  }
  depends_on = [var.service]
}

output "name" {
  value = google_pubsub_topic.topic.id
}
