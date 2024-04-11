locals {
  service_name = "helth_service_fe"
}

data "aws_subnets" "vpc_subnets" {
  filter {
    name   = "vpc-id"
    values = [var.vpc_id]
  }
}

data "aws_ecr_repository" "helth_service_fe" {
  name = "helth_service_frontend"
}

resource "aws_lb" "helth_service_fe_lb" {
  name               = "helth-service-fe-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id]
  subnets            = data.aws_subnets.vpc_subnets.ids
  tags = {
    environment = var.environment
  }
}

resource "aws_lb_target_group" "helth_service_fe_tg" {
  name        = "helth-service-fe-tg"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id
  health_check {
    enabled  = true
    interval = 30
    path     = "/"
  }
  tags = {
    environment = var.environment
  }
}

resource "aws_lb_listener" "helth_service_fe_lb_listener" {
  load_balancer_arn = aws_lb.helth_service_fe_lb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.helth_service_fe_tg.arn
  }
}

resource "aws_lb_listener" "helth_service_fe_lb_listener_https" {
  load_balancer_arn = aws_lb.helth_service_fe_lb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.ssl_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.helth_service_fe_tg.arn
  }
}

resource "aws_lb_listener_rule" "helth_service_http_to_https_rule" {
  listener_arn = aws_lb_listener.helth_service_fe_lb_listener.arn
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
      values = ["GET", "HEAD"]
    }
  }
}

resource "aws_ecs_task_definition" "helth_service_fe_task" {
  family = local.service_name
  container_definitions = jsonencode([
    {
      "name" : "${local.service_name}",
      "image" : "${data.aws_ecr_repository.helth_service_fe.repository_url}:latest",
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
        "command" : ["CMD-SHELL", "curl -f http://localhost/ || exit 1"],
        "interval" : 30,
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

resource "aws_ecs_service" "helth_service_fe" {
  name            = local.service_name
  cluster         = var.ecs_cluster_id
  task_definition = aws_ecs_task_definition.helth_service_fe_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = data.aws_subnets.vpc_subnets.ids
    security_groups  = [var.security_group_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.helth_service_fe_tg.arn
    container_name   = local.service_name
    container_port   = 80
  }
  tags = {
    environment = var.environment
  }
}

output "dns_name" {
  value = aws_lb.helth_service_fe_lb.dns_name
}
