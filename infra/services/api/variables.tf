variable "environment" {
  description = "The target environment (e.g. test, prod)"
  type        = string
}

variable "region" {
  description = "The region to launch the service within."
  default     = "us-central1"
}

variable "service_account_name" {
  description = "The name of the service account to launch this service."
  default     = ""
}

variable "project_id" {
  description = "The project id"
}

variable "pubsub_topic" {
  description = "The pubsub topic to publish to"
}

variable "image_name" {
  description = "The image to deploy to cloud run"
}

