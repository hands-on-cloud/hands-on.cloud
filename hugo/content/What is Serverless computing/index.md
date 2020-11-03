---
title: 'What is Serverless computing'
date: '2020-10-26'
image: 'What is Serverless computing'
tags:
  - serverless
  - lambda
  - s3
  - efs
  - dynamodb
  - aurora
  - rds
  - sns
  - sqs
  - appsync
  - eventbridge
  - kinesis
  - athena
categories:
  - AWS
  - Serverless
authors:
  - Andrei Maksimov
---

By the end of this article, you'll get everything you need to know about Serverless computing. We covered terminology, concepts, technologies, and so much more! Become an expert in the most demanding technology area nowadays in a few minutes!

## What Does Serverless Mean

Whenever we're calling the application "serverless", we usually mean that we have:

{{< my-picture name="What is Serverless computing - Features" >}}

* **No infrastructure to provision or manage.** You do not manage servers, containers, or operating systems.
* **Automatic scaling.** You do not think about scaling too. If you need to get more resources for your work, you get them from the cloud provider.
* **Pay for value.** Billing is very granular and allows you to pay only for that resources which you're using. No upfront commitment at all.
* **Security.** Cloud provider manages all capacity provisioning, OS management, patching, and security for you. Your responsibility is only to concentrate on the business features of your applications.

As the final technology consumer, your company will get:

* Focus on your product, not the underlying technologies
* Fast go-to-market time
* Agility in product development and business
* Almost no operations
* Low IT cost that grows with your business.

## What Is Serverless Computing

Serverless computing is a cloud provider service offering. It may consist of one or more services, which we can consume, and do not think about its implementation.

There are three most vocal products in the market which provides such offering:

{{< my-picture name="What is Serverless computing - Functions" >}}

