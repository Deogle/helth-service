locals {
  service_name = "helth-service-fe"
  project_id   = "helth-service-test"
}

resource "random_uuid" "container_uuid" {
}

resource "google_cloud_run_v2_service" "helth_service_fe" {
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
      name  = "fe-${random_uuid.container_uuid.result}"
      image = var.image_name
      env {
        name  = "API_URL"
        value = var.api_url
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
  location = google_cloud_run_v2_service.helth_service_fe.location
  project  = google_cloud_run_v2_service.helth_service_fe.project
  service  = google_cloud_run_v2_service.helth_service_fe.name

  policy_data = data.google_iam_policy.noauth.policy_data
}


output "url" {
  value = google_cloud_run_v2_service.helth_service_fe.uri
}
