variable "environment" {
  description = "The environment where the service is deployed"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC where the ECS cluster is deployed"
  type        = string
}

variable "ssl_certificate_arn" {
  description = "The ARN of the SSL certificate to use for the load balancer"
  type        = string
}

variable "security_group_id" {
  description = "The ID of the security group to attach to the ECS service"
  type        = string
}

variable "api_url" {
  description = "The URL of the API service"
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
