variable "environment" {
  description = "The environment where the service is deployed"
  type        = string
}

variable "region" {
  description = "The region to launch the service within."
  default     = "us-central1"
}

variable "project_id" {
  description = "The project id"
}

variable "name" {
  description = "The name of the pubsub topic"
}

variable "service" {
  description = "The service to push messages to"
  type = object({
    name     = string
    url      = string
    location = string
  })
}
