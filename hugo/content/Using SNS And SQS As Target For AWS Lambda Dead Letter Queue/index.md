---
title: 'Using SNS And SQS As Target For AWS Lambda Dead Letter Queue'
date: '2020-08-19'
image: 'Using-SNS-And-SQS-As-Target-For-AWS-Lambda-Dead-Letter-Queue'
tags:
  - lambda
  - cloudwatch
  - sns
  - sqs
categories:
  - AWS
  - Serverless
  - Terraform
authors:
  - Andrei Maksimov
---

As soon as you’re starting developing microservice applications in the Serverless world, you start accepting the idea, that sometimes your microservices may fail. And it’s OK if it does not affect your application or your customer.

But what if your Lambda function does something very important and it becomes critical to know if the function execution failed. For such cases, you may start actively looking for a solutions to monitor your Lambda functions.

There’re several ways you can do it:

* **Collecting and analyzing logs** - you can set up CloudWatch Log Metric Filter and Alarm in the response to the world “Error” or “Exception” occurrence during some time.
* **Collecting and analyzing monitoring metrics** - AWS provides us with a very comprehensive list of [Lambda invocation, performance, and concurrency metrics](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-metrics.html), which you may put to CloudWatch Dashboard. You may set up CloudWatch Alarms on them as well.

Lambda Dead Letter Queue (DLQ) is a special feature, which was [released](https://aws.amazon.com/about-aws/whats-new/2016/12/aws-lambda-supports-dead-letter-queues/) on Dec 1, 2016. This feature allows you to collect information about asynchronous invocation events, which your Lambda failed to process.

Currently, you have 2 options to process is the information:

* SQS
* SNS

{{< my-picture name="Dead Letter Queue Options" >}}

## SQS as Dead Letter Queue

Using SQS as a Lambda DLQ allows you to have a durable store for failed events that can be monitored and picked up for resolution at your convenience. You can process information about Lambda failure events in bulk, have a defined wait period before re-triggering the original event, or you may do something else instead.

Here’s how it works:

{{< my-picture name="Using SQS And SNS For Lambda Dead Letter Queues-SQS" max_width="50%" >}}

* Lambda receives any information from AWS service from the service itself or Eventbridge.
* Lambda attempts to do something meaningful in response to the event, but fails
* Incoming event information (JSON document) is sent it DLQ if it is configured
* CloudWatch Alarm may be configured and triggered if the number of messages in SQS is greater than a certain limit

### SQS Pros

* Bulk processing - you may collect error messages in the queue and process them in a bulk later
* Guaranteed delivery - messages deleted from the queue only when they are processed by some other process or after 14 days by timeout

### SQS Cons

* Not event-driven - messages must be pulled from the queue

## SNS as Dead Letter Queue

SNS or Simple Notification Service from the other side is a key part of any event-driven architecture in AWS. It allows you to process its events almost instantaneously and fan them out to multiple subscribers.

You can use an SNS Topic as a Lambda Dead Letter Queue. This allows you to instantly take action on the failure. For example, you can attempt to re-process the event, alert an individual or a process, or store the event message in SQS for later follow up. And you can do all those things at the same time in parallel.

Here’s how it works:

{{< my-picture name="Using SQS And SNS For Lambda Dead Letter Queues-SNS" >}}

* Lambda receives any information from AWS service from the service itself or Eventbridge.
* Lambda attempts to do something meaningful in response to the event, but fails
* Incoming event information (JSON document) is sent it DLQ if it is configured
* SNS immediately sends the incoming message to multiple destinations

The advantage of using SNS is its ability to send messages to multiple subscribers almost instantaneously in parallel.

### SNS Pros

* Event-driven: SNS will take action instantly upon receiving a message
* Fan-out: SNS allows multiple actions to be taken by different subscribers at the same time in parallel.

### SNS Cons

* SNS is non-durable storage - it will delete received event in 1 hour if it was not processed by any reason

### Terraform implementation

Here’s Terraform implementation of using SNS as Lambda DLQ. Complete source code including scripts and Lambda function is available at [our GitHub](https://github.com/hands-on-cloud/hands-on.cloud/tree/master/hugo/content/Using%20SNS%20And%20SQS%20As%20Target%20For%20AWS%20Lambda%20Dead%20Letter%20Queue/src) repository:

```tf
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
```

This Terraform configuration deploys errored Lambda function, which returns an error during every execution. Lambda function has permissions to send messages to SNS topic and log its errors to CloudWatch.

You may use the following code block to add CloudWatch Metric Filter and Alarm to the Lambda function logs as well:

```tf
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
```

## Resume

In this article, we covered differences in the usage of SNS and SQS as targets for your Lambda functions.

We hope, that this article was helpful. If yes, please, help us spread it to the world!

If you have any questions, which are not covered by this blog, please, feel free to reach us out. We’re willing to help.
