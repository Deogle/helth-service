locals {
  service_name = "helth-service-api-test"
  project_id   = "helth-service-test"
}

data "google_secret_manager_secret_version" "gcloud_email" {
  secret = "gcloud-client-email-test"
}

data "google_secret_manager_secret_version" "gcloud_private_key" {
  secret = "gcloud-private-key-test"
}

data "google_secret_manager_secret_version" "whoop_client_id" {
  secret = "whoop-client-id-test"
}

data "google_secret_manager_secret_version" "whoop_client_secret" {
  secret = "whoop-client-secret-test"
}

data "google_secret_manager_secret_version" "whoop_redirect_url" {
  secret = "whoop-redirect-url-test"
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

