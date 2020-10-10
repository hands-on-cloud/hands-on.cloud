---
title: 'AWS Lambda - How to process DynamoDB streams'
date: '2020-08-03'
image: 'AWS-Lambda-How-to-process-DynamoDB-streams'
tags:
  - lambda
  - dynamodb
  - streams
  - cloudformation
categories:
  - AWS
authors:
  - Andrei Maksimov
---

Imagine, you decided to launch a Serverless project at Amazon Web Services. In most cases, AWS Lambda and DynamoDB would be your technology choice.

As soon as your project grows, you may start looking for a solution for the following use-cases:

* Replicate DynamoDB tables to other AWS Regions
* Send the data from DynamoDB table to a real-time analytics system
* Send the data from DynamoDB table to ElasticSearch for full-text search
* Send a notification depending on the data inserted to the database
* Do more complex automation depending on the database data changes

The simplest way to solve those problems is to process [Amazon DynamoDB stream](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html). And that's where AWS Lambda functions can help.
They can do anything you want each time an item in the DynamoDB table inserted or updated.

In this article, we'll show how to trigger AWS Lambda in case of such events.

## What are DynamoDB Streams

DynamoDB is a Serverless database that supports key-value and document data structures. It is an amazing service that can automatically scale and continuously backup your data.

[DynamoDB Streams](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html) is a technology, which allows you to get notified when your DynamoDB table updated.

Some features of the DynamoDB Streams:

* Up to two Lambda functions can be subscribed to a single stream
* Streamed exactly once and delivery guaranteed
* Strictly ordered by key
* Durable and scalable
* Sub-second latency
* 24-hour data retention

DynamoDB streams consist of Shards. The number of shards equals the number of DynamoDB partitions. We'll need it et the end of the article to tune Lambda executions.

{{< my-picture name="AWS-Lambda-How-to-process-DynamoDB-Streams-Shards" >}}

## What is AWS Lambda

AWS Lambda is an event-driven computing service that can execute your code in response to many different events. No need to manage any computing resources form your side. That’s what means whenever you hear Serverless.

