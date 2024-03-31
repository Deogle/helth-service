terraform {
  backend "s3" {
    bucket = "helth-service-state-bucket"
    key    = "shared/terraform.tfstate"
    region = "us-east-1"
  }
}
