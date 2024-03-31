variable "environment" {
  description = "The target environment (e.g. test, prod)"
  type        = string
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

variable "ecs_cluster_id" {
  description = "The ID of the ECS cluster where the service will be deployed"
  type        = string
}
