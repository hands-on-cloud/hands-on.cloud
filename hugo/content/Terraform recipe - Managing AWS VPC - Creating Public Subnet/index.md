---
title: 'Terraform recipe - Managing AWS VPC - Creating Public Subnet'
date: '2020-10-04'
image: 'Terraform-Recipe-Managing-AWS-VPC-Creating-Public-Subnet'
tags:
  - terraform
  - vpc
categories:
  - AWS
  - DevOps
authors:
  - Andrei Maksimov
---
# Terraform recipe - Managing AWS VPC - Creating Public Subnet

{{< my-picture name="Terraform-Recipe-Managing-AWS-VPC-Creating-Public-Subnet" >}}

One of the essential tasks of your cloud infrastructure management is managing your VPC’s networks. In this article, we’ll learn how to declare the most commonly used configuration:

* Public subnet

In the [Terraform recipe - Managing AWS VPC - Creating Private Subnets](https://hands-on.cloud/terraform-recipe-managing-aws-vpc-creating-private-subnets), we’ll extend this infrastructure by adding a private subnet to our VPC.

You may find complete sources in my [GitHub repo](https://github.com/andreivmaksimov/terraform-recipe-managing-aws-vpc-creating-public-subnet).

## VPC with a single public subnet

Configuration for this scenario includes a virtual private cloud (VPC) with a single public subnet, Internet Gateway, and Route Table to enable communication over the Internet. AWS recommends this configuration if you need to run a single-tier, public-facing web application, such as a blog or a simple website.

Here’s how the infrastructure looks like:

{{< my-picture name="Terraform-recipe-Managing-AWS-VPC-Single-Public-Subnet" >}}

Let’s create this infrastructure step by step.

First of all, you need to create a new terraform file with any name and `.tf` extension. I’ll be using `vpc_with_single_public_subnet.tf`.

Next we need to declare [aws_vpc](https://www.terraform.io/docs/providers/aws/r/vpc.html) resource which will represents a new VPC with `10.0.0.0/16` address space:

```hcl
resource "aws_vpc" "my_vpc" {
  cidr_block       = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "My VPC"
  }
}
```

We’re also enabling DNS support inside our VPC (`enable_dns_hostnames`) and setting the `Name` tag to `My VPC`, so we could easily find our VPC in the AWS console later need to.

As soon as VPC resource declared, we’re ready to declare [aws_subnet](https://www.terraform.io/docs/providers/aws/r/subnet.html) resource, which will describe our Public Subnet.

```hcl
resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.my_vpc.id
  cidr_block = "10.0.0.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "Public Subnet"
  }
}
```

Here we’re asking Terraform to create our Subnet in a VPC by referring: `vpc_id` value is taken from `aws_vpc` resource declaration with name `my_vpc` by its `id`.

We’re also specifying the Subnet address space within VPC by setting up a `cidr_block` option to `10.0.0.0/24` value.

Each subnet in a VPC belongs to one of the available AWS Availability Zones within AWS Regions. So, we’re also specifying it by setting the `availability_zone` option to `us-east-1a` value.

We call Subnets Public because they have an available route (`0.0.0.0/0`) in their Route Table attached to VPC Internet Gateway.

So, let’s create an Internet Gateway now by specifying [aws_internet_gateway](https://www.terraform.io/docs/providers/aws/r/internet_gateway.html) resource:

```hcl
resource "aws_internet_gateway" "my_vpc_igw" {
  vpc_id = aws_vpc.my_vpc.id

  tags = {
    Name = "My VPC - Internet Gateway"
  }
}
```

This entity attached to a VPC will allow Internet traffic flow to the Public Subnet. As we already discussed, we also need to create a Route Table to route the outside world and map it to our Internet Gateway. Let’s do it by declaring [aws_route_table](https://www.terraform.io/docs/providers/aws/r/route_table.html) and [aws_route_table_association](https://www.terraform.io/docs/providers/aws/r/route_table_association.html) resources:

```hcl
resource "aws_route_table" "my_vpc_us_east_1a_public" {
    vpc_id = aws_vpc.my_vpc.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.my_vpc_igw.id
    }

    tags = {
        Name = "Public Subnet Route Table."
    }
}

resource "aws_route_table_association" "my_vpc_us_east_1a_public" {
    subnet_id = aws_subnet.public.id
    route_table_id = aws_route_table.my_vpc_us_east_1a_public.id
}
```

Here we just declared Route Table for our Subnet and made an association between them.

Our Public Subnet is ready to launch new instances inside of it. Let’s do it now.

One of AWS’s security features is the Security Group – it is a stateful firewall rule that allows inbound traffic to the network object. In our case, we’ll use it to block any outside connections to our instance except SSH.

{{< my-picture name="Terraform-recipe-Managing-AWS-VPC-Single-Public-Subnet-With-Security-Group" >}}

Let’s add Security Group by adding [aws_security_group](https://www.terraform.io/docs/providers/aws/r/security_group.html) resource to our `.tf` file:

```hcl
resource "aws_security_group" "allow_ssh" {
  name        = "allow_ssh_sg"
  description = "Allow SSH inbound connections"
  vpc_id = aws_vpc.my_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow_ssh_sg"
  }
}
```

Here we’re allowing incoming SSH connections (`22/tcp`) from any addresses (`0.0.0.0/0`) inside the Security Group, and also we’re allowing any connection initiation to the outside world from the Security Group. So, we’ll be able to SSH to the instance protected by this Security Group and make any connections from it.

It’s time create our instance to test everything. Let’s declare [aws_instance](https://www.terraform.io/docs/providers/aws/r/instance.html) resource:

```hcl
resource "aws_instance" "my_instance" {
  ami           = "ami-0ac019f4fcb7cb7e6"
  instance_type = "t2.micro"
  key_name = "Lenovo T410"
  vpc_security_group_ids = [ aws_security_group.allow_ssh.id ]
  subnet_id = aws_subnet.public.id
  associate_public_ip_address = true

  tags = {
    Name = "My Instance"
  }
}
```

Here we’ve specified Ubuntu 18.04 AMI `id` in the us-east-1 region, set instance size to the smallest available – `t2.micro,` and set SSH-key name. If you don’t have it yet, please, create or upload one for you here: [https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#KeyPairs:sort=keyName](https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#KeyPairs:sort=keyName).

We’ve also launched our instance in just created Public Subnet and protected it with our Security Group.

To allow connection from the outside world, we also asked AWS to attach a temporary Public IP address to our instance by setting the `associate_public_ip_address` option to `true`.

And the last thing we need to add to our `.tf` file is the output resource, which will print us our instance Public IP address:

```hcl
output "instance_public_ip" {
  value = "${aws_instance.my_instance.public_ip}"
}
```

## Creating infrastructure

To apply this configuration, all you need to do is to go to the project folder and run the following commands:

```sh
terraform init
terraform apply
```

## SSH to the host

At the end of the infrastructure creation process, Terraform printed you a Public IP address of your instance. To SSH to it, you need to run the following command:

```sh
ssh ubuntu@public_host_ip
```

## Tier down infrastructure

To remove all created resources, all you need to do is to go to the project folder and run the following command:

```sh
terraform destroy
```

## Summary

In this article, you’ve created a simple AWS infrastructure from scratch, consisting of separate VPC, Internet Gateway, Subnet, RouteTable, Security Group, and the EC2 Instance. In the next article, we’ll extend this infrastructure by adding a private subnet to our VPC.
