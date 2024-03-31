provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "helth_service_state_bucket" {
  bucket = "helth-service-state-bucket"
  tags = {
    environment = "shared"
  }
}
