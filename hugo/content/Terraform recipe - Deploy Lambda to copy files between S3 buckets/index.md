---
title: 'Terraform recipe - Deploy Lambda to copy files between S3 buckets'
date: '2020-08-14'
image: 'Terraform recipe - Deploy Lambda to copy files between S3 buckets'
tags:
  - s3
  - lambda
  - terraform
  - iam
categories:
  - AWS
  - DevOps
authors:
  - Tom Clemente
  - Andrei Maksimov
---
# Terraform recipe - Deploy Lambda to copy files between S3 buckets

{{< my-picture name="Terraform recipe - Deploy Lambda to copy files between S3 buckets" >}}

Many frameworks exist on the market right now, which allows you to deploy your serverless infrastructure. But what if you have an on-going project, which uses Terraform as an infrastructure management tool? What if you’re apprehensive about changing your technology stack? In this article, we’ll show you in detail on how to start your Serverless journey while keeping Terraform in place.

In this article, we will expand our Serverless experience using Terraform’s ability to provision infrastructure as a code. As an example, we’ll deploy a Lambda function that is triggered by S3 object upload event and copy uploaded objects from one S3 bucket to another.

{{< asciinema id="353586" >}}

If you’re willing to [jump to the final solution](#complete-source-code), please, feel free to do that.

## Terraform configuration

We're assuming that you already have Terraform installed on your local machine or EC2 instance. If not, please, follow the official installation guide here: [Terraform Installation Guide](https://learn.hashicorp.com/terraform/getting-started/install.html).

Here’s our project structure:

```sh
tree
.
├── README.md
├── lambda
│   └── index.py
└── main.tf

1 directory, 3 files
```

Here:

* `main.tf` - Terraform code for infrastructure configuration in AWS cloud
* `lambda` - folder containing Lambda function source code written in Python
* `README.md` - a short description hot to use the example


Terraform code is in `main.tf` file contains the following resources:

* Source & Destination S3 buckets
* Lambda Function
* Necessary IAM permissions

Here’s how we built it.

First, we declared a couple of input variables to parametrize Terraform stack.

```hcl
variable "aws_region" {
    default = "us-east-1"
    description = "AWS Region to deploy to"
}

variable "env_name" {
    default = "s3-to-s3-copy-example"
    description = "Terraform environment name"
}
```

* `aws_region` - region set-up AWS Region, in which Terraform is to deploy declared resources. Some of AWS resources are region-specific, so it is worth checking this a great list of [supported services for every AWS Region](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/) upfront.

* `env_name` - variable names your deployment environment. You may use something like dev, test, prod or something else here. This variable helps you to deploy many Terraform stacks from this configuration.

If you need a further reference on how to use Terraform’s variable, you can get it here: [Input Variables - Configuration Language](https://www.terraform.io/docs/configuration/variables.html).

```hcl
data "archive_file" "my_lambda_function" {
  source_dir  = "${path.module}/lambda/"
  output_path = "${path.module}/lambda.zip"
  type        = "zip"
}
```

The statement is a data source block that archives our existing lambda function into a zip file. For more information about data sources, you can refer to this link: [Data Sources - Configuration Language](https://www.terraform.io/docs/configuration/data-sources.html)

```hcl
provider "aws" {
  region = "${var.region}"
}
```

This `provider` block tells, that we’re using the AWS cloud platform.

Full and up-to-date lists of additionally supported platforms like Azure, Google Cloud, and many others can be found at [Terraform - Providers](https://www.terraform.io/docs/providers/).

### IAM Roles and Policies

To let Lambda function copy files between S3 buckets we need to give it those permissions. Those permissions are granted by using IAM Roles and Policies.

```hcl
resource "aws_iam_policy" "lambda_policy" {
  name        = "${var.app_env}_lambda_policy"
  description = "${var.app_env}_lambda_policy"

  policy = <<EOF
{
 "Version": "2012-10-17",
 "Statement": [
   {
     "Action": [
       "s3:ListBucket",
       "s3:GetObject",
       "s3:CopyObject",
       "s3:HeadObject"
     ],
     "Effect": "Allow",
     "Resource": [
       "arn:aws:s3:::${var.env_name}-src-bucket",
       "arn:aws:s3:::${var.env_name}-src-bucket/*"
     ]
   },
   {
     "Action": [
       "s3:ListBucket",
       "s3:PutObject",
       "s3:PutObjectAcl",
       "s3:CopyObject",
       "s3:HeadObject"
     ],
     "Effect": "Allow",
     "Resource": [
       "arn:aws:s3:::${var.env_name}-dst-bucket",
       "arn:aws:s3:::${var.env_name}-dst-bucket/*"
     ]
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
```

This IAM Policy gives Lambda function minimal permissions to copy uploaded objects from one S3 bucket to another. Lambda function will be able to send logs to CloudWatch too.

Sending logs to CloudWatch is very useful, when you want to debug and track the function when making changes.

The next block allows Lambda to assume the IAM Roles.

```hcl
resource "aws_iam_role" "s3_copy_function" {
   name = "app_${var.env_name}_lambda"
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
```

Let’s tie IAM Role and Policy together. Now IAM Role is ready to be assigned to Lambda function to grant it S3 and CloudWatch permissions:

```hcl
resource "aws_iam_role_policy_attachment" "terraform_lambda_iam_policy_basic_execution" {
 role = "${aws_iam_role.s3_copy_function.id}"
 policy_arn = "${aws_iam_policy.lambda_policy.arn}"
}
```

Next, let’s grants the source S3 bucket the [permission to trigger our Lambda function](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_permission):

```hcl
resource "aws_lambda_permission" "allow_terraform_bucket" {
   statement_id = "AllowExecutionFromS3Bucket"
   action = "lambda:InvokeFunction"
   function_name = "${aws_lambda_function.s3_copy_function.arn}"
   principal = "s3.amazonaws.com"
   source_arn = "${aws_s3_bucket.source_bucket.arn}"
}
```

* `statement_id` - this is an identifier string for the granting rule for S3 bucket
* `action` - the action that we’re enabling S3 to perform (call Lambda function)
* `function_name` - the Lambda function name which will be executed
* `principal` - the S3 service URL
* `source_arn` - this is the ARN of the source S3 bucket

### Lambda function

`source_code_hash` - tells Terraform to check the hash value of our Lambda function archive during deployment. It helps Terraform decide if he needs to redeploy the function.

During the Lambda resource declaration, you need to specify:

* IAM `role`
* Lambda function `runtime`
* The `handler`, which must point to the entrypoint function in your Lambda code

In our example, `index` - is the filename (`index`.py), which contains Lambda code and `handler` - is the name of the function in the file.

We’re passing destination S3 bucket name and AWS Region to the Lambda function using `DST_BUCKET` and `REGION` environment variables.

```hcl
resource "aws_lambda_function" "s3_copy_function" {
   filename = "lambda.zip"
   source_code_hash = data.archive_file.my_lambda_function.output_base64sha256
   function_name = "${var.env_name}_s3_copy_lambda"
   role = "${aws_iam_role.s3_copy_function.arn}"
   handler = "index.handler"
   runtime = "python3.6"

   environment {
       variables = {
           DST_BUCKET = "${var.env_name}-dst-bucket",
           REGION = "${var.aws_region}"
       }
   }
}
```

Source and destination S3 buckets declarations:

```hcl
resource "aws_s3_bucket" "source_bucket" {
   bucket = "${var.env_name}-src-bucket"
   force_destroy = true
}

resource "aws_s3_bucket" "destination_bucket" {
   bucket = "${var.env_name}-dst-bucket"
   force_destroy = true
}
```

`force_destroy` - allows us to delete the bucket during terraform destroy operation without prior bucket cleanup.

Next, we need to set up a filter for notification events that can force S3 to trigger our Lambda function.

We will use `s3:ObjectCreated:*` so we can get a notification when a file is added in our S3 bucket.

```hcl
resource "aws_s3_bucket_notification" "bucket_terraform_notification" {
   bucket = "${aws_s3_bucket.source_bucket.id}"
   lambda_function {
       lambda_function_arn = "${aws_lambda_function.s3_copy_function.arn}"
       events = ["s3:ObjectCreated:*"]
   }

   depends_on = [ aws_lambda_permission.allow_terraform_bucket ]
}
```

To simplify use case testing let’s use a couple of output blocks to expose the source and destination S3 bucket names:

```hcl
output "Source-S3-bucket" {
 value = "${aws_s3_bucket.source_bucket.id}"
}

output "Destination-S3-bucket" {
 value = "${aws_s3_bucket.destination_bucket.id}"
}
```

## Lambda function source code

As soon as we’re done with declaring infrastructure changes using Terraform, we can develop the Lambda function itself. We’ll do it using Python 3.6:

```py
#!/usr/bin/env python3

import os
import logging
import boto3

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

DST_BUCKET = os.environ.get('DST_BUCKET')
REGION = os.environ.get('REGION')

s3 = boto3.resource('s3', region_name=REGION)

def handler(event, context):
   LOGGER.info('Event structure: %s', event)
   LOGGER.info('DST_BUCKET: %s', DST_BUCKET)

   for record in event['Records']:
       src_bucket = record['s3']['bucket']['name']
       src_key = record['s3']['object']['key']

       copy_source = {
           'Bucket': src_bucket,
           'Key': src_key
       }
       LOGGER.info('copy_source: %s', copy_source)
       bucket = s3.Bucket(DST_BUCKET)
       bucket.copy(copy_source, src_key)

   return {
       'status': 'ok'
   }
```

First, we will import all the required packages

* `os` - will help to retrieve the environment variables
* `logging` - will allow us to configure logging in Python
* `boto3` - is a standard de-factor library in Python to interact with AWS services.

Then we’re importing environment variables and instantiating the boto3 S3 client.

Finally we’re processing the following JSON data structure, which is coming from S3 service:

```json
{
  "Records": [
    {
      "eventVersion": "2.1",
      "eventName": "ObjectCreated:Put",
      "eventTime": "2020-08-15T15:57:27.346Z",
      "userIdentity": {
        "principalId": "AWS:012850762433:admin"
      },
      "eventSource": "aws:s3",
      "requestParameters": {
        "sourceIPAddress": "96.224.85.44"
      },
      "s3": {
        "configurationId": "tf-s3-lambda-20200815155705611700000002",
        "object": {
          "eTag": "19043a424015b8c59b83c9063d0ddebb",
          "sequencer": "005F3805E91E5333FF",
          "key": "Terraform-Logo-1.png",
          "size": 5551
        },
        "bucket": {
          "arn": "arn:aws:s3:::s3-to-s3-copy-example-src-bucket",
          "name": "s3-to-s3-copy-example-src-bucket",
          "ownerIdentity": {
            "principalId": "A1W385KKD8Q319"
          }
        },
        "s3SchemaVersion": "1.0"
      },
      "responseElements": {
        "x-amz-id-2": "G/XzD9O7aMv1a7wH4xL3edho+QAYIBZ3S9FSBY2zMZtCfyjoLTLFlfyCRyv/kBAxsG2ZP21VwAE7pxk0V+8krUS7vPvmGJlK",
        "x-amz-request-id": "98AF0D323865A3FA"
      },
      "awsRegion": "us-east-1"
    }
  ]
}
```

For every object creation and modification event in the source S3 bucket, Lambda function will:

* Process event information to extract the source bucket and created/modified object names
* Copy object from a source to the destination S3 bucket with the same name

## Complete source code

Full source code of the example can be found at [Hands-On.Cloud GitHub page](https://github.com/hands-on-cloud/hands-on.cloud/tree/master/hugo/content/Terraform%20recipe%20-%20Deploy%20Lambda%20to%20copy%20files%20between%20S3%20buckets/src)

## Resume

In this article, we showed how to use Terraform to manage the deployment of Lambda functions.  We created a simple function, which copies uploaded objects from one S3 bucket to another.

We hope that this article will save you some time in your projects.
