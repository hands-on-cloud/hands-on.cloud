terraform {
  backend "s3" {
    region         = "us-east-1"
    bucket         = "service.hands-on.cloud"
    key            = "terraform/state.tfstate"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}

provider "aws" {
  region  = "${var.aws_region}"
  version = "~> 2.35"
}

data "aws_caller_identity" "current" {}

locals {
  full_domain = "${join(".", list(terraform.workspace, var.root_domain_name))}"
}

resource "aws_s3_bucket" "s3_bucket" {
  bucket = "${local.full_domain}"

  force_destroy = true

  policy = <<POLICY
{
    "Version":"2012-10-17",
    "Statement":[
        {
            "Sid": "AddPerm",
            "Effect": "Allow",
            "Principal": "*",
            "Action": ["s3:GetObject"],
            "Resource": ["arn:aws:s3:::${local.full_domain}/*"]
        }
    ]
}
POLICY

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

data "aws_route53_zone" "zone" {
  name         = "${var.root_domain_name}."
  private_zone = false
}

resource "aws_route53_record" "record" {
  zone_id = "${data.aws_route53_zone.zone.id}"
  name    = "${local.full_domain}"
  type    = "A"

  alias {
    name                   = "${aws_s3_bucket.s3_bucket.website_domain}"
    zone_id                = "${aws_s3_bucket.s3_bucket.hosted_zone_id}"
    evaluate_target_health = false
  } 
}

output "website_url" {
  value = "http://${local.full_domain}"
}

output "website_bucket" {
  value = "${aws_s3_bucket.s3_bucket.id}"
}
