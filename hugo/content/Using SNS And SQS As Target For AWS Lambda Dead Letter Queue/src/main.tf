variable "region" {
    default = "us-east-1"
    description = "AWS Region to deploy to"
}

variable "app_env" {
    default = "failure_detection_example"
    description = "AWS Region to deploy to"
}

variable "sns_subscription_email_address_list" {
    type = string
    description = "List of email addresses as string(space separated)"
}

data "aws_caller_identity" "current" {}

data "archive_file" "lambda_zip" {
    source_dir  = "${path.module}/lambda/"
    output_path = "${path.module}/lambda.zip"
    type        = "zip"
}

provider "aws" {
    region = "${var.region}"
}

resource "aws_iam_policy" "lambda_policy" {
    name        = "${var.app_env}-lambda-policy"
    description = "${var.app_env}-lambda-policy"

    policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "sns:Publish"
      ],
      "Effect": "Allow",
      "Resource": "${aws_sns_topic.dlq.arn}"
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

resource "aws_iam_role" "iam_for_terraform_lambda" {
    name = "${var.app_env}-lambda-role"
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

resource "aws_iam_role_policy_attachment" "terraform_lambda_iam_policy_basic_execution" {
    role = "${aws_iam_role.iam_for_terraform_lambda.id}"
    policy_arn = "${aws_iam_policy.lambda_policy.arn}"
}

resource "aws_lambda_function" "error_function" {
    filename = "lambda.zip"
    source_code_hash = data.archive_file.lambda_zip.output_base64sha256
    function_name = "${var.app_env}-lambda"
    role = "${aws_iam_role.iam_for_terraform_lambda.arn}"
    handler = "index.handler"
    runtime = "python3.6"

    dead_letter_config {
        target_arn = aws_sns_topic.dlq.arn
    }
}

resource "aws_sns_topic" "dlq" {
    name = "${var.app_env}-errors-sns"

    provisioner "local-exec" {
        command = "sh sns_subscription.sh"
        environment = {
            sns_arn = self.arn
            sns_emails = var.sns_subscription_email_address_list
        }
    }
}

resource "aws_cloudwatch_log_group" "lambda_loggroup" {
    name = "/aws/lambda/${aws_lambda_function.error_function.function_name}"
    retention_in_days = 14
}

///////////////////////// CloudWatch Events /////////////////////////
resource "aws_cloudwatch_log_metric_filter" "lambda_exceptions" {
    name = "${var.app_env}_lambda_exceptions"
    pattern = "\"Exception\""
    log_group_name = "${aws_cloudwatch_log_group.lambda_loggroup.name}"
    metric_transformation {
        name = "${var.app_env}_lambda_exceptions"
        namespace = "MyCustomMetrics"
        value = 1
    }
}

resource "aws_cloudwatch_metric_alarm" "lambda_exceptions" {
    alarm_name = "${var.app_env}_lambda_exceptions"
    comparison_operator = "GreaterThanOrEqualToThreshold"
    evaluation_periods = "1"
    metric_name = "${var.app_env}_lambda_exceptions"
    namespace = "MyCustomMetrics"
    period = "10"
    statistic = "Average"
    threshold = "1"
    alarm_description = "This metric monitors Lambda logs for 'Exception' keyword"
    insufficient_data_actions = []
    alarm_actions = [aws_sns_topic.dlq.arn]
}

output "lambda_name" {
    value = "${aws_lambda_function.error_function.id}"
}
