variable "environment" {
  description = "The target environment (e.g. test, prod)"
  type        = string
  default     = "test"
}

variable "vpc_id" {
  description = "The ID of the VPC where the ECS cluster is deployed"
  type        = string
}

variable "security_group_id" {
  description = "The ID of the security group to attach to the ECS service"
  type        = string
}

variable "exec_role_arn" {
  description = "The ARN of the IAM role to assume when executing the ECS task"
  type        = string
}

variable "discord_bot_token" {
  description = "The Discord bot token"
  type        = string
}

variable "discord_client_id" {
  description = "The Discord client ID"
  type        = string
}

variable "discord_client_secret" {
  description = "The Discord client secret"
  type        = string
}
