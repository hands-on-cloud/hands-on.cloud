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
