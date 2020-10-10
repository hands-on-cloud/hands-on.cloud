---
title: 'How to use AWS CDK to deploy Python Lambda function'
date: '2020-08-29'
image: 'How to use AWS CDK to deploy Python Lambda function'
tags:
  - lambda
  - serverless
  - cdk
  - python
  - cloudwatch
  - deploy
categories:
  - AWS
authors:
  - Andrei Maksimov
---

This article will take a quick look at how to deploy the Lambda function using AWS CDK.

The AWS Cloud Development Kit (AWS CDK) is an open-source development framework to model and provision your cloud application resources using popular programming languages like Typescript, Javascript, Python, Java, C#.

Every AWS resource in AWS CDK is implemented in a module called “[construct](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html).” The construct is a building block in your code, which may is used to declare VPC, Subnet, Security Group, Lambda function, DynamoDB, and other AWS resources.

Here’s a great a bit more in-depth explanation [What is the AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html).

I personally like AWS CDK because:

* **AWS CDK constructs defaulted to AWS best practices** - for example, if you declare a VPC without any parameters, AWS CDK will use the latest AWS best practices recommendations to build the VPC and all related infrastructure.
* **I can prototype any infrastructure in minutes**
* In the end, **I can get a CloudFormation template** that may be used independently without AWS CDK.

As I’m a big fan of Python, we’ll concentrate on this beautiful programming language.

Before we begin, several must-know resources:

* [AWS Cloud Development Kit](https://docs.aws.amazon.com/cdk/api/latest/python/index.html) - here you’ll find documentation to all available Python modules
* [AWS CDK Intro Workshop for Python](https://cdkworkshop.com/30-python.html) - you need to spend ~20 mins here to get the taste of AWS CDK
* [AWS CDK GitHub repository with lots of examples](https://github.com/aws-samples/aws-cdk-examples/tree/master/python) - an excellent starting point, if you’re looking for an example of boilerplate code
* [AWS Toolkit for Visual Studio Code](https://aws.amazon.com/visualstudiocode/) - open source plug-in for the Visual Studio Code makes it easier to create, debug, and deploy applications on Amazon Web Services.

## Example - Cron Lambda job

In [Cloud CRON - Scheduled Lambda Functions](https://hands-on.cloud/cloud-cron-scheduled-lambda-functions/) article, we covered how to create a Serverless Cron job using CloudFormation and Terraform. Let’s build the same functionality (the Cron job to delete outdated AMIs), but with the help of AWS CDK.

{{< asciinema id="356549" >}}

### Source code

I’m assuming that you already installed AWS CDK. If not, here’s [how to install it](https://docs.aws.amazon.com/cdk/latest/guide/cli.html).

Here’s our project structure:

```sh
tree
.
├── app.py
├── cdk.json
├── lambda-handler.py
└── requirements.txt

0 directories, 4 files
```

* `lambda-handler.py` - our Lambda function code from the previous example
* `requirements.txt` - required constructs, which we need to build an example
* `cdk.json` - AWS CDK runtime context configuration
* `app.py` - AWS CDK application module where we’re describing infrastructure

Now, let’s take a look at the files one by one.

`requirements.txt` file contains the following content:

```txt
aws-cdk.aws-events
aws-cdk.aws-events-targets
aws-cdk.aws-lambda
aws-cdk.core
```

Those dependencies allow you to use AWS CloudWatch Events and AWS Lambda constructs in your `app.py` AWS CDK application code.

```py
from aws_cdk import (
    aws_events as events,
    aws_lambda as lambda_,
    aws_events_targets as targets,
    core,
)


class LambdaCronStack(core.Stack):
    def __init__(self, app: core.App, id: str) -> None:
        super().__init__(app, id)

        with open("lambda-handler.py", encoding="utf8") as fp:
            handler_code = fp.read()

        lambdaFn = lambda_.Function(
            self, "ami-cleanup-lambda",
            code=lambda_.InlineCode(handler_code),
            handler="index.handler",
            timeout=core.Duration.seconds(900),
            runtime=lambda_.Runtime.PYTHON_3_6,
        )

        rule = events.Rule(
            self, "Rule",
            schedule=events.Schedule.rate(core.Duration.days(1)),
        )
        rule.add_target(targets.LambdaFunction(lambdaFn))


app = core.App()
LambdaCronStack(app, "Lambda-Cron-Delete-AMIs")
app.synth()
```

The code itself is pretty straight forward. We’re importing required modules, and declaring the Python class, which contains the description of Lambda function and CloudWatch Events.

`cdk.json` contains default context for python CDK apps:

```json
{
    "app": "python3 app.py"
}
```

### Deployment

To deploy AWS CDK application, you need to install the virtual environment will require python modules first:

```sh
python3 -m venv .env
source .env/bin/activate
pip install -r requirements.txt
```

Now you’re ready to deploy the application:

```sh
cdk deploy
```

As soon as you changed something in your application, you may deploy your changes again using the same command.

That’s it! So simple. Maybe you do not see all the benefits of using AWS CDK from this simple example, but the amount of code you’re writing is significantly less for larger projects.

To destroy your changes simply run:

```sh
cdk destroy
```

## Resume

In this article, we took a look at the ability to use AWS CDK to deploy Lambda functions. I hope this article will save you some amount of time.

If you find this article useful, please, help to spread it to the world!
