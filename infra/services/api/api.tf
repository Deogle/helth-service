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

resource "aws_lb" "helth_service_api_lb" {
  name               = "helth-service-api-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id]
  subnets            = data.aws_subnets.vpc_subnets.ids
  tags = {
    environment = var.environment
  }
}

resource "aws_lb_target_group" "helth_service_api_tg" {
  name        = "helth-service-api-tg"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id
  health_check {
    enabled  = true
    interval = 30
    path     = "/health"
  }
  tags = {
    environment = var.environment
  }
}

resource "aws_lb_listener" "helth_service_api_lb_listener" {
  load_balancer_arn = aws_lb.helth_service_api_lb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.helth_service_api_tg.arn
  }
}

resource "aws_lb_listener" "helth_service_api_lb_listener_https" {
  load_balancer_arn = aws_lb.helth_service_api_lb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.ssl_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.helth_service_api_tg.arn
  }
}

resource "aws_lb_listener_rule" "helth_service_http_to_https_rule" {
  listener_arn = aws_lb_listener.helth_service_api_lb_listener.arn
  priority     = 1

  action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
  condition {
    http_request_method {
      values = ["GET", "HEAD", "POST", "PUT", "DELETE"]
    }
  }
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

  load_balancer {
    target_group_arn = aws_lb_target_group.helth_service_api_tg.arn
    container_name   = local.service_name
    container_port   = 80
  }
  tags = {
    environment = var.environment
  }
}

output "api_url" {
  value = aws_lb.helth_service_api_lb.dns_name
}
