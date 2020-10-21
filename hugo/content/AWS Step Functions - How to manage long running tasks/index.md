---
title: 'AWS Step Functions - How to manage long running tasks'
date: '2020-10-05'
image: 'AWS-Step-Functions-How-to-manage-long-running-tasks'
tags:
  - python
  - cloudformation
  - step functions
  - lambda
  - rds
  - snapshot
  - boto3
categories:
  - AWS
  - Serverless
authors:
  - Andrei Maksimov
---

Managing and orchestrating multiple automation activities in the cloud may be a challenging task. In the article [Cloud CRON - Scheduled Lambda Functions](https://hands-on.cloud/cloud-cron-scheduled-lambda-functions/), we covered how to create and manage simple automation activities in the AWS cloud. By the term "simple," we mean any tasks running no longer than 15 minutes (see [AWS Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)). But what if our job runs longer?

Those scenarios we'll cover in this article.

## AWS Lambda long-running tasks

Long story short, AWS Lambda is not suited for long-running tasks. It is an ideal option for quick and predictable workloads that lasts no longer than 900 seconds or 15 minutes in total. If the process not ended by that time, AWS Lambda stops it automatically.

## Run long-running jobs in AWS

Here's where [AWS Step Functions](https://aws.amazon.com/step-functions/) come into play. AWS Step Functions is a workflow orchestration service. It allows you to describe your workflow (state machine) in a simple JSON structure. This workflow usually consists of multiple Lambda functions and other [AWS services integrated with Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-service-integrations.html). As soon as you described the workflow, AWS Step Functions visualizes it and makes it available for execution. You can visually track the execution process as every single step in the workflow highlights a green, yellow, or red color, making it super helpful to debug the workflow during development.

## Python and boto3 for Step Functions

AWS Step Functions is an orchestration engine. It can execute Lambda functions natively. As soon as AWS Lambda supports Python execution runtime, the boto3 library is available for you out of the box.

If you're making [Custom Lambda runtime](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-custom.html) using [Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html), you can install boto3 to your layer and attach it to the Lambda during its execution.

## Implementing a long-running job

It's a prevalent task for any process orchestration system. And we'll build our solution on top of [Iterating a Loop Using Lambda](https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-create-iterate-pattern-section.html) example from official AWS documentation.

{{< my-picture name="Using Step Functions for workflow orchestration" >}}

As a long-running process, we'll take the RDS instance snapshot creation process. Take a look at this AWS Step Function diagram:

Our AWS Step Functions state machine will consist of:

* [Task](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-task-state.html), which initiates create the RDS Snapshot process (implemented using Lambda Function)
* [Wait](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-wait-state.html) for 1-minute state
* [Task](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-task-state.html), which describes RDS Snapshot Lambda Function
* [Choise](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-choice-state.html) state, which checks DB Snapshot status and either waits, either continues flow control to two stubs
* [Pass](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-pass-state.html) state, which represents state machine **success** or **failed** execution status; in our case, both states do nothing, but you may use them to do extra work, like sending SNS notifications or calling other AWS services

### RDS Snapshot Lambda Function

Here’s a source code for the Lambda function, which will launch a long-running job (RDS snapshot operation):

```py
import boto3
import datetime
import math

RDS_CLIENT = boto3.client('rds')

def handler(event,context):
    print('Event: {}'.format(event))

    now = datetime.datetime.now()
    timestamp = math.ceil(datetime.datetime.timestamp(now))

    params = {
        'DBSnapshotIdentifier': '${db_instance_identifier}-rds-snapshot-{}'.format(
            timestamp
        ),
        'DBInstanceIdentifier': '${db_instance_identifier}'
    }

    response = RDS_CLIENT.create_db_snapshot(**params)

    return {
        'DBSnapshot': {
            'DBSnapshotIdentifier': response['DBSnapshot']['DBSnapshotIdentifier'],
            'DBInstanceIdentifier': response['DBSnapshot']['DBInstanceIdentifier']
        }
    }
```

Our function takes `DBSnapshotIdentifier` and `DBInstanceIdentifier` as parameters and calling [create_db_snapshot()](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/rds.html#RDS.Client.create_db_snapshot) function. As a result of the operation, we're sending Python `dict` to the state machine’s next stage.

### Describe RDS Snapshot Lambda Function

The following Lambda function will help us understand if previously launched RDS snapshot operation has been finished or not by querying its status:

```py
import boto3
import datetime

RDS_CLIENT = boto3.client('rds')

def handler(event,context):
    print('Event: {}'.format(event))
    db_snapshot_identifier = event['DBSnapshot']['DBSnapshotIdentifier']
    db_instance_identifier = event['DBSnapshot']['DBInstanceIdentifier']

    response = RDS_CLIENT.describe_db_snapshots(
        DBSnapshotIdentifier=db_snapshot_identifier,
        DBInstanceIdentifier=db_instance_identifier,
        SnapshotType='manual'
    )

    return {
        'DBSnapshot': {
            'DBSnapshotIdentifier': response['DBSnapshots'][0]['DBSnapshotIdentifier'],
            'DBInstanceIdentifier': response['DBSnapshots'][0]['DBInstanceIdentifier'],
            'Status': response['DBSnapshots'][0]['Status']
        }
    }
```

This function is even simpler because it takes past parameters from the previous step, does [describe_db_snapshots()](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/rds.html#RDS.Client.describe_db_snapshots), and returns the same `dict` with snapshot operation status.

### Step Function Workflow

AWS Step Functions state machine description. Our graph consists of the following steps:

* Create snapshot
* Wait 1 minute
* Get snapshot status
* Snapshot completed?
* Done
* Failed

Here’s a complete workflow (state machine) description:

```json
{
    "Comment": "State machine to create RDS DB instance Snapshot",
    "StartAt": "Create snapshot",
    "States": {
        "Create snapshot": {
            "Type": "Task",
            "Resource": "${create_snapshot_lambda_arn}",
            "Next": "Wait 1 minute"
        },
        "Wait 1 minute": {
            "Type": "Wait",
            "Seconds": 60,
            "Next": "Get snapshot status"
        },
        "Get snapshot status": {
            "Type": "Task",
            "Resource": "${get_snapshot_status_lambda_arn}",
            "Next": "Snapshot completed?"
        },
        "Snapshot completed?": {
            "Type": "Choice",
            "Choices": [
                {
                    "Variable": "$.DBSnapshot.Status",
                    "StringEquals": "available",
                    "Next": "Done"
                },
                {
                    "Variable": "$.DBSnapshot.Status",
                    "StringEquals": "failed",
                    "Next": "Failed"
                }
            ],
            "Default": "Wait 1 minute"
        },
        "Done": {
            "Type": "Pass",
            "End": true
        },
        "Failed": {
            "Type": "Pass",
            "End": true
        }
    }
}
```

### Complete example

And finally, here's the complete CloudFormation stack template, tying everything altogether:

```yaml
AWSTemplateFormatVersion: 2010-09-09

Description: >
    This stack is creating RDS instance snapshot and wait till process finishes.

Parameters:

    DBInstanceIdentifier:
        Description: >
            Identifier of RDS DB instance
        Type: String

Resources:

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
                                    - 'rds:CreateDBSnapshot'
                                    - 'rds:DescribeDBSnapshots'
                                Resource: '*'
                            -
                                Effect: Allow
                                Action:
                                    - 'logs:CreateLogGroup'
                                    - 'logs:CreateLogStream'
                                    - 'logs:PutLogEvents'
                                Resource: 'arn:aws:logs:*:*:*'

    CreateSnapshotLambda:
        Type: AWS::Lambda::Function
        Properties:
            Handler: index.handler
            Role: !GetAtt LambdaIamRole.Arn
            Runtime: python3.6
            Timeout: 30
            Code:
                ZipFile:
                    !Sub
                        - |-
                            import boto3
                            import datetime
                            import math

                            RDS_CLIENT = boto3.client('rds')

                            def handler(event,context):
                                print('Event: {}'.format(event))

                                now = datetime.datetime.now()
                                timestamp = math.ceil(datetime.datetime.timestamp(now))

                                params = {
                                    'DBSnapshotIdentifier': '${db_instance_identifier}-rds-snapshot-{}'.format(
                                        timestamp
                                    ),
                                    'DBInstanceIdentifier': '${db_instance_identifier}'
                                }

                                response = RDS_CLIENT.create_db_snapshot(**params)

                                return {
                                    'DBSnapshot': {
                                        'DBSnapshotIdentifier': response['DBSnapshot']['DBSnapshotIdentifier'],
                                        'DBInstanceIdentifier': response['DBSnapshot']['DBInstanceIdentifier']
                                    }
                                }
                        -
                            db_instance_identifier:
                                !Sub '${DBInstanceIdentifier}'

    DescribeSnapshotLambda:
        Type: AWS::Lambda::Function
        Properties:
            Handler: index.handler
            Role: !GetAtt LambdaIamRole.Arn
            Runtime: python3.6
            Timeout: 30
            Code:
                ZipFile: |
                    import boto3
                    import datetime

                    RDS_CLIENT = boto3.client('rds')

                    def handler(event,context):
                        print('Event: {}'.format(event))
                        db_snapshot_identifier = event['DBSnapshot']['DBSnapshotIdentifier']
                        db_instance_identifier = event['DBSnapshot']['DBInstanceIdentifier']

                        response = RDS_CLIENT.describe_db_snapshots(
                            DBSnapshotIdentifier=db_snapshot_identifier,
                            DBInstanceIdentifier=db_instance_identifier,
                            SnapshotType='manual'
                        )

                        return {
                            'DBSnapshot': {
                                'DBSnapshotIdentifier': response['DBSnapshots'][0]['DBSnapshotIdentifier'],
                                'DBInstanceIdentifier': response['DBSnapshots'][0]['DBInstanceIdentifier'],
                                'Status': response['DBSnapshots'][0]['Status']
                            }
                        }

    StateMachineExecutionRole:
        Type: "AWS::IAM::Role"
        Properties:
            AssumeRolePolicyDocument:
                Version: "2012-10-17"
                Statement:
                    -
                        Effect: "Allow"
                        Principal:
                            Service:
                                - !Sub states.${AWS::Region}.amazonaws.com
                        Action: "sts:AssumeRole"
            Path: "/"
            Policies:
                -
                    PolicyName: StatesExecutionPolicy
                    PolicyDocument:
                        Version: "2012-10-17"
                        Statement:
                            -
                                Effect: Allow
                                Action:
                                    - "lambda:InvokeFunction"
                                Resource: "*"

    StateMachine:
        Type: "AWS::StepFunctions::StateMachine"
        Properties:
            DefinitionString:
                !Sub
                    - |-
                        {
                            "Comment": "State machine to create RDS DB instance Snapshot",
                            "StartAt": "Create snapshot",
                            "States": {
                                "Create snapshot": {
                                    "Type": "Task",
                                    "Resource": "${create_snapshot_lambda_arn}",
                                    "Next": "Wait 1 minute"
                                },
                                "Wait 1 minute": {
                                    "Type": "Wait",
                                    "Seconds": 60,
                                    "Next": "Get snapshot status"
                                },
                                "Get snapshot status": {
                                    "Type": "Task",
                                    "Resource": "${get_snapshot_status_lambda_arn}",
                                    "Next": "Snapshot completed?"
                                },
                                "Snapshot completed?": {
                                    "Type": "Choice",
                                    "Choices": [
                                        {
                                            "Variable": "$.DBSnapshot.Status",
                                            "StringEquals": "available",
                                            "Next": "Done"
                                        },
                                        {
                                            "Variable": "$.DBSnapshot.Status",
                                            "StringEquals": "failed",
                                            "Next": "Failed"
                                        }
                                    ],
                                    "Default": "Wait 1 minute"
                                },
                                "Done": {
                                    "Type": "Pass",
                                    "End": true
                                },
                                "Failed": {
                                    "Type": "Pass",
                                    "End": true
                                }
                            }
                        }
                    -
                        create_snapshot_lambda_arn: !GetAtt [ CreateSnapshotLambda, Arn ]
                        get_snapshot_status_lambda_arn: !GetAtt [ DescribeSnapshotLambda, Arn ]

            RoleArn: !GetAtt [ StateMachineExecutionRole, Arn ]

Outputs:

    StateMachine:
        Value: !Ref StateMachine
        Description: Step Function workflow Arn

```

## Summary

This article shows how to create a Step Function workflow (state machine) to manage long-running automation tasks - RDS Snapshot. It is a simple but powerful example, which should give you an idea, what else you can implement in the same way.

And of course, I hope this article will save you some amount of time. If you found this useful, please, help me to spread it to the world.
