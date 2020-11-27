---
title: 'How to use AWS SAM to simplify Serverless Python development'
date: '2020-03-19'
image: 'How-to-use-AWS-SAM-to-simplify-Serverless-Python-applications-development'
tags:
  - lambda
  - serverless
  - SAM
  - python
  - api
  - deploy
  - cloudformation
categories:
  - AWS
  - Serverless
authors:
  - Andrei Maksimov
---

We already know [How to create and deploy your first Python AWS Lambda Function](https://hands-on.cloud/how-to-create-and-deploy-your-first-python-aws-lambda-function/) from scratch without using any frameworks. Meanwhile, we mentioned some, and one of those was SAM.

[AWS Serverless Application Model (SAM)](https://aws.amazon.com/serverless/sam/) is a open-source framework that allows you to simplify development of Lambda functions for your serverless applications in AWS Cloud, where you need fine graned control of your cloud infrastructure components.

SAM concept is very simple: it helps you to build and test your Lambda Functions, generate CloudFormation template for your AWS infrastructure and deploy everything. Central point of everything is an API Gateway, which is usually calling your Lambda Functions in response to its queries.

In this article you'll see how use SAM to do the same thing, which we did in previous article, but with the help of serverless framwork in this time.

## Install SAM.

Installation process for all platforms covered in official [AWS documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html). As a Mac user, I'll note this basic steps here:

```sh
brew tap aws/tap
brew install aws-sam-cli
```

## Create Python Lambda function.

Project init setup is very simple and straight forward:

```sh
sam init --name my-sam-app --runtime python3.7 --app-template hello-world
```

If you do not specify any of those parameters, SAM will ask you additional interactive questions.

For Python lovers there're 3 template projects available:

* Hello World Example.
* EventBridge Hello World.
* EventBridge App from scratch (100+ Event Schemas).

We'll use the first one for the beginning.

Let's take a look, what's inside of our project:

```sh
cd my-sam-app
tree
.
├── README.md
├── events
│   └── event.json
├── hello_world
│   ├── __init__.py
│   ├── app.py
│   └── requirements.txt
├── template.yaml
└── tests
    └── unit
        ├── __init__.py
        └── test_handler.py
```

So, we have here:

* Basic template of **README.md** file.
* **events** folder containts sample of json request for testing **hello_world** Lambda function.
* **hello_world** folder contains the actual Lambda function code.
* **tests** - no comments 😁.
* **template.yaml** - is a the similar to CloudFormation temmplate, which supports higher level entities, like: **AWS::Serverless::Function**, **AWS::Serverless::LayerVersion** or **AWS::Serverless::HttpApi**, for example.

Let's use the following simple Lambda function code:

```py
import json
import logging
import time
import traceback
import requests

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

def lambda_handler(event, context):
  try:
    LOGGER.info('Event structure: %s', event)

    response = requests.get('https://ifconfig.co/json')

    return {
        'statusCode': 200,
        'body': "{}".format(
            response.text
        )
    }

  except Exception as e:
    traceback.print_exc()

    response_data = {
        'statusCode': 500,
        'error': str(e)
    }

    return response_data
```

This function will send request to [https://ifconfig.co/json](https://ifconfig.co/json) using **requests** (external Python library), get your IP address and return it to you in JSON structure.

So, as **requests** is an external library, let's put it to **requirements.txt**:

```sh
echo "requests" >> requirements.txt
```

## Build and test Lambda function.

To build our Lambda function, just run:

```sh
sam build
```

### Testing Lambda function.

To test our Lambda function localy, let's run

```sh
sam local invoke HelloWorldFunction \
    --event events/event.json
```

### Testing API Gateway integration.

To test Lambda <-> API Gateway integration integration locally, you need to run to satart local API Gateway:

```sh
sam local start-api
```

Now you may use curl to test your API call:

```sh
curl http://127.0.0.1:3000/hello
```

## Deploy Lambda function.

As soon as Lambda function is tested, you may deploy it. To do that, you need to have S3 bucket created, where your Lambda function distribution will be uploaded.

### Service S3 bucket.

Let's create such bucket (we'll use Python one-liner to make bucket name random):

```sh
aws s3 mb "s3://my-sam-app-$(python -c "import random, string; print(''.join(random.SystemRandom().choice(string.ascii_lowercase + string.digits) for _ in range(5)))")"
make_bucket: my-sam-app-6rz4m
```

### Package project.

Now we're need to package all SAM project artifacts and compile final CloudFormation template (`my-sam-app-compiled-template.yaml`)

```sh
sam package --output-template-file my-sam-app-compiled-template.yaml --s3-bucket my-sam-app-6rz4m
```

To this point of time you'll have randomly named lambda function distribution file in your S3 bucket:

```sh
aws s3 ls s3://my-sam-app-6rz4m
2020-03-19 20:26:29     532327 73d2d8baa2978842e922f95f3ca1dce0
```

And generated **my-sam-app-compiled-template.yaml** file:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: 'my-sam-app

  Sample SAM Template for my-sam-app

  '
Globals:
  Function:
    Timeout: 3
Resources:
  HelloWorldFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: s3://my-sam-app-6rz4m/73d2d8baa2978842e922f95f3ca1dce0
      Handler: app.lambda_handler
      Runtime: python3.7
      Events:
        HelloWorld:
          Type: Api
          Properties:
            Path: /hello
            Method: get
Outputs:
  HelloWorldApi:
    Description: API Gateway endpoint URL for Prod stage for Hello World function
    Value:
      Fn::Sub: https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/hello/
  HelloWorldFunction:
    Description: Hello World Lambda Function ARN
    Value:
      Fn::GetAtt:
      - HelloWorldFunction
      - Arn
  HelloWorldFunctionIamRole:
    Description: Implicit IAM Role created for Hello World function
    Value:
      Fn::GetAtt:
      - HelloWorldFunctionRole
      - Arn
```

### Deployment.

Let's deploy the our function:

```sh
sam deploy --template-file my-sam-app-compiled-template.yaml \
    --stack-name my-sam-app-stack \
    --capabilities CAPABILITY_IAM
```

This will deploy:

* Lambda function role.
* API Gateway.
* Lambda Function.

### Test deployment.

Let's query aur lambda function using API Gateway:

```sh
aws cloudformation \
  describe-stacks \
  --stack-name my-sam-app-stack \
  --query "Stacks[0].Outputs[?OutputKey=='HelloWorldApi'].OutputValue" \
  --output text
https://0rppnkrtgg.execute-api.us-east-2.amazonaws.com/Prod/hello/
```

```sh
curl https://0rppnkrtgg.execute-api.us-east-2.amazonaws.com/Prod/hello/
```

## Update Project.

Imagine we changed our mind and instead of getting our IP address, we want to send our users randomly generated passwords. Let's use our python one-liner as an example and change our Lambda function.

Here's new content of out **app.py** file:

```py
import json
import logging
import random
import string
import traceback

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

def lambda_handler(event, context):
  try:
    LOGGER.info('Event structure: %s', event)

    random_password = ''.join(
        random.SystemRandom().choice(
            string.ascii_lowercase + string.digits
        ) for _ in range(20)
    )

    return {
        'statusCode': 200,
        'body': json.dumps({
            'random_password': f"{random_password}"
        })
    }

  except Exception as e:
    traceback.print_exc()

    response_data = {
        'statusCode': 500,
        'error': str(e)
    }

    return response_data
```

### Deploy update.

To deploy update all you need to do is to build (if you Lambda functions been changed) and package the project:

```sh
sam build

sam package \
    --output-template-file my-sam-app-compiled-template.yaml \
    --s3-bucket my-sam-app-6rz4m
```

And finally deploy the update:

```sh
sam deploy --template-file my-sam-app-compiled-template.yaml \
    --stack-name my-sam-app-stack \
    --capabilities CAPABILITY_IAM
```

And we may get our random password by curl-ing our API Gateway:

```sh
curl https://0rppnkrtgg.execute-api.us-east-2.amazonaws.com/Prod/hello/
```

## Cleaning up.

As soon as you're done, you amy clean up everything using the following command to delete CloudFormation stack:

```sh
aws cloudformation delete-stack --stack-name my-sam-app-stack
```

And the following command to delete your bucket and artifacts:

```sh
aws s3 rb s3://my-sam-app-6rz4m --force
```

## Conclution.

Hope, after looking throught this article you got better understanding of development worflow where SAM is involved.
