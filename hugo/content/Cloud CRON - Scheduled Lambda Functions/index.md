---
title: 'Cloud CRON - Scheduled Lambda Functions'
date: '2020-08-17'
image: 'Cloud-CRON-Scheduled-Lambda-Functions'
tags:
  - python
  - cloudformation
  - lambda
  - ec2
  - volume
  - snapshot
  - boto3
categories:
  - AWS
  - Serverless
  - Terraform
authors:
  - Andrei Maksimov
---

From this article, you’ll learn how to create scheduled jobs at AWS cloud using CloudWatch Events and Lambda functions. Basically, it’s your personal cloud Cron at almost no cost.

As usual, we’re providing some additional reading to those of you, who interested. If you’re looking for a solution only, please, [jump here](#complete-source-code).

## Benefits of using Scheduled AWS Lambda functions

In the old-school world of on-prem Cron jobs, a significant amount of time went into managing the execution of these tasks. The crontab syntax itself is difficult to read, which frequently leads systems engineers to rely on online crontab formatters to translate the archaic time and date formats using online crontab generators. This lead [systemd.timer](https://www.man7.org/linux/man-pages/man5/systemd.timer.5.html) to include a modified, more readable implementation.

However, neither of these solves the inherent problems associated with the state. If you run a Cron job on a single server, and that server goes down, the Cron job might never run or run at the wrong time. If you put the job on multiple servers, you need to implement some sort of distributed state storage to ensure there isn’t a duplicate execution of the job. Spread this across an entire organization and you end up with a web of disparate Cron implementations.

Thankfully, we can solve both of these problems and more with AWS Lambdas. Lambda is the AWS service that provides serverless functions. “Serverless” functions, despite what the name implies, do run on servers. However you, the user, do not need to manage the underlying server. You simply write your code in the language of your choice, upload it to a Lambda, and it executes it! The application auto-scales based on the workload, billing is per 100 milliseconds of execution time, and performance is consistent between runs.

This means you don't need to worry about hosts going down, or even keeping a host maintained, as the AWS control plane automatically ensures you get a high-availability platform for running the Lambda.

There are two ways of using Lambdas as Cron jobs. First, we can use `rate()` to execute a lambda at a given interval. This is configured using the CloudWatch events rate expressions format `rate(<value> <unit>`. For example, if I want to execute a Lambda once every five minutes, I would use `rate(5 minutes)`. For once a week, I would use `rate(7 days)`. Simple!

Cron jobs use a slightly different format, but provide much flexibility in implementation. The cron syntax is `cron(<minutes> <hours> <day of month> <month> <day of week> <year>)`. This is a bit complicated at first glance, but let's walk through.

To run at 09:15 UTC every day, use the following:

```c
cron(15 9 * * ? *)
```

To run at 18:00 UTC (6:00 PM) every day, use this:

```c
cron(0 18 ? * * ? *)
```

The `?` character operates as a wildcard, matching all possible values.

Getting a little fancier, let's say we want to execute every 10 minutes on weekdays. We can do that with shortnames for weekdays.

```c
cron(0/10 * ? * MON-FRI *)
```

For a more detailed look at scheduling cron jobs with Lambdas, check out the upstream AWS documentation on [cron jobs with Lambda](https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchevents-expressions.html) and [CloudWatch Events scheduling expressions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html).

## CloudFormation example

Let's create a simple AWS Lambda that deletes outdated EC2 AMIs and EBS Snapshots once a day. 

Here's a [CloudFormation template](src/cloudformation.yaml) with implementation.

```yaml
AWSTemplateFormatVersion: 2010-09-09
Description: >
  This CloudFormation template creates a Lambda function triggered
  by the CloudWatch Scheduled Events, which deletes old EC2 AMIs

Parameters:
  pAmiMaxAge:
    Description: Max age in days for AMI
    Type: Number
    Default: 14
    MinValue: 1
    MaxValue: 65535

Resources:
  LambdaFunctionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
        - Effect: Allow
          Principal:
            Service:
              - lambda.amazonaws.com
          Action:
            - sts:AssumeRole
      Path: "/"
      Policies:
      - PolicyName: LambdaFunctionPolicy
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
          - Effect: Allow
            Action:
              - logs:CreateLogGroup
              - logs:CreateLogStream
              - logs:PutLogEvents
            Resource: '*'
          - Effect: Allow
            Action:
              - ec2:DescribeImages
              - ec2:DescribeSnapshotAttribute
              - ec2:DescribeSnapshots
              - ec2:DeleteSnapshot
              - ec2:DescribeImages
              - ec2:DescribeImageAttribute
              - ec2:DeregisterImage
              - ec2:DescribeInstances
            Resource: '*'

  LambdaFunction:
    Type: AWS::Lambda::Function
    Properties:
      Runtime: python3.6
      Timeout: 900
      Handler: index.handler
      Role: !GetAtt LambdaFunctionRole.Arn
      Code:
        ZipFile:
          !Sub
            - |-
              """
              Lambda function to remove outdated AMIs
              All credits: https://gist.github.com/luhn/802f33ce763452b7c3b32bb594e0d54d
              """
              import logging
              import os
              import re
              import sys
              from datetime import datetime, timedelta
              import boto3

              logging.basicConfig(stream=sys.stdout, level=logging.INFO)
              LOGGER = logging.getLogger()
              LOGGER.setLevel(logging.INFO)

              ACCOUNT_ID = '${lambda_account_id}'
              AMI_MAX_AGE = int(${lambda_ami_max_age})

              EC2 = boto3.resource("ec2")
              EC2_CLIENT = boto3.client("ec2")

              def handler(event, context):
                  """handler method"""
                  # pylint: disable=R0914,C0103,W0613

                  my_amis = EC2_CLIENT.describe_images(Owners=[ACCOUNT_ID])['Images']

                  used_amis = {
                      instance.image_id for instance in EC2.instances.all()
                  }

                  LOGGER.info('used_amis: %s', used_amis)

                  fresh_amis = set()
                  for ami in my_amis:
                      created_at = datetime.strptime(
                          ami['CreationDate'],
                          "%Y-%m-%dT%H:%M:%S.000Z",
                      )
                      if created_at > datetime.now() - timedelta(AMI_MAX_AGE):
                          fresh_amis.add(ami['ImageId'])

                  LOGGER.info('fresh_amis: %s', fresh_amis)

                  latest = dict()
                  for ami in my_amis:
                      created_at = datetime.strptime(
                          ami['CreationDate'],
                          "%Y-%m-%dT%H:%M:%S.000Z",
                      )
                      name = ami['Name']
                      if(
                              name not in latest
                              or created_at > latest[name][0]
                      ):
                          latest[name] = (created_at, ami)
                  latest_amis = {ami['ImageId'] for (_, ami) in latest.values()}

                  LOGGER.info('latest_amis: %s', latest_amis)

                  safe = used_amis | fresh_amis | latest_amis
                  for image in (
                          image for image in my_amis if image['ImageId'] not in safe
                  ):
                      LOGGER.info('Deregistering %s (%s)', image['Name'], image['ImageId'])
                      EC2_CLIENT.deregister_image(ImageId=image['ImageId'])

                  LOGGER.info('Deleting snapshots.')
                  images = [image['ImageId'] for image in my_amis]
                  for snapshot in EC2_CLIENT.describe_snapshots(OwnerIds=[ACCOUNT_ID])['Snapshots']:
                      LOGGER.info('Checking %s', snapshot['SnapshotId'])
                      r = re.match(r".*for (ami-.*) from.*", snapshot['Description'])
                      if r:
                          if r.groups()[0] not in images:
                              LOGGER.info('Deleting %s', snapshot['SnapshotId'])
                              EC2_CLIENT.delete_snapshot(SnapshotId=snapshot['SnapshotId'])
            -
              lambda_account_id: !Ref "AWS::AccountId"
              lambda_ami_max_age: !Ref "pAmiMaxAge"

  ScheduledRule:
    Type: AWS::Events::Rule
    Properties:
      Description: "ScheduledRule"
      ScheduleExpression: "rate(1 day)"
      State: "ENABLED"
      Targets:
        -
          Arn:
            Fn::GetAtt:
              - "LambdaFunction"
              - "Arn"
          Id: "TargetFunctionV1"

  PermissionForEventsToInvokeLambda:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName:
        Ref: "LambdaFunction"
      Action: "lambda:InvokeFunction"
      Principal: "events.amazonaws.com"
      SourceArn:
        Fn::GetAtt:
          - "ScheduledRule"
          - "Arn"
```

In this example we're declaring `LambdaFunctionRole` with all necessary permissions to the Lambda function `LambdaFunction` to allow it managing Snapshots and Volumes. `ScheduledRule` CloudWatch Event Rule is to be executed on a daily basis. It is allowed to  execute our Lambda function because of `PermissionForEventsToInvokeLambda`.

Lambda function code itself is also straightforward. Here's the logic:

* Import all necessary libraries
* Builds everal lists
  * All account AMIs
  * Used AMIs
  * Latest AMIs
* Delete all AMIs, which are safe to delete from this list
* Deregisted unused snapshots

### CloudFormation deployment

To deploy this stack execute the following command:

```sh
aws cloudformation create-stack \
  --stack-name "test-scheduled-lambda" \
  --template-body "file://$(pwd)/cloudformation.yaml" \
  --capabilities CAPABILITY_IAM

aws cloudformation wait stack-create-complete \
  --stack-name "test-scheduled-lambda"
```

### CloudFormation cleanup

To clean up everything we need to execute:

```sh
aws cloudformation delete-stack \
  --stack-name "test-scheduled-lambda"
```

## Terraform example

We may implement the same example, but using Terraform

```tf
variable "aws_region" {
    default = "us-east-1"
    description = "AWS Region to deploy to"
}

variable "env_name" {
    default = "sheduled-lambda-cron"
    description = "Terraform environment name"
}

variable "ami_max_age" {
    default = "14"
    description = "Max age in days for AMI"
}

data "archive_file" "delete_old_amis_lambda" {
  source_dir  = "${path.module}/lambda/"
  output_path = "/tmp/lambda.zip"
  type        = "zip"
}

data "aws_caller_identity" "current" {}

provider "aws" {
    region = "${var.aws_region}"
}

resource "aws_kms_key" "a" {}

resource "aws_kms_alias" "lambda" {
  name          = "alias/lambda"
  target_key_id = aws_kms_key.a.key_id
}

resource "aws_iam_policy" "lambda_policy" {
    name        = "${var.env_name}_delete_old_amis_lambda_function"
    description = "${var.env_name}_delete_old_amis_lambda_function"

    policy = <<EOF
{
 "Version": "2012-10-17",
 "Statement": [
   {
     "Action": [
       "kms:ListAliases",
       "kms:Decrypt"
     ],
     "Effect": "Allow",
     "Resource": "${aws_kms_alias.lambda.arn}"
   },
   {
     "Action": [
       "ec2:DescribeImages",
       "ec2:DescribeSnapshotAttribute",
       "ec2:DescribeSnapshots",
       "ec2:DeleteSnapshot",
       "ec2:DescribeImages",
       "ec2:DescribeImageAttribute",
       "ec2:DeregisterImage",
       "ec2:DescribeInstances",
       "kms:ListAliases",
       "kms:Decrypt"
     ],
     "Effect": "Allow",
     "Resource": "*"
   },
   {
     "Action": [
       "logs:CreateLogGroup",
       "logs:CreateLogStream",
       "logs:PutLogEvents"
     ],
     "Effect": "Allow",
     "Resource": "*"
   }
 ]
}
EOF
}

resource "aws_iam_role" "delete_old_amis" {
   name = "app_${var.env_name}_lambda_role"
   assume_role_policy = <<EOF
{
 "Version": "2012-10-17",
 "Statement": [
   {
     "Action": "sts:AssumeRole",
     "Principal": {
       "Service": "lambda.amazonaws.com"
     },
     "Effect": "Allow"
   }
 ]
}
EOF
}

resource "aws_lambda_function" "delete_old_amis" {
   filename = "/tmp/lambda.zip"
   source_code_hash = data.archive_file.delete_old_amis_lambda.output_base64sha256
   function_name = "${var.env_name}_delete_old_amis_lambda"
   role = "${aws_iam_role.delete_old_amis.arn}"
   handler = "index.handler"
   runtime = "python3.6"
   timeout = 900

   environment {
       variables = {
            ACCOUNT_ID = "${data.aws_caller_identity.current.account_id}",
            AMI_MAX_AGE = "${var.ami_max_age}"
       }
   }
}

resource "aws_iam_role_policy_attachment" "delete_old_amis" {
    role = "${aws_iam_role.delete_old_amis.id}"
    policy_arn = "${aws_iam_policy.lambda_policy.arn}"
}

resource "aws_cloudwatch_event_rule" "delete_old_amis" {
  name                = "${var.env_name}_delete_old_amis"
  description         = "${var.env_name}_delete_old_amis"
  schedule_expression = "rate(1 day)"
}

resource "aws_cloudwatch_event_target" "delete_old_amis" {
  rule      = "${aws_cloudwatch_event_rule.delete_old_amis.name}"
  target_id = "lambda"
  arn       = "${aws_lambda_function.delete_old_amis.arn}"
}

resource "aws_lambda_permission" "cw_call_delete_old_amis_lambda" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.delete_old_amis.function_name}"
  principal     = "events.amazonaws.com"
  source_arn    = "${aws_cloudwatch_event_rule.delete_old_amis.arn}"
}

resource "aws_cloudwatch_log_group" "delete_old_amis" {
    name = "/aws/lambda/${aws_lambda_function.delete_old_amis.function_name}"
    retention_in_days = 14
}
```

### Terraform deployment

To deploy this stack execute the following command:

```sh
terraform init
terraform apply -auto-approve
```

### Terraform cleanup

To clean up everything we need to execute:

```sh
terraform destroy -auto-approve
```

## Complete source code

Full source code of the example can be found at [our GitHub](https://github.com/hands-on-cloud/hands-on.cloud/tree/master/hugo/content/Cloud%20CRON%20-%20Scheduled%20Lambda%20Functions/src)

## Resume

In this article, we showed how to use CloudFormation and Terraform to deploy shaduled Lambda functions. We created a simple function, which deleted outdated AMIs and Snapshots from your account.

We hope that this article will save you some time in your projects. If you found this article useful, please, help us spread it to the world.