* [AWS Lambda](https://aws.amazon.com/lambda/)
* [Azure Functions](https://azure.microsoft.com/en-us/services/functions/)
* [Google Cloud Functions](https://cloud.google.com/functions/)

All these products based on the following concepts:

* **Function as a service.** Cloud provider executes your code in a small short-living runtime environment. Your code is not very big and usually consists of a couple of functions.
* **Event-driven computing.** Your function code is executed in the cloud in response to some events.

Here are some examples of the events, which the function can react to:

* HTTP requests
* DB events
* Queue messages
* Monitoring alerts
* Scheduled events

At the same time, the concept of Serverless computing is much broader. It is not limited only by cloud functions. It includes [many additional services](https://hands-on.cloud/what-is-serverless-computing/#what-is-serverless-computing-in-aws), which we discuss below.

## What Is Serverless Computing In AWS

AWS gives you a set of [fully managed services](https://aws.amazon.com/serverless/) that you can use to build and run serverless applications. With Serverless applications, you don’t have to provision, maintain, and administer servers for backend services (e.g., EC2 instances, DBs, storage, stream processing, message queueing, etc.). As soon as AWS handles fault tolerance and availability, you do not have to think about them anymore. That allows you to focus on product innovation and faster time-to-market speed.

AWS provides many different services, which you may use in your Serverless architecture.

### Compute

{{< my-picture name="What is Serverless computing - Compute" >}}

[AWS Lambda](https://docs.google.com/document/d/1Vpffi1t_wrSdV7_Y0M4bl8bark_za_V-nSHAZiV9su4/edit#heading=h.ch0pdcdtq7l4) is a service, which allows you to run code in the cloud without managing servers. You pay only for the computing time and resources only when you consume them. Billing has 100 ms granularity, and there is no charge when your code is not executing.

### Storage

{{< my-picture name="What is Serverless computing - Storage" >}}

[Amazon S3](https://aws.amazon.com/s3/) provides you with secure, durable, scalable object storage. S3 is very easy to use, with a simple CLI or web interface to store and retrieve any data from anywhere.

Recently AWS announced an ability to [use EFS for AWS Lambda in Serverless applications](https://aws.amazon.com/blogs/compute/using-amazon-efs-for-aws-lambda-in-your-serverless-applications/). This integration opens many capabilities, which nobody else is providing on the market. For example, you can overcome the 65 Mb Lambda size limit by mounting a more massive codebase, libraries, or binaries from the EFS share. This solution opens a different set of new opportunities for you.

### Databases

{{< my-picture name="What is Serverless computing - Databases" >}}

[DynamoDB](https://aws.amazon.com/dynamodb/) is a fast NoSQL database for your applications. This database provides consistent, single-digit millisecond latency at any scale. And it is also one of [the first and probably the most popular](https://trends.google.com/trends/explore?date=all&geo=US&q=%2Fm%2F0h_bxxk) Serverless databases.

[Amazon Aurora Serverless](https://aws.amazon.com/rds/aurora/serverless/) is an auto-scaling configuration for Amazon Aurora (MySQL and PostgreSQL). This database service can spin up, tier down, and scale DB capacity by your application’s requirements.

[Amazon RDS Proxy](https://aws.amazon.com/rds/proxy/) is an HA DB proxy. This service helps you manage concurrent connections to relational DBs and build highly-scalable and secure serverless applications. The basic pattern is to put Amazon RDS Proxy in front of Amazon Aurora.

### API Gateway

{{< my-picture name="What is Serverless computing - API Gateway" >}}

[Amazon API Gateway](https://aws.amazon.com/api-gateway/) is a managed solution that helps developers to create, publish, maintain, and secure APIs at any scale. It is a comprehensive solution for managing your APIs.

### Application Integration

{{< my-picture name="What is Serverless computing - Application Integration" >}}

[Amazon SNS](https://aws.amazon.com/sns/) is a managed pub/sub messaging service. SNS makes it easy to decouple and scale microservices, distributed systems, and serverless apps.

[Amazon SQS](https://aws.amazon.com/sqs/) is a managed message queue for decoupling and scaling your Serverless applications.

[AWS AppSync](https://aws.amazon.com/appsync/) helps you to simplify application development by creating a GraphQL API. Those APIs allow you to securely access, manipulate, and combine data from different data sources.

[Amazon EventBridge](https://aws.amazon.com/eventbridge/) is a serverless event bus service. EventBridge makes it easy to access application data from various sources and send it to your AWS environment. We covered Eventbridge in our article [EventBridge - Building event-driven Serverless architectures](https://hands-on.cloud/eventbridge-building-loosely-coupled-event-drivent-serverless-architectures/).

### Orchestration

{{< my-picture name="What is Serverless computing - Orchestration" >}}

[AWS Step Functions](https://aws.amazon.com/step-functions/) is an orchestration service. It simplifies the coordination of the components of distributed applications and microservices. Transition paths between the services in your application are determined using simple JSON notation. As a result, you get a visual representation of your workflow. AWS Step Functions simplify building and managing distributed workflows in your applications. Here’s an example of [How to manage long-running tasks using AWS Step Functions](https://hands-on.cloud/aws-step-functions-how-to-manage-long-running-tasks/).

### Analytics

{{< my-picture name="What is Serverless computing - Analytics" >}}

[Amazon Kinesis](https://aws.amazon.com/kinesis/) is a platform for streaming data on AWS. Kinesis is a useful service that makes it easy to load and analyze streaming data. It provides an ability to build streaming data applications for your needs at any scale.

[Amazon Athena](https://aws.amazon.com/athena/) is a powerful interactive query service. It allows you to query Amazon S3 data using SQL. Athena is a Serverless service. There is no need to manage infrastructure, and you pay only for the queries you run. Athena integrates with [AWS Glue](https://aws.amazon.com/glue/) - a service that allows to crawl and catalog data in S3 ([Data Lake use-case](https://aws.amazon.com/blogs/big-data/build-a-data-lake-foundation-with-aws-glue-and-amazon-s3/)).

## What Is Serverless Architecture

{{< my-picture name="What is Serverless computing - Serverless Architecture" >}}

Serverless architecture is a set of patterns to build your application. You're using cloud provider services managed by the cloud provider itself and not by you. You’re responsible only for high-level configuration and integration of all required services.

The picture above demonstrates fundamental architecture. Check the suggested link below to find out more in-depth information on this topic.

Here’s an example of [what a typical 100% Serverless Architecture looks like in AWS](https://medium.com/serverless-transformation/what-a-typical-100-serverless-architecture-looks-like-in-aws-40f252cd0ecb).

## What Is A Serverless Application

Today, the cloud provider gives you everything you need to run your applications. He does all the heavy lifting of running the infrastructure. He provides automatic scalability for your applications and all its components. You focus only on your application business logic and do not care about the rest.

{{< my-picture name="What is Serverless computing - Serverless Application - IoT" >}}

The illustration above demonstrates an example of a Serverless IoT application.

If you'd like to find out more examples of serverless solutions, I recommend you check out my article [The Ultimate Guide - AWS Lambda Real-world use-cases](https://hands-on.cloud/the-ultimate-guide-real-world-use-cases-for-aws-lambda/).

The Serverless application is an application developed using [Serverless architecture’s](#what-is-serverless-architecture) best practices.

### Why Create Serverless Apps

Now let’s talk about why it is worth creating serverless apps. There are several reasons why I prefer serverless apps:

* No operations
* Easy to scale
* Low cost

I like this concept so much because I need to worry only about my application code. I don’t need to ensure that my server is running, patched on-time, and secured.

It’s very cheap to run a Serverless application too. I'm paying for computing resources required to process only requests to my application. That means, if other people or services do not use my application, I'm not paying for it.

## What is AWS Lambda

{{< my-picture name="What is Serverless computing - Compute" >}}

[AWS Lambda](https://aws.amazon.com/lambda/) is a service, which allows you to run code in the cloud without managing servers. AWS Lambda has the following characteristics:

* **It is reactive.** Only other AWS services or events in the cloud can start your code execution.
* **You have limited execution time.** Your code executes in a short-lived environment.
* **You have limited computing resources.** Your code has a limited amount of computing resources for its execution.

AWS Lambda allows you to create any backend service for your application. You upload the function code to the cloud, and the AWS service takes care of the rest.

### Benefits of AWS Lambda

{{< my-picture name="What is Serverless computing - Lambda Benefits" >}}

* **No servers to manage.** AWS runs your code. You write it, upload it, and let the AWS Lambda handle the rest.
* **Almost no cost.** Lambda billing is very granular, and execution costs are very cheap. That makes AWS Lambda a very attractive compute service for any modern application.
* **Consistent performance.** You can optimize your code execution time by choosing your function’s right memory size. You can also enable Provisioned Concurrency. It will make your functions execute with consistent start-up latency.
* **Load Balancing.** AWS spreads all incoming requests to your Lambda functions. You do not need to think about handling this load by yourself.
* **Infinite AutoScaling.** Lambda is reactive. The more requests or events you need to process, the more Lambda functions AWS will launch for you.
* **Handling failures.** If something breaks during your request processing, AWS will execute retry logic.
* **Security isolation.** AWS isolates your computer and memory resources from other customer’s.
* **OS management.** AWS does underlying OS patching and server management for you.

AWS Lambda supports the [following runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html):

* Node.Js (10 / 12)
* Python (2.6 / 3.6 / 3.7 / 3.8)
* Ruby (2.7 / 2.5)
* Java (8 / 11)
* Go (1.x)
* .NET (.Net Core 2.1 / 3.1)
* Custom runtimes

And it is worth to mention a couple of Lambda killer-features:

* [Aliases](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html)
* [Versions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)

Both of them allow you to do smooth and automatic code upgrades using [canary deployments and traffic shifting](https://aws.amazon.com/blogs/compute/implementing-canary-deployments-of-aws-lambda-functions-with-alias-traffic-shifting/).

### Anatomy of Lambda function

{{< my-picture name="What is Serverless computing - Lambda Function Structure" >}}

The most important parts every AWS Lambda function:

* **Handler function** - this function to be executed upon Lambda invocation
* **Event object** - Data sent to Lambda during its invocation.
* **Context object** - methods available to interact with runtime information (Request ID, Log Group, etc.)

The rest of the function code contains libraries imports and business logic implementation.

## Lambda function execution methods

There're several ways to invoke the Lambda function.

### Invoke Lambda function direct invocation

You can use AWS Lambda API to interact with the service. The API is the same for you, web console, CLI tools, and any AWS services, interacting with Lambda.

You can pass Lambda any data in the payload structure you want.

### Synchronous (push)

HTTP request processing by API Gateway and Lambda. The connection from the API Gateway to Lambda remains open till the time Lambda finishes its execution.

### Asynchronous (event)

You can integrate AWS Lambda with SNS or S3. Both services trigger the Lambda function end and do not wait until the execution completes.

### Stream (poll-based)

If you integrate DynamoDB or Kinesis with AWS Lambda service, you can poll data changes and send them in chunks to your function.

## AWS Lambda use cases

There're many different ways of how you can use Lambda. Here I'll cover them only at a high-level. Please, check my article [The Ultimate Guide - AWS Lambda Real-world use-cases](https://hands-on.cloud/the-ultimate-guide-real-world-use-cases-for-aws-lambda/) if you want to go deeper.

### Web Apps

Lambda is an often choice for many types of modern web apps:

* Static website
* Complex website

You can implement both scenarios by integrating API Gateway and Lambda.

### Backend

The second by popularity is the backend case. Lambda is quite a popular choice for many types of backends:

* Mobile
* IoT
* Services

### Data processing

One of the most common use-cases of AWS Lambda is to execute your code in response to some data changes events.

The most common scenarios:

* Data ingestion to the cloud
* Data generation or modification in the cloud

Most common Lambda integrations with other AWS Services:

* S3
* DynamoDB
* Kinesis
* SNS
* CloudWatch

In addition to that, you can connect AWS Lambda to the EFS file system. This integration will allow you to build many different serverless data processing solutions.

### Chatbots & Amazon Alexa

Lambda is the best choice for implementing chatbots, Alexa skills, and voice-powered apps in the cloud.

### Real-time stream processing

Lambda and Kinesis integration is another way to process real-time streaming data. The most common use-cases are:

* Application activity tracking
* Transaction order processing
* Clickstream data
* Metrics processing
* Log filtering
* Indexing
* Social media analysis
* Processing IoT devices telemetry data.

### IT Automation

All sorts of IT automation and integration problems are the ideal use-cases for Lambda. Some examples:

* Cloud CRON jobs
* Policy enforcement engine
* Infrastructure automation and management

## Lambda pricing model

AWS Lambda pricing is attractive and fine-grained. You buy the compute power in increments of 100ms for a very low per request charge. No hidden costs, no upfront commitment, no hourly, daily, or monthly minimums.

And you have a **_monthly free tier_**, which includes **1M requests and 400,000 GBs of computing resources**.

## Lambda permissions model

There are two things you need to know here:

* The **function policy** specifies what users or services can invoke your Lambda function.
* The **execution role** determines what your Lambda function can do during its execution.

## What is Microsoft Azure Function

[Azure Function](https://azure.microsoft.com/en-us/services/functions/) is a Serverless compute offering provided to you by Microsoft cloud. It allows you to do almost the same things but in a bit different way. Microsoft is positioning its Azure Functions as a next-generation event-driven serverless compute platform. Microsoft also states that Azure Functions can solve any complex orchestration problems.

Microsoft implemented Azure Functions service as two application types:

* **Function App** - is an application that acts as API Gateway and Lambda.
* **Logic App** - is an application that handles processing triggered events.

Like in AWS, Azure cloud provides you the capability to execute Serverless functions in response to any event.

Azure functions support the [following runtimes](https://docs.microsoft.com/en-us/azure/azure-functions/functions-versions):

* C# (1.x / 2.x / 3.x)
* Node.Js (6 / 8 / 10 / 11 / 12)
* F# (.Net Framework 4.7 / .Net Core 2.2 / 3.1)
* Java (8 / 11)
* Powershell (6 / 7)
* Python (3.6 / 3.7 / 3.8)
* Typescript
* Custom functions (custom environment)

## What is Google Cloud Function

[Google Cloud Functions](https://cloud.google.com/functions/) is Google’s Serverless compute offering for creating event-driven applications.

Google Cloud Functions lets you treat all Google and third-party cloud services as building blocks. Your responsibility is to put in place your services interaction logic.

One of the most exciting GCP features is Cloud Monitoring integration with Cloud Trace and Cloud Debugger. This integration allows you to debug your Cloud Functions right in the cloud.

You are only billed for your function’s execution time, metered to the nearest 100 milliseconds. And you pay nothing when your Function is idle.

Google Cloud Functions support the [following runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html):

* Node.Js (10 / 12)
* Python (3.7 / 3.8)
* Java (11)
* Go (1.11 / 1.13)

There are also not too many triggers available for Google Cloud Functions:

* HTTP
* PubSub
* Cloud Storage
* Firestore
* Firebase
* Cloud Monitor

## Summary

In this article, we took a look at the Serverless computing topic in detail. We covered terminology, concepts, technologies, and so much more.

I hope this article was useful to you. If yes, please, feel free to spread it to the internet. If not, please, let me know why, so I could improve it.
