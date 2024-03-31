terraform {
  backend "s3" {
    bucket = "helth-service-state-bucket"
    key    = "test/terraform.tfstate"
    region = "us-east-1"
  }
}