AWS Lambda is the fastest way to process DynamoDB streams. It reads records from the stream and invokes your code [synchronously](https://docs.aws.amazon.com/lambda/latest/dg/invocation-sync.html) providing it modified records from the stream.

## CloudFormation stack

Let's create a DynamoDB table with demo Lambda function, which will log the data from your stream to CloudWatch Logs ([cloudformation.yaml](cloudformation.yaml)):

```yaml
AWSTemplateFormatVersion: 2010-09-09

Description: >
  This stack creates DynamoDB table and subscribe looging Lambda function to
  DynamoDB stream.

Resources:

  rLoggingFunction:
    Type: AWS::Lambda::Function
    Properties:
      Runtime: python3.7
      Timeout: '300'
      Handler: index.handler
      Role: !GetAtt rLambdaRole.Arn
      Code:
        ZipFile: |
          import logging

          LOGGER = logging.getLogger()
          LOGGER.setLevel(logging.INFO)

          def handler(event, context):
            LOGGER.info('Received Event: %s', event)
            for rec in event['Records']:
              LOGGER.info('Record: %s', rec)

  rLambdaRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
        # Allow Lambda to assume this role
        - Effect: Allow
          Principal:
            Service:
            - lambda.amazonaws.com
          Action:
          - sts:AssumeRole
      Path: "/"
      Policies:
        - PolicyName: LambdaRolePolicy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
            # Allow Lambda to write logs to CloudWatch
            - Effect: Allow
              Action:
              - logs:CreateLogGroup
              - logs:CreateLogStream
              - logs:PutLogEvents
              Resource: arn:aws:logs:*:*:*
            # Allow Lambda to read from the DynamoDB stream
            - Effect: Allow
              Action:
              - dynamodb:DescribeStream
              - dynamodb:GetRecords
              - dynamodb:GetShardIterator
              - dynamodb:ListStreams
              Resource: "*"

  rDynamoDBTable:
    Type: AWS::DynamoDB::Table
    Properties:
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      ProvisionedThroughput:
        ReadCapacityUnits: 1
        WriteCapacityUnits: 1
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES

  rDynamoDBTableStream:
    Type: AWS::Lambda::EventSourceMapping
    Properties:
      # The maximum number of DB items to send to Lambda
      BatchSize: 1
      Enabled: True
      EventSourceArn: !GetAtt rDynamoDBTable.StreamArn
      FunctionName: !GetAtt rLoggingFunction.Arn
      # Always start at the tail of the Stream
      StartingPosition: LATEST

  rLambdaFunctionLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Join
        - ''
        - - '/aws/lambda/'
          -  !Ref rLoggingFunction
      RetentionInDays: 14

Outputs:

  rLoggingFunctionName:
    Value: !Ref rLoggingFunction

  oDynamoDBTableName:
    Value: !Ref rDynamoDBTable
```

The code here is pretty straightforward. We have:

* `rLoggingFunction` - Lambda function declaration, which logs all incoming stream events from DynamoDB
* `rLambdaRole` - Lambda function role, which allows Lambda to read from DynamoDB Stream
* `rDynamoDBTable` - DynamoDB table declaration; `StreamSpecification`, determines which DB changes to be sent to the Stream
* `rDynamoDBTableStream` - connection of DynamoDB Stream and Lambda function
* `rLambdaFunctionLogGroup` - CloudWatch Log Group to store Lambda execution logs

Several options for `StreamViewType`:

* `KEYS_ONLY` — Only the key attributes of the modified item.
* `NEW_IMAGE` — The entire item, as it appears after it was modified.
* `OLD_IMAGE` — The entire item, as it appeared before it was modified.
* `NEW_AND_OLD_IMAGES` — Both the new and the old images of the item.

### Deploy

To deploy the stack run the following command:

```sh
aws cloudformation create-stack \
    --stack-name DynamoDB-Streams-Test \
    --template-body file://cloudformation.yaml \
    --capabilities CAPABILITY_IAM
```

Let's get CloudFormation stack outputs to test our LambdaFunction.

To get DynamoDB table name:

```sh
export TABLE_NAME=$(aws cloudformation describe-stacks \
    --stack-name DynamoDB-Streams-Test \
    --query "Stacks[0].Outputs[?OutputKey=='oDynamoDBTableName'].OutputValue" \
    --output text)
echo $TABLE_NAME
```

To get Lambda Funtion name:

```sh
export LAMBDA_NAME=$(aws cloudformation describe-stacks \
    --stack-name DynamoDB-Streams-Test \
    --query "Stacks[0].Outputs[?OutputKey=='rLoggingFunctionName'].OutputValue" \
    --output text)
echo $LAMBDA_NAME
```

### Test

To check if your Lambda function is successfully created, use the following test.

We will invoke the Lambda function manually using the invoke AWS Lambda CLI command. First, let’s trigger an event in DynamoDB.

**DynamoDB Stream example:** [input.json](input.json)

```json
{
   "Records":[
      {
         "eventID":"1",
         "eventName":"INSERT",
         "eventVersion":"1.0",
         "eventSource":"aws:dynamodb",
         "awsRegion":"us-east-1",
         "dynamodb":{
            "Keys":{
               "Id":{
                  "N":"101"
               }
            },
            "NewImage":{
               "Message":{
                  "S":"New item!"
               },
               "Id":{
                  "N":"101"
               }
            },
            "SequenceNumber":"111",
            "SizeBytes":26,
            "StreamViewType":"NEW_AND_OLD_IMAGES"
         },
         "eventSourceARN":"stream-ARN"
      },
      {
         "eventID":"2",
         "eventName":"MODIFY",
         "eventVersion":"1.0",
         "eventSource":"aws:dynamodb",
         "awsRegion":"us-east-1",
         "dynamodb":{
            "Keys":{
               "Id":{
                  "N":"101"
               }
            },
            "NewImage":{
               "Message":{
                  "S":"This item has changed"
               },
               "Id":{
                  "N":"101"
               }
            },
            "OldImage":{
               "Message":{
                  "S":"New item!"
               },
               "Id":{
                  "N":"101"
               }
            },
            "SequenceNumber":"222",
            "SizeBytes":59,
            "StreamViewType":"NEW_AND_OLD_IMAGES"
         },
         "eventSourceARN":"stream-ARN"
      },
      {
         "eventID":"3",
         "eventName":"REMOVE",
         "eventVersion":"1.0",
         "eventSource":"aws:dynamodb",
         "awsRegion":"us-east-1",
         "dynamodb":{
            "Keys":{
               "Id":{
                  "N":"101"
               }
            },
            "OldImage":{
               "Message":{
                  "S":"This item has changed"
               },
               "Id":{
                  "N":"101"
               }
            },
            "SequenceNumber":"333",
            "SizeBytes":38,
            "StreamViewType":"NEW_AND_OLD_IMAGES"
         },
         "eventSourceARN":"stream-ARN"
      }
   ]
}
```

We will execute the following event using the `invoke` command.

```sh
aws lambda invoke \
    --function-name $LAMBDA_NAME \
    --payload fileb://input.txt \
    outputfile.txt
```

You should get the following output:

```json
{
    "StatusCode": 200,
    "ExecutedVersion": "$LATEST"
}
```

Here's how to check CloudWatch logs as well:

```sh
export LOG_GROUP_NAME="/aws/lambda/$LAMBDA_NAME"
export LOG_STREAM_NAME=$(aws logs describe-log-streams \
    --log-group-name "$LOG_GROUP_NAME" \
    --query "logStreams[0].logStreamName" \
    --output text)

aws logs get-log-events \
    --log-group-name $LOG_GROUP_NAME \
    --log-stream-name $LOG_STREAM_NAME
```

### Cleaning up

To delete stack and clean up everything run the following command:

```sh
aws cloudformation delete-stack \
    --stack-name DynamoDB-Streams-Test
```

## Tune DynamoDB Stream processing

```yaml
rDynamoDBTableStream:
    Type: AWS::Lambda::EventSourceMapping
    Properties:
        BatchSize: 1
        Enabled: True
        EventSourceArn: !GetAtt rDynamoDBTable.StreamArn
        FunctionName: !GetAtt rLoggingFunction.Arn
        StartingPosition: LATEST
```

In our example, the Lambda function invoked every time the record is available in the stream. For significant workloads that may lead to inefficient Lambda executions. To avoid such behavior, we can tweak DynamoDB Stream.

### Configuration tuning

You may check the official documentation for a complete list of options, but the following parameters are most useful:

* `BatchSize`: number of records to send to Lambda function (default: 100, max 1000)
* `MaximumBatchingWindowInSeconds` - the amount of time in seconds to wait before sending records to Lambda function (min: 0, max: 300)

Here's how our example can look like:

```yaml
rDynamoDBTableStream:
    Type: AWS::Lambda::EventSourceMapping
    Properties:
        BatchSize: 100
        MaximumBatchingWindowInSeconds: 300
        Enabled: True
        EventSourceArn: !GetAtt rDynamoDBTable.StreamArn
        FunctionName: !GetAtt rLoggingFunction.Arn
        StartingPosition: LATEST
```

Now our Lambda function will receive a batch of 100 records or a smaller batch, but not often than in 5 minutes.

### Monitoring

To keep an eye on your DynamoDB Streams processing it is worth creating a CloudWatch Dashboard and include the following metrics in there.

DynamoDB Streams:

* ReturnedRecordsCount/ReturnedBytes
* UserErrors

Lambda function:

* Errors
* IteratorAge
* Throttles
* Duration

### Error handling

At the end of 2019, AWS released [Failure-Handling Features For DynamoDB EventSources](https://aws.amazon.com/about-aws/whats-new/2019/11/aws-lambda-supports-failure-handling-features-for-kinesis-and-dynamodb-event-sources/). It means, that now you have:

* `MaximumRetryAttempts` - maximum attempts before skipping the batch
* `MaximumRecordAgeInSeconds` - skip processing a data record when it has reached its *Maximum Record Age*
* `BisectBatchOnFunctionError` - Lambda recursively breaks the impacted batch of records into two when a function returns an error and retries them separately
* `DestinationConfig` - An Amazon SQS queue or Amazon SNS topic destination for discarded records

### Common issues

The following issues are common for DynamoDB Streams processing:

* `IteratorAge` is growing rapidly
* Rapid growth in Lambda concurrency

AWS provided a great framework (a list of questions) which may help to solve those issues in their deck [Mastering AWS Lambda streaming event sources](https://d1.awsstatic.com/events/reinvent/2019/REPEAT_1_Mastering_AWS_Lambda_streaming_event_sources_SVS323-R1.pdf). 

## Conclusion

In this article, we created a simple Lambda functions to log streams of your DynamoDB table to CloudWatch. I hope, you can evolve this example yourself to cover your needs. Also, we paid attention to DynamoDB Streams processing tuning, monitoring, and error handling.

Please, share this article, if you find it useful.
