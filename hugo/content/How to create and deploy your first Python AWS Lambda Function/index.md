---
title: 'How to create and deploy your first python 3.6 AWS Lambda Function'
date: '2020-03-02'
image: 'How-to-create-and-deploy-your-first-python-aws-lambda-function'
tags:
  - python
  - cloudformation
  - tensorflow
categories:
  - AWS
authors:
  - Andrei Maksimov
---

{{< my-picture name="How-to-create-and-deploy-your-first-python-aws-lambda-function" >}}

## What is Lambda function

[AWS Lambda Functions](https://aws.amazon.com/lambda/) is a service, which provides short execution time compute service for running your code in response to any kind of events. 

## Lambda function use cases

For example, here's some perfect use-cases for Lambda Functions:

* Trigger other AWS service in response on S3 file upload
* Trigger other AWS service in response on API Gateway incomming request
* Do third-party service integrations
* Design and execute complex workflows with help of Step Functions
* Log analysis on the fly
* Automated backups and everyday tasks
* Filtering and transforming data on the fly
* Many-many others

At the same time Lambda functions has their own [limitations](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html). Most important of them are:

* Execution timeout - 15 mins
* Maximum memory - 3008 MB
* Deployment package size - up to 50 MB (zipped) and 250 MB (unzipped)

But as soon as you decide to jump to serverless world and start using Lambda Functions, the first thing you need to know, is how to write and deploy it.

Of cause, there're some already existing interesting frameworks available for you at the moment, which can simplify that and many other tasks:

* [AWS Serverless Application Model (SAM)](https://aws.amazon.com/serverless/sam/)
* [AWS Amplify Framework](https://aws.amazon.com/amplify/)
* [Serverless](https://serverless.com/)

But at this article I'll show how to do it using basic CloudFormation stacks.

## Simple Lambda Function 

I like it very much, when I need to write a simple and short Lamda Functions, because that allows to embed them directly to CloudFormation stack templates like that:

```yaml
AWSTemplateFormatVersion: 2010-09-09
Description: >
  This CloudFormation template creates simple Lambda functions,
  which prints CloudFormation resource Arn from the stack.

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

LambdaFunction:
  Type: AWS::Lambda::Function
  Properties:
    Runtime: python3.6
    Timeout: 5
    Handler: index.handler
    Role: !GetAtt LambdaFunctionRole.Arn
    Code:
      ZipFile:
        !Sub
          - |-
            #!/usr/bin/env python3

            import cfnresponse
            import logging
            import traceback

            LOGGER = logging.getLogger()
            LOGGER.setLevel(logging.INFO)

            def handler(event, context):
              try:
                LOGGER.info('Event structure: %s', event)

                LOGGER.info('Our Lambda function role Arn ${lambda_function_role_arn}')

              except Exception as e:
                LOGGER.error(e)
                traceback.print_exc()
              finally:
                cfnresponse.send(event, context, cfnresponse.SUCCESS, {})
          -
            lambda_function_role_arn: !Ref LambdaFunctionRole
```

Here `LambdaFunctionRole` is very basic boilerplate IAM Role for Lambda Function execution, which grants our Lambda Function permissions to sent its stdout and stderr logs to CloudWatch.

`LambdaFunction` is a basic boilerplate Lambda Function written in Python, which is logging an incoming event structure and CloudFormation stack resource arn. It is very useful to setup Lambda function in this way when you do not understand what datastructure is to expect to its input.

To deploy CloudFormation stack from such simple template you may use [awscli](https://aws.amazon.com/cli/):

```sh
aws cloudformation create-stack \
    --stack-name 'my-simple-lambda-function-stack' \
    --template-body file://$(pwd)/my_cloudformation_template.yaml

aws cloudformation wait \
    stack-create-complete \
    --stack-name 'my-simple-lambda-function-stack'
```

## Complex Lambda Functions

Because of Lambda Functions and CloudFormation `AWS::Lambda::Function` resource limitations you can not use the same approach to build Lambda Function with external libraries, binaries and deploy them directly using only CloudFormation template.

In general whole process of working with such Lambda Function may be splitted to several phases:

* Development
* Building Lambda Function .zip archive
* Uploading Lambda Function .zip archive to S3 bucket
* Deployment of Lambda function from S3 bucket

### Development

There's currently no easy to develop Lambda function locally without using additional frameworks. I can recommend to use [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html), if you have a need to build and test your functions locally.

### Building Lambda Function .zip archive

Most of the cases for Python are covered by [AWS Lambda Deployment Package in Python](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html) official documentation.

What I can extend here for now, is that sometimes you may use platform dependent Python libraries and spend many-many hours figuring out, why everything is working locally, but not working as soon as you deploy your Lambda Function. To avoid such problems I'd suggest to use Docker to build and pack you Lambda Functions and their dependencies.

For example, here's the Makefile for building Lambda Functions depending on cx_Oracle library.

```sh
SHELL=/bin/bash
.PHONY: init package clean

# instantclient 19.5
INSTANT_CLIENT_ZIP_DIR="./oracle_libs"
# extracts into this dir
INSTANT_CLIENT_DIR=instantclient_19_5

LAMBDA_ZIP=reset-schema-password.zip

# taking specific url of .whl for linux from https://pypi.org/project/cx-Oracle/#files &&
init:
  docker run --rm -v `pwd`:/src -w /src python /bin/bash -c "mkdir -p ./lib && \
    apt-get update && \
    apt-get install -y libaio1 && \
    cp /usr/lib/x86_64-linux-gnu/libaio.so.1 ./lib/ && \
    unzip $(INSTANT_CLIENT_ZIP_DIR)/instantclient-basiclite-linux.x64-19.5.0.0.0dbru.zip -d /tmp && \
    mv /tmp/$(INSTANT_CLIENT_DIR)/* ./lib && \
    pip install https://files.pythonhosted.org/packages/d5/15/d38862a4bd0e18d8ef2a3c98f39e743b8951ec5efd8bc63e75db04b9bc31/cx_Oracle-7.3.0-cp36-cp36m-manylinux1_x86_64.whl -t ."

lambda.zip:
  docker run --rm -v `pwd`:/src -w /src python /bin/bash -c "apt-get update && \
    apt-get install -y zip && \
    zip --symlinks -r $(LAMBDA_ZIP) index.py lib cx*"

package: lambda.zip

install: lambda.zip
  aws s3 cp $(LAMBDA_ZIP) s3://$(SERVICE_S3_BUCKET)/lambdas/$(LAMBDA_ZIP)
  echo "Use CFN stack to deploy Lambda from s3://$(SERVICE_S3_BUCKET)/lambdas/$(LAMBDA_ZIP)"

clean:
  rm -rf ./lib;
  rm -rf ./$(LAMBDA_ZIP);
  rm -rf ./cx_Oracle*;
```

This will give you an idea, how to use Docker to script build and package process to avoid platfrom dependency problem. 
[Linux based Docker container with Python and Bash](https://hub.docker.com/_/python) allows you to automate building of everyting Lambda Function. 

To build and package your Lambda function you'll use the following command.

```sh
make && make package
```

### Uploading Lambda Function .zip archive to S3 bucket

As it shown above, you may use old-school *Makefile* and [awscli](https://aws.amazon.com/cli/) to automate upload of your Lambda Function .zip archive with its source code to some kind of "service" S3 bucket.

To deploy your Lambda function you'll use the following command:

```sh
make install
```

### Deployment of Lambda function from S3 bucket

As soon as your Lambda Function .zip archive is uploaded to S3 bucket, you may declare it in your CloudFormation stack temlate like that:

```yaml
LambdaFunction:
  Type: AWS::Lambda::Function
  Properties:
    Runtime: python3.6
    Timeout: 5
    Handler: index.handler
    Role: !GetAtt LambdaFunctionRole.Arn
    Code:
        S3Bucket: 'my-service-s3-bucket-with-lambda-sources'
        S3Key: 'lambdas/reset-schema-password.zip'
```
