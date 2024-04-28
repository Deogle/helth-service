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

variable "api_url" {
  description = "The URL of the API service"
  type        = string
}

variable "image_name" {
  description = "The image to deploy to cloud run"
}

variable "discord_bot_token" {
  description = "The discord bot token"
}

variable "discord_client_id" {
  description = "The discord client id"
}

variable "discord_client_secret" {
  description = "The discord client secret"
}
