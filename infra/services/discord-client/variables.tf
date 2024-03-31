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

variable "ecs_cluster_id" {
  description = "The ID of the ECS cluster where the service will be deployed"
  type        = string
}

variable "environment" {
  description = "The environment where the service is deployed"
  type        = string
}

variable "discord_bot_token_arn" {
  description = "The Discord bot token arn"
  type        = string
}

variable "discord_client_id_arn" {
  description = "The Discord client ID arn"
  type        = string
}

variable "discord_client_secret_arn" {
  description = "The Discord client secret arn"
  type        = string
}

variable "api_url" {
  description = "The URL of the API service"
  type        = string
}
