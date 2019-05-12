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

###### GITHUB OPTIONS  ######

# Github Repository Owner
variable "git_repository_owner" {
  description = "Github Repository Owner"
  default     = "hands-on-cloud"
}

# Github Repository Project Name
variable "git_repository_name" {
  description = "Project name on Github"
  default     = "hands-on.cloud"
}

# Default Branch
variable "git_repository_branch" {
  description = "Github Project Branch"
  default     = "master"
}

# Customize your AWS Region
variable "aws_region" {
  description = "AWS Region for the VPC"
  default     = "us-east-1"
}
