locals {
  service_name = "helth_service_discord_client"
}

data "aws_subnets" "vpc_subnets" {
  filter {
    name   = "vpc-id"
    values = [var.vpc_id]
  }
}

data "aws_ecr_repository" "helth_service_discord_client" {
  name = "helth_service_discord_client"
}

resource "aws_ecs_task_definition" "helth_service_discord_client_task" {
  family = local.service_name
  container_definitions = jsonencode([
    {
      "name" : "${local.service_name}",
      "image" : "${data.aws_ecr_repository.helth_service_discord_client.repository_url}:latest",
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
        },
        {
          "name" : "API_URL",
          "value" : "${var.api_url}"
        },
        {
          "name" : "WEBHOOk_URL",
          "value" : "test"
        }
      ],
      "secrets" : [
        {
          "name" : "DISCORD_BOT_TOKEN",
          "valueFrom" : "${var.discord_bot_token_arn}"
        },
        {
          "name" : "DISCORD_CLIENT_ID",
          "valueFrom" : "${var.discord_client_id_arn}"
        },
        {
          "name" : "DISCORD_CLIENT_SECRET",
          "valueFrom" : "${var.discord_client_secret_arn}"
        },
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
    environment = "test"
  }
}

resource "aws_ecs_service" "helth_service_api" {
  name            = local.service_name
  cluster         = var.ecs_cluster_id
  task_definition = aws_ecs_task_definition.helth_service_discord_client_task.arn
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
