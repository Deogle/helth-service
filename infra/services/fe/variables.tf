variable "environment" {
  description = "The environment where the service is deployed"
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

variable "image_name" {
  description = "The image to deploy to cloud run"
}

variable "api_url" {
  description = "the url of the api service"
}
