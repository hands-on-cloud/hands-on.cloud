###### PROJECT OPTIONS  ######
variable "root_domain_name" {
  default = "hands-on.cloud"
}

variable "prefix" {
  default = "hands-on-cloud"
}

variable "subdomain" {
  default = ""
}

# Customize your AWS Region
variable "aws_region" {
  description = "AWS Region for the VPC"
  default     = "us-east-1"
}
