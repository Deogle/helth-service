locals {
  service_name = "helth-service-discord-client"
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
        name  = "DISCORD_BOT_TOKEN"
        value = var.discord_bot_token
      }
      env {
        name  = "DISCORD_CLIENT_ID"
        value = var.discord_client_id
      }
      env {
        name  = "DISCORD_CLIENT_SECRET"
        value = var.discord_client_secret
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
