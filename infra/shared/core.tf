locals {
  environment = "shared"
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_ecr_repository" "helth_service_api" {
  name = "helth_service_api"
  tags = {
    environment = local.environment
  }
}

resource "aws_ecr_repository" "helth_service_frontend" {
  name = "helth_service_frontend"
  tags = {
    environment = local.environment
  }
}

resource "aws_ecr_repository" "helth_service_discord_client" {
  name = "helth_service_discord_client"
  tags = {
    environment = local.environment
  }
}

resource "aws_ecs_cluster" "helth_service_test_cluster" {
  name = "helth_service_test_cluster"
  tags = {
    environment = local.environment
  }
}

resource "aws_route53_zone" "helth_service_test_zone" {
  name = "helth.dev"
}

resource "aws_acm_certificate" "helth_service_cert" {
  domain_name       = "helth.dev"
  validation_method = "DNS"

  tags = {
    environment = local.environment
    Name        = "helth.dev cert"
  }
}

resource "aws_acm_certificate" "helth_service_domain_cert" {
  domain_name               = "helth.dev"
  validation_method         = "DNS"
  subject_alternative_names = ["*.helth.dev"]

  tags = {
    environment = local.environment
    Name        = "helth.dev subdomain cert"
  }
}

resource "aws_route53_record" "helth_service_zone_validation_record" {
  for_each = {
    for dvo in aws_acm_certificate.helth_service_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.helth_service_test_zone.zone_id
}

resource "aws_route53_record" "helth_service_domain_zone_validation_record" {
  for_each = {
    for dvo in aws_acm_certificate.helth_service_domain_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.helth_service_test_zone.zone_id
}

resource "aws_acm_certificate_validation" "helth_service_zone_validation_record" {
  certificate_arn         = aws_acm_certificate.helth_service_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.helth_service_zone_validation_record : record.fqdn]
}

resource "aws_acm_certificate_validation" "helth_service_domain_zone_validation_record" {
  certificate_arn         = aws_acm_certificate.helth_service_domain_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.helth_service_domain_zone_validation_record : record.fqdn]
}

output "helth_service_ssl_certificate_arn" {
  value = aws_acm_certificate.helth_service_cert.arn
}

output "helth_service_domain_ssl_certificate_arn" {
  value = aws_acm_certificate.helth_service_domain_cert.arn
}

output "helth_service_test_zone_id" {
  value = aws_route53_zone.helth_service_test_zone.id
}

output "ecs_cluster_id" {
  value = aws_ecs_cluster.helth_service_test_cluster.id
}

output "helth_service_api_repository_url" {
  value = aws_ecr_repository.helth_service_api.repository_url
}

output "helth_service_frontend_repository_url" {
  value = aws_ecr_repository.helth_service_frontend.repository_url
}

output "helth_service_discord_client_repository_url" {
  value = aws_ecr_repository.helth_service_discord_client.repository_url
}
