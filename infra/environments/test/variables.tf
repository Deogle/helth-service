variable "environment" {
  description = "The target environment (e.g. test, prod)"
  type        = string
  default     = "test"
}

variable "project_id" {
  description = "The project id to deploy modules under"
  default     = "helth-service-test"
}
