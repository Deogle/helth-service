locals {
  service_name = "helth-service-discord-client"
  project_id   = "helth-service-test"
}

data "google_secret_manager_secret_version" "bot_token" {
  secret = "discord-bot-token-${var.environment}"
}

data "google_secret_manager_secret_version" "client_id" {
  secret = "discord-client-id-${var.environment}"
}

data "google_secret_manager_secret_version" "client_secret" {
  secret = "discord-client-secret-${var.environment}"
}

resource "google_cloud_run_v2_service" "helth_service_client" {
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
        name  = "API_URL"
        value = var.api_url
      }
      env {
        name = "DISCORD_BOT_TOKEN"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret_version.bot_token.secret
            version = "latest"
          }
        }
      }
      env {
        name = "DISCORD_CLIENT_ID"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret_version.client_id.secret
            version = "latest"
          }
        }
      }
      env {
        name = "DISCORD_CLIENT_SECRET"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret_version.client_secret.secret
            version = "latest"
          }
        }
      }
    }
  }
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location = google_cloud_run_v2_service.helth_service_client.location
  project  = google_cloud_run_v2_service.helth_service_client.project
  service  = google_cloud_run_v2_service.helth_service_client.name

  policy_data = data.google_iam_policy.noauth.policy_data
}

output "url" {
  value = google_cloud_run_v2_service.helth_service_client.uri
}

output "name" {
  value = local.service_name
}
