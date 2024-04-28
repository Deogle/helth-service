variable "environment" {
  description = "The target environment (e.g. test, prod)"
  type        = string
  default     = "test"
}

variable "project_id" {
  description = "The project id to deploy modules under"
  default     = "helth-service-test"
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
