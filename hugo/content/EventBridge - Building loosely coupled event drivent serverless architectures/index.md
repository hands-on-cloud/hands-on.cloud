---
title: 'EventBridge - Building event driven Serverless architectures'
date: '2020-03-29'
image: 'EventBridge-Building-loosely-coupled-event-driven-serverless-architectures'
tags:
  - python
  - cloudformation
  - step functions
  - lambda
  - s3
  - cloudwatch
categories:
  - AWS
authors:
  - Andrei Maksimov
---

From this article you'll learn, what is [Amazon EventBridge](https://aws.amazon.com/eventbridge/), what problems it help to solve and how you can use it to simplify your event driven workflows.

## What's Amazon EventBridge

The very first thing we need to do, is to describe EventBridge. From the official service page:

> Amazon EventBridge is a serverless event bus that makes it easy to connect applications together using data from your own applications, integrated Software-as-a-Service (SaaS) applications, and AWS services.

The main purpose of Amazon EventBridge is to accept events from many different sources and route them to one or more targets. That helps you simplify events routing before doing meaningfull work in response to received event.

EventBridge consists of the following entities:

* **Events** - represents a state changes at remote system; you're receiving events as a JSON structure
* **Rules** - matches incoming events and routes them to targets for futher processing
* **Targets** - something, that should react on the events; it is usually something like a Lambda Function, SQS, SNS, EC2 instance, Fargate Task, etc.
* **Event buses** - those receives and routes events. `default` one is receiving your AWS events. You may add more Event Buses to receive events from your partners

Using Amazon EventBridge in your Serverless architecture has several very important benefits:

* It simplifies your entire architecture, as you don't have to manage complex events routing rules
* It simplifies your development process - most of heavy-lifting is done for you by AWS; all you need to do, is to develop you lambda function logic
* It unifies the event processing logic - all events are delivered to your targets, no more need to do SQS pull

## Creating you own EventBridge bus

If you already built a system, which produces events, you may want to start publishing them to EventBidge. Here's an example of doing that.

Let's create a simple EventBus, which receives Events and logs them to CloudWatch (for debugging purpose, for example).

{{< my-picture name="EventBridge-Custom-EventBus" >}}

CloudFormation stack is to create EventBus, which uses CloudWatch LogGroup as a target, may look something like that:

```yaml
AWSTemplateFormatVersion: 2010-09-09

Description: >
    This stack shows how to build your own EventBridge bus

Resources:

    MyCustomEventBus:
        Type: AWS::Events::EventBus
        Properties:
            Name: !Sub '${AWS::StackName}-MyCustomEventBus'

    MyCustomEventBusLogGroup:
        Type: AWS::Logs::LogGroup
        Properties:
            LogGroupName: !Sub '/aws/events/${AWS::StackName}-mycustomevents'
            RetentionInDays: 7

    MyCustomEventBusEventRule:
        Type: AWS::Events::Rule
        Properties:
            Description: 'Catch All EventRule'
            State: 'ENABLED'
            EventBusName: !Ref 'MyCustomEventBus'
            EventPattern:
                account:
                  - !Sub '${AWS::AccountId}'
            Targets:
                -
                    Arn: !Sub 'arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:${MyCustomEventBusLogGroup}'
                    Id: !Sub 'MyCustomEventBusLogGroup'
```

## Sending events to your own EventBridge bus

As soon as you have your custom EventBus created, we may use boto3 library to send up to 10 events at a time from to it:

```py
import json
from datetime import datetime
import boto3

# EventBridge client
eventbridge_client = boto3.client('events')

# Example event from your application
my_application_event_example = {
    'service': 'myapp service',
    'status': 'restored'
}

# Structure of EventBridge Event
eventbridge_event = {
    'Time': datetime.utcnow(),
    'Source': 'com.mycompany.myapp',
    'Detail': json.dumps(my_application_event_example),
    'DetailType': 'service_status',
    'EventBusName': 'MyCustomEventBus'
}

# Send event to EventBridge
response = eventbridge_client.put_events(
    Entries=[
        eventbridge_event
    ]
)
```

