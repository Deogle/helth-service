locals {
  service_name = "helth-service-api-${var.environment}"
  project_id   = "helth-service-test"
}

resource "random_uuid" "container_uuid" {
}

data "google_secret_manager_secret_version" "gcloud_email" {
  secret = "gcloud-client-email-${var.environment}"
}

data "google_secret_manager_secret_version" "gcloud_private_key" {
  secret = "gcloud-private-key-${var.environment}"
}

data "google_secret_manager_secret_version" "whoop_client_id" {
  secret = "whoop-client-id-${var.environment}"
}

data "google_secret_manager_secret_version" "whoop_client_secret" {
  secret = "whoop-client-secret-${var.environment}"
}

data "google_secret_manager_secret_version" "whoop_redirect_url" {
  secret = "whoop-redirect-url-${var.environment}"
}

resource "google_cloud_run_v2_service" "helth_service_api" {
  name     = local.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"
  labels = {
    environment = var.environment
  }

  template {
    scaling {
      max_instance_count = 1
      min_instance_count = 0
    }

    containers {
      name  = "api-${random_uuid.container_uuid.result}"
      image = var.image_name
      env {
        name = "GCLOUD_CLIENT_EMAIL"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret_version.gcloud_email.secret
            version = "latest"
          }
        }
      }
      env {
        name = "GCLOUD_PRIVATE_KEY"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret_version.gcloud_private_key.secret
            version = "latest"
          }
        }
      }
      env {
        name  = "GCLOUD_PROJECT_ID"
        value = var.project_id
      }
      env {
        name = "WHOOP_CLIENT_ID"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret_version.whoop_client_id.secret
            version = "latest"
          }
        }
      }
      env {
        name = "WHOOP_CLIENT_SECRET"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret_version.whoop_client_secret.secret
            version = "latest"
          }
        }
      }
      env {
        name = "WHOOP_REDIRECT_URL"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret_version.whoop_redirect_url.secret
            version = "latest"
          }
        }
      }
      env {
        name  = "PUBSUB_TOPIC"
        value = var.pubsub_topic
      }
      env {
        name  = "NODE_ENV"
        value = var.environment
      }
    }
  }
}

# Authentication
data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location = google_cloud_run_v2_service.helth_service_api.location
  project  = google_cloud_run_v2_service.helth_service_api.project
  service  = google_cloud_run_v2_service.helth_service_api.name

  policy_data = data.google_iam_policy.noauth.policy_data
}

output "url" {
  value = google_cloud_run_v2_service.helth_service_api.uri
}

