---
title: 'AWS Step Functions - How to manage long running tasks'
date: '2020-03-17'
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
authors:
  - Andrei Maksimov
---

{{< my-picture name="AWS-Step-Functions-How-to-manage-long-running-tasks" >}}

In this article we'll take a look on how to use AWS Step Functions to manage long running jobs. This is very common task for any process orchestration system and it is build on top of [Iterating a Loop Using Lambda](https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-create-iterate-pattern-section.html) example from official AWS documentation.

As an example of long running process, we'll take RDS instance snapshot creation process.

Our AWS Step Functions state machine will consist of:
* [Task](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-task-state.html), which initiate create RDS Snapshot process (implemented using Lambda Function)
* [Wait](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-wait-state.html) 1 minute state
* [Task](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-task-state.html), which describes RDS Snapshot Lambda Function
* [Choise](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-choice-state.html) state, which checks DB Snapshot status and either waits, either continue flow control to two stubs
* [Pass](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-pass-state.html) state, which represents state machine **success** or **failed** execution status; in our case both states does nothing, but you may use them to do extra work, like sending SNS notifications or calling other AWS services

## Create RDS Snapshot Lambda Function

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

Our function takes `DBSnapshotIdentifier` and `DBInstanceIdentifier` as parameters and calling [create_db_snapshot()](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/rds.html#RDS.Client.create_db_snapshot) function. As a result of operation we're sending Python dict to the next state in state machine (Describe RDS Snapshot Lambda Function)

## Describe RDS Snapshot Lambda Function

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

This function is even simplier, because it just takes passed parameters from the previous step, does [describe_db_snapshots()](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/rds.html#RDS.Client.describe_db_snapshots) and returning the same dict with snapshot operation status. 

## State machine

AWS Step Functions state machine description. Our graph consists of the following steps

* Create snapshot
* Wait 1 minute
* Get snapshot status
* Snapshot completed?
* Done
* Failed

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

## Complete example

And finally, here's the complete CloudFormation stack template, tying everything alltogether:

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

Hope, that will save you some amount of time.