As a result, you should see something similar at your CloudWatch logs:

{{< my-picture name="EventBridge-CloudWatch-Target" >}}

## Subscribing to EventBridge S3 events

Now let's take a look on more complex example of using EventBridge. Let's subscribe on S3 events, which are coming from CloudTrail service, and use Lambda Function as a target.

{{< my-picture name="EventBridge-EventBus-CloudTrail-S3-Example" >}}

In the stack template below we're creating two buckets:

* `S3bucket` - bucket to demo upload operation
* `CloudTrailS3bucket` - bucket to store CloudTrail Logs

CloudTrail may be configured for each of you, so we'll create a new trail to garantee the result. We need to enable Object Level Logging (`S3ObjectLevelCloudTrail`) for S3 bucket first. Now we can receive EventBridge events and process them in Lambda function.

Lambda function does only logging operation of incoming event for a simplicity of an example. And we also use CloudWatch logging as a second target (that helped me to debug the stack).

```yaml
AWSTemplateFormatVersion: 2010-09-09

Description: >
    This stack shows how to trigger Lambda function in response
    on S3 event

Resources:

    CloudTrailS3bucket:
        Type: AWS::S3::Bucket

    S3bucket:
        Type: AWS::S3::Bucket

    LambdaIamRole:
        Type: 'AWS::IAM::Role'
        Properties:
            AssumeRolePolicyDocument:
                Version: 2012-10-17
                Statement:
                    -
                        Effect: Allow
                        Principal:
                            Service:
                                - lambda.amazonaws.com
                        Action:
                            - 'sts:AssumeRole'
            Path: /
            Policies:
                -
                    PolicyName: root
                    PolicyDocument:
                        Version: 2012-10-17
                        Statement:
                            -
                                Effect: Allow
                                Action:
                                    - 's3:GetObject'
                                Resource:
                                  - !Sub '${S3bucket.Arn}'
                                  - !Sub '${S3bucket.Arn}/*'
                            -
                                Effect: Allow
                                Action:
                                    - 'logs:CreateLogGroup'
                                    - 'logs:CreateLogStream'
                                    - 'logs:PutLogEvents'
                                Resource: 'arn:aws:logs:*:*:*'

    LambdaPermissions:
        Type: AWS::Lambda::Permission
        Properties:
            FunctionName: !GetAtt LambdaFunction.Arn
            Action: lambda:InvokeFunction
            Principal: events.amazonaws.com
            SourceArn: !GetAtt EventBridgeRule.Arn

    LambdaFunction:
        Type: AWS::Lambda::Function
        Properties:
            Handler: index.handler
            Role: !GetAtt LambdaIamRole.Arn
            Runtime: python3.6
            Timeout: 30
            Code:
                ZipFile: |
                    import logging

                    LOGGER = logging.getLogger(__name__)
                    LOGGER.setLevel(logging.INFO)

                    def handler(event, context):
                        LOGGER.info('Event: %s', event)

    EventBridgeLogGroup:
        Type: AWS::Logs::LogGroup
        Properties:
            LogGroupName: !Sub '/aws/events/${AWS::StackName}-s3-events'
            RetentionInDays: 7

    EventBridgeRule:
        Type: AWS::Events::Rule
        Properties:
            Description: 'Rule, that send S3 events to Lambda function'
            State: 'ENABLED'
            EventPattern:
                source:
                    - 'aws.s3'
                detail-type:
                    - 'AWS API Call via CloudTrail'
                detail:
                    eventSource:
                        - 's3.amazonaws.com'
                    eventName:
                        - 'PutObject'
                    requestParameters:
                        bucketName:
                            - !Sub '${S3bucket}'
            Targets:
                -
                    Arn: !Sub 'arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:${EventBridgeLogGroup}'
                    Id: !Sub 'EventBridgeLogGroup'
                -
                    Arn: !Sub '${LambdaFunction.Arn}'
                    Id: 'TargetFunctionV1'

    CloudTrailS3Policy:
        Type: AWS::S3::BucketPolicy
        Properties:
            Bucket: !Sub '${CloudTrailS3bucket}'
            PolicyDocument:
                Version: '2012-10-17'
                Statement:
                    -
                        Effect: Allow
                        Principal:
                            Service: 'cloudtrail.amazonaws.com'
                        Action: 's3:GetBucketAcl'
                        Resource: !Sub '${CloudTrailS3bucket.Arn}'
                    -
                        Effect: Allow
                        Principal:
                            Service: 'cloudtrail.amazonaws.com'
                        Action: 's3:PutObject'
                        Resource: !Sub '${CloudTrailS3bucket.Arn}/*AWSLogs/${AWS::AccountId}/*'
                        Condition:
                            StringEquals:
                                's3:x-amz-acl': 'bucket-owner-full-control'

    S3ObjectLevelCloudTrail:
        Type: 'AWS::CloudTrail::Trail'
        DependsOn:
            - CloudTrailS3Policy
        Properties:
            IsLogging: true
            IsMultiRegionTrail: true
            IncludeGlobalServiceEvents: true
            S3BucketName: !Sub '${CloudTrailS3bucket}'
            EventSelectors:
                -
                    DataResources:
                        -
                            Type: 'AWS::S3::Object'
                            Values:
                                - !Sub '${S3bucket.Arn}/'
                    IncludeManagementEvents: true
                    ReadWriteType: All
```

