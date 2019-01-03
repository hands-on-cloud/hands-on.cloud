terraform {
    backend "s3" {
        region = "us-east-1"
        bucket = "service.hands-on.cloud"
        key = "terraform/state.tfstate"
        dynamodb_table = "terraform-state-lock"
        encrypt = true
    }
}

provider "aws" {
    region = "us-east-1"
    version = "~> 1.54"
}
variable "root_domain_name" {
    default = "hands-on.cloud"
}

variable "subdomain" {
    default = ""
}


locals {
    full_domain = "${terraform.workspace != "default" ? join(".", list(terraform.workspace, var.root_domain_name)) : var.root_domain_name}"
    origin_domain_name = "origin.${local.full_domain}"
    www_domain_name = "www.${local.full_domain}"
}

resource "aws_s3_bucket" "origin_hands_on_cloud" {
    bucket = "${local.origin_domain_name}"
    acl    = "public-read"
    policy = <<POLICY
    {
        "Version":"2012-10-17",
        "Statement":[
            {
                "Sid": "AddPerm",
                "Effect": "Allow",
                "Principal": "*",
                "Action": ["s3:GetObject"],
                "Resource": ["arn:aws:s3:::${local.origin_domain_name}/*"]
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

resource "aws_route53_record" "origin" {
    zone_id = "${data.aws_route53_zone.zone.id}"
    name = "${local.origin_domain_name}"
    type = "A"

    alias {
        name = "${aws_s3_bucket.origin_hands_on_cloud.website_domain}"
        zone_id = "${aws_s3_bucket.origin_hands_on_cloud.hosted_zone_id}"
        evaluate_target_health = false
    }
}

resource "aws_acm_certificate" "certificate" {
    domain_name       = "*.${local.full_domain}"
    validation_method = "DNS"

    subject_alternative_names = ["${local.full_domain}"]
}
resource "aws_route53_record" "certificate_validation" {
    name    = "${aws_acm_certificate.certificate.domain_validation_options.0.resource_record_name}"
    type    = "${aws_acm_certificate.certificate.domain_validation_options.0.resource_record_type}"
    zone_id = "${data.aws_route53_zone.zone.id}"
    records = ["${aws_acm_certificate.certificate.domain_validation_options.0.resource_record_value}"]
    ttl     = 60
}
resource "aws_acm_certificate_validation" "cert" {
    certificate_arn         = "${aws_acm_certificate.certificate.arn}"
    validation_record_fqdns = ["${aws_route53_record.certificate_validation.fqdn}"]
}
resource "aws_cloudfront_distribution" "hands_on_cloud_distribution" {
    origin {
        custom_origin_config {
            http_port              = "80"
            https_port             = "443"
            origin_protocol_policy = "http-only"
            origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
        }

        domain_name = "${aws_s3_bucket.origin_hands_on_cloud.website_endpoint}"
        origin_id   = "hands-on-origin"
    }

    enabled             = true
    default_root_object = "index.html"
    aliases = ["${local.full_domain}", "${local.www_domain_name}"]
    retain_on_delete = true

    default_cache_behavior {
        viewer_protocol_policy = "redirect-to-https"
        compress = true
        allowed_methods = [ "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT" ]
        cached_methods = [ "GET", "HEAD" ]
        target_origin_id = "hands-on-origin"
        
        forwarded_values {
            query_string = true
            cookies {
                forward = "none"
            }
        }

        min_ttl = 0
        default_ttl = 3600
        max_ttl = 86400
    }

    viewer_certificate {
        acm_certificate_arn = "${aws_acm_certificate.certificate.arn}"
        minimum_protocol_version = "TLSv1"
        ssl_support_method  = "sni-only"
    }

    restrictions {
        geo_restriction {
            restriction_type = "none"
        }
    }
}

resource "aws_route53_record" "root" {
    zone_id = "${data.aws_route53_zone.zone.id}"
    name = "${local.full_domain}"
    type = "A"

    alias {
        name = "${aws_cloudfront_distribution.hands_on_cloud_distribution.domain_name}"
        zone_id = "${aws_cloudfront_distribution.hands_on_cloud_distribution.hosted_zone_id}"
        evaluate_target_health = false
    }
}

resource "aws_route53_record" "www" {
    zone_id = "${data.aws_route53_zone.zone.id}"
    name = "${local.www_domain_name}"
    type = "A"

    alias = {
        name = "${aws_cloudfront_distribution.hands_on_cloud_distribution.domain_name}"
        zone_id = "${aws_cloudfront_distribution.hands_on_cloud_distribution.hosted_zone_id}"
        evaluate_target_health = false
    }
}

output "origin_website_url" {
    value = "http://${local.origin_domain_name}"
}
output "origin_website_bucket" {
    value = "${aws_s3_bucket.origin_hands_on_cloud.id}"
}
output "main_website_url" {
    value = "https://${local.origin_domain_name}"
}
output "www_website_url" {
    value = "https://${local.www_domain_name}"
}
