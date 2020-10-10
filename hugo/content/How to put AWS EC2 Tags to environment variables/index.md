---
title: 'How to put AWS EC2 Tags to environment variables'
date: '2018-02-01'
image: 'How-to-put-AWS-EC2-Tags-to-environment-variables'
tags:
  - cloudformation
  - terraform
categories:
  - AWS
  - DevOps
authors:
  - Andrei Maksimov
---

One of the most common tasks in infrastructure automation is environment discovery. Of cause, it can be done in many several ways. Todays’s advice is for people, who are using Terraform or CloudFormation in their daily job. I’ll show you, how to provide discovery information to you EC2 instances using AWS Tags.

## Managing AWS tags

It is possible to get references to the managed objects in both tools. So, we can use this ability to provide discovery information for example for our servers using AWS Tags.

Let assume, that you have Web-app that is connected to your MongoDB instance. It is quite common case.

Terraform example:

```hcl
resource "aws_instance" "mongodb" {
  ami = "ami-46c1b650"
  instance_type = "m1.small"
  subnet_id = "${aws_subnet.web_subnet.id}"
  vpc_security_group_ids = [
    "${aws_security_group.web_app_sg.id}"]
  key_name = "deployer"

  tags {
    Name = "mongodb"
  }
}

resource "aws_instance" "web_app" {
  ami = "ami-46c1b650"
  instance_type = "m1.small"
  subnet_id = "${aws_subnet.web_subnet.id}"
  vpc_security_group_ids = [
    "${aws_security_group.web_app_sg.id}"]
  key_name = "deployer"

  tags {
    Name = "WebApp"
    MONGODB_HOST = "${aws_instance.mongodb.private_ip}"
  }
}
```

CloudFormation example:

```json
"MongoDB": {
    "Type": "AWS::EC2::Instance",
    "Properties": {
        "SubnetId": {
            "Ref": "PrivateSubnet"
        },
        "ImageId": {
            "Ref": "GeneralImage"
        },
        "InstanceType": "t2.small",
        "KeyName": {
            "Ref": "SSHKeyName"
        },
        "SecurityGroupIds": [
            {
                "Ref": "SecurityGroupForMongoDB"
            }
        ],
        "Tags": [
            {
                "Key": "Name",
                "Value": "MongoDB"
            }
        ]
    }
}

"WebApp": {
    "Type": "AWS::EC2::Instance",
    "Properties": {
        "SubnetId": {
            "Ref": "PublicSubnet"
        },
        "ImageId": {
            "Ref": "GeneralImage"
        },
        "InstanceType": "t2.small",
        "KeyName": {
            "Ref": "SSHKeyName"
        },
        "SecurityGroupIds": [
            {
                "Ref": "SecurityGroupForWebApp"
            }
        ],
        "Tags": [
            {
                "Key": "Name",
                "Value": "WebApp"
            },
            {
                "Key": "MONGODB_HOST",
                "Value": {
                    "Ref": "MongoDB"
                }
            }
        ]
    }
}
```

Well, that’s how you’re providing some discovery information to your instances using Tags.

## Put EC2 tags to Linux environment variables

First of all you need to add you instance permissions for launching aws cli command. Create AWS IAM Role for your EC2 instances with the following Policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "ec2:DescribeTags",
      "Resource": "*",
      "Effect": "Allow"
    }
  ]
}
```

This Policy will allow your instances just to get Tags information in your EC2 infrastructure.

Now the simplest part. A small script for getting your instance Tags as environment variables:

```sh
#!/bin/bash

REGION=`curl -s http://169.254.169.254/latest/dynamic/instance-identity/document|grep region|awk -F\" '{print $4}'`

get_instance_tags () {
    instance_id=$(/usr/bin/curl --silent http://169.254.169.254/latest/meta-data/instance-id)
    echo $(/usr/local/bin/aws ec2 describe-tags --filters "Name=resource-id,Values=$instance_id" --region=${REGION})
}

get_ami_tags () {
    ami_id=$(/usr/bin/curl --silent http://169.254.169.254/latest/meta-data/ami-id)
    echo $(/usr/local/bin/aws ec2 describe-tags --filters "Name=resource-id,Values=$ami_id" --region=${REGION})
}

tags_to_env () {
    tags=$1

    for key in $(echo $tags | /usr/bin/jq -r ".[][].Key"); do
        value=$(echo $tags | /usr/bin/jq -r ".[][] | select(.Key==\"$key\") | .Value")
        key=$(echo $key | /usr/bin/tr '-' '_' | /usr/bin/tr '[:lower:]' '[:upper:]')
        export $key="$value"
    done
}

ami_tags=$(get_ami_tags)
instance_tags=$(get_instance_tags)

tags_to_env "$ami_tags"
tags_to_env "$instance_tags"
```

Here we’re getting AWS Region information from the MetaData service, getting AWS Instance and AMI Tags for EC2 instance by it’s InstanceId and AmiId. And using [jq](https://stedolan.github.io/jq/) utility to extract right values from JSON response of `aws` cli command.

## Final words

That’s it for now. Hope, this help you to save some time automating your AWS infrastructure.
