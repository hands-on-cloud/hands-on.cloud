###### PROJECT OPTIONS  ######
variable "root_domain_name" {
  default = "hands-on.cloud"
}

# Customize your AWS Region
variable "aws_region" {
  description = "AWS Region for the VPC"
  default     = "us-east-1"
}
