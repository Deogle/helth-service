locals {
  service_name = "helth_service_api"
}

data "aws_subnets" "vpc_subnets" {
  filter {
    name   = "vpc-id"
    values = [var.vpc_id]
  }
}

data "aws_ecr_repository" "helth_service_api" {
  name = "helth_service_api"
}

data "aws_secretsmanager_secret" "gcloud_client_email" {
  name = "gcloud_client_email"
}

data "aws_secretsmanager_secret" "gcloud_private_key" {
  name = "gcloud_private_key"
}

data "aws_secretsmanager_secret" "gcloud_project_id" {
  name = "gcloud_project_id"
}

data "aws_secretsmanager_secret" "whoop_client_id" {
  name = "helth_service_test_whoop_client_id"
}

data "aws_secretsmanager_secret" "whoop_client_secret" {
  name = "helth_service_test_whoop_client_secret"
}

data "aws_secretsmanager_secret" "whoop_redirect_url" {
  name = "helth_service_test_whoop_redirect_url"
}

resource "aws_ecs_task_definition" "helth_service_api_task" {
  family = local.service_name
  container_definitions = jsonencode([
    {
      "name" : "${local.service_name}",
      "image" : "${data.aws_ecr_repository.helth_service_api.repository_url}:latest",
      "cpu" : 0,
      "portMappings" : [
        {
          "name" : "80",
          "containerPort" : 80,
          "hostPort" : 80,
          "protocol" : "tcp",
          "appProtocol" : "http"
        }
      ],
      "essential" : true,
      "environment" : [
        {
          "name" : "PORT",
          "value" : "80"
        }
      ],
      "secrets" : [
        {
          "name" : "GCLOUD_CLIENT_EMAIL",
          "valueFrom" : "${data.aws_secretsmanager_secret.gcloud_client_email.arn}"
        },
        {
          "name" : "GCLOUD_PRIVATE_KEY",
          "valueFrom" : "${data.aws_secretsmanager_secret.gcloud_private_key.arn}"
        },
        {
          "name" : "GCLOUD_PROJECT_ID",
          "valueFrom" : "${data.aws_secretsmanager_secret.gcloud_project_id.arn}"
        },
        {
          "name" : "WHOOP_CLIENT_ID",
          "valueFrom" : "${data.aws_secretsmanager_secret.whoop_client_id.arn}"
        },
        {
          "name" : "WHOOP_CLIENT_SECRET",
          "valueFrom" : "${data.aws_secretsmanager_secret.whoop_client_secret.arn}"
        },
        {
          "name" : "WHOOP_REDIRECT_URL",
          "valueFrom" : "${data.aws_secretsmanager_secret.whoop_redirect_url.arn}"
        }
      ],
      "readonlyRootFilesystem" : true,
      "logConfiguration" : {
        "logDriver" : "awslogs",
        "options" : {
          "awslogs-create-group" : "true",
          "awslogs-group" : "/ecs/${local.service_name}",
          "awslogs-region" : "us-east-1",
          "awslogs-stream-prefix" : "ecs"
        },
      },
      "healthCheck" : {
        "command" : ["CMD-SHELL", "curl -f http://localhost/health || exit 1"],
        "interval" : 10,
        "timeout" : 5,
        "retries" : 5
      }
    }
    ]
  )
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = var.exec_role_arn
  tags = {
    environment = var.environment
  }
}

resource "aws_ecs_service" "helth_service_api" {
  name            = "helth_service_api"
  cluster         = var.ecs_cluster_id
  task_definition = aws_ecs_task_definition.helth_service_api_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = data.aws_subnets.vpc_subnets.ids
    security_groups  = [var.security_group_id]
    assign_public_ip = true
  }
  tags = {
    environment = var.environment
  }
}
