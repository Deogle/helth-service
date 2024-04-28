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

data "aws_secretsmanager_secret" "discord_bot_token" {
  name = "helth_service_test_discord_bot_token"
}

data "aws_secretsmanager_secret" "discord_client_id" {
  name = "helth_service_test_discord_client_id"
}

data "aws_secretsmanager_secret" "discord_client_secret" {
  name = "helth_service_test_discord_client_secret"
}

resource "aws_lb" "helth_service_discord_client_lb" {
  name               = "helth-service-discord-client-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id]
  subnets            = data.aws_subnets.vpc_subnets.ids
  tags = {
    environment = var.environment
  }
}

resource "aws_lb_target_group" "helth_service_discord_client_tg" {
  name        = "helth-service-discord-client-tg"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id
  health_check {
    enabled  = true
    interval = 30
    path     = "/health"
  }
}

resource "aws_lb_listener" "helth_service_discord_client_listener" {
  load_balancer_arn = aws_lb.helth_service_discord_client_lb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.helth_service_discord_client_tg.arn
  }
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
          "name" : "WEBHOOK_URL",
          "value" : "http://${aws_lb.helth_service_discord_client_lb.dns_name}/webhook"
        }
      ],
      "secrets" : [
        {
          "name" : "DISCORD_BOT_TOKEN",
          "valueFrom" : "${data.aws_secretsmanager_secret.discord_bot_token.arn}"
        },
        {
          "name" : "DISCORD_CLIENT_ID",
          "valueFrom" : "${data.aws_secretsmanager_secret.discord_client_id.arn}"
        },
        {
          "name" : "DISCORD_CLIENT_SECRET",
          "valueFrom" : "${data.aws_secretsmanager_secret.discord_client_secret.arn}"
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

  load_balancer {
    target_group_arn = aws_lb_target_group.helth_service_discord_client_tg.arn
    container_name   = local.service_name
    container_port   = 80
  }

  tags = {
    environment = var.environment
  }
}