## Simplifying Step Functions long running tasks

Not too far ago we published an article, which is showing [How to manage long running tasks using AWS Step Functions](https://hands-on.cloud/aws-step-functions-how-to-manage-long-running-tasks/). There we created a state machine to wait for DB snapshot operation to finish in a loop. Using EventBridge we may get rid of long running loop and just subscribe only one lambda function to `RDS DB Snapshot Events`:

```json
{
  "source": [
    "aws.rds"
  ],
  "detail-type": [
    "RDS DB Snapshot Event"
  ]
}
```

Here's the CloudFormation template to do that:

```yaml
---
AWSTemplateFormatVersion: 2010-09-09

Description: >
    This stack shows how to react on RDS DB Snapshot events using
    EventBridge

Resources:

    MyCustomEventBusLogGroup:
        Type: AWS::Logs::LogGroup
        Properties:
            LogGroupName: !Sub '/aws/events/${AWS::StackName}-mycustomevents'
            RetentionInDays: 7

    MyCustomEventBusEventRule:
        Type: AWS::Events::Rule
        Properties:
            Description: 'Catch All EventRule'
            State: 'ENABLED'
            EventPattern:
                source:
                    - 'aws.rds'
                account:
                    - !Sub '${AWS::AccountId}'
                detail-type:
                    - 'RDS DB Snapshot Event'
            Targets:
                -
                    Arn: !Sub 'arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:${MyCustomEventBusLogGroup}'
                    Id: !Sub 'MyCustomEventBusLogGroup'
```

Of cause, you can use Lambda Function as a target to do something meaningfull with this information. For example, you may copy DB snapshot to another region for DR purpose.

## AWS Serverless Workshops

If you’d like to get more hands-on experience using EventBridge and serverless technologies, I’d recommend you to take a look on those AWS Workshops:

* [CDK Workshop](https://cdkworkshop.com)
* [Building Event-Driven Architectures on AWS](https://event-driven-architecture.workshop.aws/getting-started.html)
* [Serverless Web Application Workshop](https://github.com/aws-samples/aws-serverless-workshops/tree/master/WebApplication)
* [CI/CD For Serverless Applications](https://cicd.serverlessworkshops.io/)
* [Serverless Image Processing on AWS](https://image-processing.serverlessworkshops.io/)
* [Serverless Security Workshop](https://github.com/aws-samples/aws-serverless-security-workshop)

You may find compleete list of serverless workshops at official [AWS Samples GitHub repository](https://github.com/aws-samples/aws-serverless-workshops).

## Summary

In this article I've showed you how to use EventBridge in a several ways to react on AWS and non-AWS events. I hope, this article will save you some time and help to incorporate EventBridge to your own architecture.

If you found this article useful, please, help to spread it to the world.
