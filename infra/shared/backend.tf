terraform {
  backend "gcs" {
    bucket = "helth-tf-state"
    prefix = "terraform/state"
  }
}
