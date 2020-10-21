---
title: 'Terraform recipe - How to create AWS ElasticSearch cluster'
date: '2020-10-04'
image: 'Terraform-recipe-How-to-create-AWS-ElasticSearch-cluster'
tags:
  - elasticsearch
  - elk
  - vpc
categories:
  - AWS
  - Terraform
authors:
  - Andrei Maksimov
---

From this recipe, you’ll learn how to create the [AWS ElasticSearch](https://aws.amazon.com/elasticsearch-service/) cluster in VPC using [Terraform](https://www.terraform.io/).

The source code is available in my [GitHub repository](https://github.com/andreivmaksimov/terraform-recipe-how-to-create-aws-elasticsearch-cluster).

**Updates (Oct 2020)**:

* Updated Terraform code to support newer version syntax.
* VPC deployment added
* Three subnet HA ElasticSearch cluster
* ElasticSearach version upgrade to version `7.7`
* Fix of `Error: Error creating ElasticSearch domain: ValidationException: Before you can proceed, you must enable a service-linked role to give Amazon ES permissions to access your VPC.`
* Fix of `Error: Error creating ElasticSearch domain: ValidationException: You must choose a minimum of three data nodes for a three Availability Zone deployment.`

## Introduction

Amazon Elasticsearch Service is an AWS managed service that makes it easy to deploy, operate, and scale Elasticsearch clusters.

ElasticSearch is a popular open-source search and analytics engine for the following use cases:

* log analytics
* real-time application monitoring
* clickstream analysis

## Common resources

Here are some common Terraform resources, which we’ll be using in this deployment:

```hcl
variable "region" {
  type = string
  description = "AWS Region, where to deploy ELK cluster."
  default = "us-east-1"
}

locals {
  common_prefix = "demo"
  elk_domain = "${local.common_prefix}-elk-domain"
}

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}

provider "aws" {
  region = var.region
}
```

## VPC configuration

To simplify deployment, I decided to deploy an ElasticSearch example in its dedicated VPC. Here's a VPC configuration with the following characteristics:

* 3 Availability Zones
* 6 subnets (3 public, 3 nated)

{{< my-picture name="Terraform recipe - Elasticsearch VPC" >}}

```hcl
resource "aws_vpc" "demo" {
  cidr_block       = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "${local.common_prefix}-vpc"
  }
}

resource "aws_subnet" "public_1" {
  vpc_id     = aws_vpc.demo.id
  cidr_block = cidrsubnet(aws_vpc.demo.cidr_block, 8, 0)
  availability_zone = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.common_prefix}-public-subnet-${data.aws_availability_zones.available.names[0]}"
  }
}

resource "aws_subnet" "public_2" {
  vpc_id     = aws_vpc.demo.id
  cidr_block = cidrsubnet(aws_vpc.demo.cidr_block, 8, 1)
  availability_zone = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.common_prefix}-public-subnet-${data.aws_availability_zones.available.names[1]}"
  }
}

resource "aws_subnet" "public_3" {
  vpc_id     = aws_vpc.demo.id
  cidr_block = cidrsubnet(aws_vpc.demo.cidr_block, 8, 2)
  availability_zone = data.aws_availability_zones.available.names[2]
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.common_prefix}-public-subnet-${data.aws_availability_zones.available.names[2]}"
  }
}

resource "aws_internet_gateway" "demo" {
  vpc_id = aws_vpc.demo.id

  tags = {
    Name = "${local.common_prefix}-igw"
  }
}

resource "aws_route_table" "public" {
    vpc_id = aws_vpc.demo.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.demo.id
    }

    tags = {
        Name = "${local.common_prefix}-public-rt"
    }
}

resource "aws_route_table_association" "public_1" {
    subnet_id = aws_subnet.public_1.id
    route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
    subnet_id = aws_subnet.public_2.id
    route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_3" {
    subnet_id = aws_subnet.public_3.id
    route_table_id = aws_route_table.public.id
}

resource "aws_subnet" "nated_1" {
  vpc_id     = aws_vpc.demo.id
  cidr_block = cidrsubnet(aws_vpc.demo.cidr_block, 8, 3)
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "${local.common_prefix}-nated-subnet-${data.aws_availability_zones.available.names[0]}"
  }
}

resource "aws_subnet" "nated_2" {
  vpc_id     = aws_vpc.demo.id
  cidr_block = cidrsubnet(aws_vpc.demo.cidr_block, 8, 4)
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "${local.common_prefix}-nated-subnet-${data.aws_availability_zones.available.names[1]}"
  }
}

resource "aws_subnet" "nated_3" {
  vpc_id     = aws_vpc.demo.id
  cidr_block = cidrsubnet(aws_vpc.demo.cidr_block, 8, 5)
  availability_zone = data.aws_availability_zones.available.names[2]

  tags = {
    Name = "${local.common_prefix}-nated-subnet-${data.aws_availability_zones.available.names[2]}"
  }
}

resource "aws_eip" "nat_gw_eip_1" {
  vpc = true
}

resource "aws_eip" "nat_gw_eip_2" {
  vpc = true
}

resource "aws_eip" "nat_gw_eip_3" {
  vpc = true
}

resource "aws_nat_gateway" "gw_1" {
  allocation_id = aws_eip.nat_gw_eip_1.id
  subnet_id     = aws_subnet.public_1.id
}

resource "aws_nat_gateway" "gw_2" {
  allocation_id = aws_eip.nat_gw_eip_2.id
  subnet_id     = aws_subnet.public_2.id
}

resource "aws_nat_gateway" "gw_3" {
  allocation_id = aws_eip.nat_gw_eip_3.id
  subnet_id     = aws_subnet.public_3.id
}

resource "aws_route_table" "nated_1" {
    vpc_id = aws_vpc.demo.id

    route {
        cidr_block = "0.0.0.0/0"
        nat_gateway_id = aws_nat_gateway.gw_1.id
    }

    tags = {
        Name = "${local.common_prefix}-nated-rt-1"
    }
}

resource "aws_route_table" "nated_2" {
    vpc_id = aws_vpc.demo.id

    route {
        cidr_block = "0.0.0.0/0"
        nat_gateway_id = aws_nat_gateway.gw_2.id
    }

    tags = {
        Name = "${local.common_prefix}-nated-rt-2"
    }
}

resource "aws_route_table" "nated_3" {
    vpc_id = aws_vpc.demo.id

    route {
        cidr_block = "0.0.0.0/0"
        nat_gateway_id = aws_nat_gateway.gw_3.id
    }

    tags = {
        Name = "${local.common_prefix}-nated-rt-3"
    }
}

resource "aws_route_table_association" "nated_1" {
    subnet_id = aws_subnet.nated_1.id
    route_table_id = aws_route_table.nated_1.id
}

resource "aws_route_table_association" "nated_2" {
    subnet_id = aws_subnet.nated_2.id
    route_table_id = aws_route_table.nated_2.id
}
```

## ElasticSearch cluster

As soon as we have VPC in place, we may deploy our cluster. Here we have:

* Security Group to allow connections to ElasticSearch from out VPC
* Required Elasticsearch Service-Linked Role
* ElasticSearch cluster
* Couple of output variables with the links to cluster endpoints

```hcl
resource "aws_security_group" "es" {
  name = "${local.common_prefix}-es-sg"
  description = "Allow inbound traffic to ElasticSearch from VPC CIDR"
  vpc_id = aws_vpc.demo.id

  ingress {
      from_port = 0
      to_port = 0
      protocol = "-1"
      cidr_blocks = [
          aws_vpc.demo.cidr_block
      ]
  }
}

resource "aws_iam_service_linked_role" "es" {
  aws_service_name = "es.amazonaws.com"
}

resource "aws_elasticsearch_domain" "es" {
  domain_name = local.elk_domain
  elasticsearch_version = "7.7"

  cluster_config {
      instance_count = 3

      instance_type = "r5.large.elasticsearch"

      zone_awareness_enabled = true

      zone_awareness_config {
        availability_zone_count = 3
      }
  }

  vpc_options {
      subnet_ids = [
        aws_subnet.nated_1.id,
        aws_subnet.nated_2.id,
        aws_subnet.nated_3.id
      ]

      security_group_ids = [
          aws_security_group.es.id
      ]
  }

  ebs_options {
      ebs_enabled = true
      volume_size = 10
  }

  access_policies = <<CONFIG
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Action": "es:*",
          "Principal": "*",
          "Effect": "Allow",
          "Resource": "arn:aws:es:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:domain/${local.elk_domain}/*"
      }
  ]
}
  CONFIG

  snapshot_options {
      automated_snapshot_start_hour = 23
  }

  tags = {
      Domain = local.elk_domain
  }
}

output "elk_endpoint" {
  value = aws_elasticsearch_domain.es.endpoint
}

output "elk_kibana_endpoint" {
  value = aws_elasticsearch_domain.es.kibana_endpoint
}
```

## Summary

I hope you’ll find this article helpful. If so, please, feel free to help me to spread it to the world!
