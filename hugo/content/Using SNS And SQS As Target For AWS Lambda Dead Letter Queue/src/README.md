# Terraform - Monitoring failures of Lambda function

This is an example for [Using SNS And SQS As Target For AWS Lambda Dead Letter Queue](https://hands-on.cloud/using-sns-and-sqs-as-target-for-aws-lambda-dead-letter-queue/).

This Terrafrom code will setup:

* SNS as DLQ for Lambda function - You'll get email notifications each time your Lambda failures
* CloudWatch Log Metric Filter and Alarm - You'll get email notifications each time your Lambda logs contains 'Exception' keyword

## Deployment

Set up `sns_subscription_email_address_list` with a list of email addresses for notifications.

```sh
terrafrom init
terrafrom apply
```

## Testing

```sh
aws lambda invoke --function-name failure_detection_example-lambda --invocation-type Event --payload file://payload.json response.json
```

## Cleanup

```sh
terrafrom destroy
```

## Delivered by

This code is delivered to you by [hands-on.cloud](https://hands-on.cloud).

For any additional help, please, contact us: [info@hands-on.cloud](mailto:info@hands-on.cloud)
