---
title: 'What is Serverless computing'
date: '2020-09-13'
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

It is a very tricky topic as not so many people fully understand what Serverless means.

According to the [Serverless-Stack.com article](https://serverless-stack.com/chapters/what-is-serverless.html), "Serverless computing" is just an execution model that allows you to execute a small piece of code logic (Function) in response to some events like:

* HTTP requests
* Database events
* Queuing services
* Monitoring alerts
* File uploads
* Scheduled events

Serverless technology means an ability for a developer to write a small piece of code, which does some meaningful work in his application, then upload this code (a function) to the cloud and then let the cloud provider take care of the rest.

Just deploy your Function, and it will be executed in response to any event or a specific schedule.

There’re three main products in the market which implements that idea:

* [AWS Lambda](https://aws.amazon.com/lambda/)
* [Azure Functions](https://azure.microsoft.com/en-us/services/functions/)
* [Google Cloud Functions](https://cloud.google.com/functions/)

At the same time, the concept of Serverless computing is much broader. It includes [many additional services](#what-is-serverless-computing-in-aws), which can help you build your applications concentrating on the business logic instead of infrastructure operations.

## What does Serverless mean

Serverless computing is a new modern offering. The main idea is to provide everything you need to build your applications in a decoupled and scalable way without worrying about the infrastructure. Of course, there are servers somewhere, but it is the cloud provider's responsibility. You're just getting the final service, which has the following characteristics:

1. No need to manage servers - you're only consuming services or APIs
2. Extremely scalable - in most cases, you do not have to think about the scalability of your application components; most of this stuff is handled for you by the cloud provider
3. Very cheap service - if you’re doing it right, you’re paying only for a short time executions of a small code blocks

## What is Serverless computing in AWS

AWS gives you a set of [fully managed services](https://aws.amazon.com/serverless/) that you can use to build and run serverless applications. With Serverless applications, you don't have to provision, maintain, and administer servers for backend services (e.g., EC2 instances, DBs, storage, stream processing, message queueing, etc.). As soon as AWS handles fault tolerance and availability, you do not have to think about them anymore. That allows you to focus on product innovation and faster time-to-market speed.

AWS provides many different services, which you need to consider in your Serverless architecture.

### Compute

[AWS Lambda](https://docs.google.com/document/d/1Vpffi1t_wrSdV7_Y0M4bl8bark_za_V-nSHAZiV9su4/edit#heading=h.ch0pdcdtq7l4) is a service that allows us to run code without provisioning and maintaining virtual servers. You pay only for the computing time and resources only when you consume them. Billing has 100 ms granularity, and there is no charge when your code is not executing.

### Storage

[Amazon Simple Storage Service](https://aws.amazon.com/s3/) (Amazon S3) provides you with secure, durable, scalable object storage. S3 is very easy to use, with a simple CLI or web interface to store and retrieve any data from anywhere.

Recently AWS announced an ability to [Use Amazon EFS for AWS Lambda in your Serverless applications](https://aws.amazon.com/blogs/compute/using-amazon-efs-for-aws-lambda-in-your-serverless-applications/). This integration opens many additional capabilities, which no one else is providing on the market right now. For example, now you can overcome 65 Mb Lambda size limitations by mounting a much larger codebase, libraries, or binaries directly from the EFS share. This solution opens an entirely different set of new opportunities for you, which you need to try.

### Databases

[DynamoDB](https://aws.amazon.com/dynamodb/) is a fast NoSQL database for the applications that need consistent, single-digit millisecond latency at any scale. DynamoDB is one of [the first and probably the most popular](https://trends.google.com/trends/explore?date=all&geo=US&q=%2Fm%2F0h_bxxk) Serverless databases.

[Amazon Aurora Serverless](https://aws.amazon.com/rds/aurora/serverless/) is an auto-scaling configuration for Amazon Aurora (MySQL-compatible and PostgreSQL-compatible editions). This database service can automatically spin up, tier down, and scale DB capacity by your application's requirements.

[Amazon RDS Proxy](https://aws.amazon.com/rds/proxy/) is an HA DB proxy service that helps you to manage concurrent connections to relational DBs, allows you to build highly scalable, secure serverless applications. The basic pattern is to put Amazon RDS Proxy in front of Amazon Aurora.

### API Gateway

[Amazon API Gateway](https://aws.amazon.com/api-gateway/) is a completely managed solution that helps developers to create, publish, maintain, monitor, and secure APIs at any scale. It is a comprehensive solution for managing your APIs.

### Application Integration

[Amazon SNS](https://aws.amazon.com/sns/) is a fully managed pub/sub messaging service that makes it easy to decouple and scale microservices, distributed systems, and serverless apps.

[Amazon SQS](https://aws.amazon.com/sqs/) is a managed message queue for decoupling and scaling your Serverless applications.

[AWS AppSync](https://aws.amazon.com/appsync/) helps you to simplify application development by creating a GraphQL API. Those APIs allow you to securely access, manipulate, and combine data from different data sources.

[Amazon EventBridge](https://aws.amazon.com/eventbridge/) is a serverless event bus service that makes it easy to access application data from various sources and send it to your AWS environment. We covered Eventbridge in more detail in our article [EventBridge - Building event-driven Serverless architectures](https://hands-on.cloud/eventbridge-building-loosely-coupled-event-drivent-serverless-architectures/).

### Orchestration

[AWS Step Functions](https://aws.amazon.com/step-functions/) is an orchestration service. It simplifies the coordination of the components of distributed applications and microservices. All you need is to determine transition paths between the services in your application using simple JSON notation. As a result, you’ll get a visual representation of your workflow. AWS Step Functions significantly simplify building and managing distributed workflows in your applications. Here’s an example of [How to manage long-running tasks using AWS Step Functions](https://hands-on.cloud/aws-step-functions-how-to-manage-long-running-tasks/).

### Analytics

[Amazon Kinesis](https://aws.amazon.com/kinesis/) is a platform for streaming data on AWS. Kinesis is a useful service that makes it easy to load and analyze streaming data. It provides an ability to build custom streaming data applications for specialized needs at any scale.

[Amazon Athena](https://aws.amazon.com/athena/) is a powerful interactive query service that allows you to query Amazon S3 data using SQL. Athena is a Serverless service, so there is no need to manage infrastructure, and you pay only for the queries you run. Athena is usually used in combination with [AWS Glue](https://aws.amazon.com/glue/) - a service that allows you to crawl and catalog data in S3 ([Data Lake use-case](https://aws.amazon.com/blogs/big-data/build-a-data-lake-foundation-with-aws-glue-and-amazon-s3/)).

## What is Serverless architecture

Serverless architecture is a way to build or develop software where the application using many different cloud provider services managed by the cloud provider itself and not by you. You're responsible only for small pieces of code broken up into individual functions and can be invoked and scaled individually.

Here’s a great example of a fantastic article that shows [What a typical 100% Serverless Architecture looks like in AWS](https://medium.com/serverless-transformation/what-a-typical-100-serverless-architecture-looks-like-in-aws-40f252cd0ecb).

## What is a Serverless application

In the cloud computing world, the cloud provider provides the infrastructure necessary to run your applications. He also takes care of all the headaches of running the server, dynamically managing the machine's resources, etc. It also provides automatic scalability, which allows your applications to scale based on the execution load they are exposed to rapidly. All this heavy-lifting is already done for you, so as a cloud user, you can solely focus on implementing your application business logic and do not overthink the rest.

So, the Serverless application is an application developed using [Serverless architecture’s](#what-is-serverless-architecture) best practices.

### Why Create Serverless Apps

Now let’s talk about why it is worth creating serverless apps. There are a few reasons why I favor serverless apps over the traditional server-hosted apps:

* Low maintenance
* Low cost
* Easy to scale

I like this technology so much because you need to worry only about your application code. You don't need to ensure that your server is running, patched on-time, and appropriately secured.

It's significantly cheaper to run your Serverless applications, as you are paying for computing resources required to process every request to your application. That means, if other people or services do not use your application, you are not charged for it.

## What is AWS Lambda

[AWS Lambda](https://aws.amazon.com/lambda/) is a service, which allows you to run your code without provisioning or managing servers. You pay only for the small amount of time and compute resources you consumed.

With Lambda, you can run code for any application or backend service, all with zero administration. Just upload your small function code, and AWS Lambda takes care of everything required to run and scale it for any demand. You can set up your Lambda function code to be automatically triggered by other AWS services. Or it may be called by web front-end or mobile application through the API Gateway.

AWS Lambda supports the [following runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html):

* Node.Js (10 / 12)
* Python (2.6 / 3.6 / 3.7 / 3.8)
* Ruby (2.7 / 2.5)
* Java (8 / 11)
* Go (1.x)
* .NET (.Net Core 2.1 / 3.1)
* Custom runtimes

And it worth to mention a couple of killer-features:

* [Aliases](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html)
* [Versions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-versions.html)

Both features allow you to implement smooth and fully automatic code upgrades using [canary deployments and traffic shifting](https://aws.amazon.com/blogs/compute/implementing-canary-deployments-of-aws-lambda-functions-with-alias-traffic-shifting/).

### Data processing

One of the most common use-cases of AWS Lambda is to execute code in response to some triggers such as changes in data, shifts in system state, or actions taken by your users. For the data processing use-case, AWS Lambda can be directly triggered by AWS services such as S3, DynamoDB, Kinesis, SNS, and CloudWatch, it can connect to the EFS file systems, and AWS Step Functions can orchestrate its workflows. Those features allow you to build many different types of serverless data processing systems, processing the data in real-time.

### Real-time file processing

The standard de-facto of real-time file processing is AWS Lambda, triggered by Amazon S3 in response to the upload of a new or modification of an existing file in the S3 bucket. You can also connect AWS Lambda to an Amazon EFS file system to enable massively parallel shared access for large files processing at scale.

### Real-time stream processing

AWS Lambda and Amazon Kinesis integration is another famous way to process real-time streaming data for application activity tracking, transaction order processing, clickstream data, metrics, log filtering, indexing, social media analysis, and IoT devices data telemetry and metering.

### Machine learning

AWS Lambda can preprocess data before feeding it to your ML models. With Lambda access to your EFS share, you can serve your models at any scale.

### Backends

AWS Lambda is a foundational building block for any serverless backend, which needs to process web, mobile, IoT, or any other traffic type.

### Web applications

AWS Lambda can be combined with other AWS services to build robust and highly scalable web applications with zero administrative effort required for scalability.

### Benefits of AWS Lambda

For the final users, AWS Lambda provides multiple different benefits:

* **No servers to manage** - AWS Lambda runs your code. Just write it, upload it, and let the AWS Lambda handle the rest.
* **Infinite scaling** - AWS Lambda automatically scales your application by running code in response to each trigger on demand. Your code executed in parallel and processes each request individually, scaling precisely with the workload's size.
* **Subsecond billing** - With AWS Lambda, you are charged for every 100 ms that your code executes. You pay only for the resources and the time you consume.
* **Consistent performance** - With AWS Lambda, you can optimize your code execution time by choosing your function’s right memory size. You can also enable Provisioned Concurrency to make your functions execute with consistent start-up latency (great benefit for latency-sensitive workloads).

## What is Microsoft Azure Function

[Azure Function](https://azure.microsoft.com/en-us/services/functions/) is an AWS Lambda alternative Serverless compute offering available in Microsoft cloud. It allows you to do almost the same things but in a slightly different way. Microsoft positioning its Functions as an event-driven serverless compute platform that can solve any complex orchestration problems.

Microsoft is logically wrapping Azure Functions to two application types, e.g.:

* Function App - is an application that is similar to API Gateway + Lambda integration.
* Logic App - is an application that is responsible for processing triggered events.

Like in AWS, Azure cloud provides you the capability to execute Serverless functions in response to any event in their cloud directly or by using Azure Event Grid (AWS EventBus alternative).

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

Similar to AWS and Microsoft solutions, Google Cloud Functions lets you treat all Google and third-party cloud services as building blocks. Just connect them to implement your services interaction logic.

One of the most exciting GCP features is its Cloud Monitoring Integrated with Cloud Trace and Cloud Debugger. This service integration allows you to debug your Cloud Functions execution right in the cloud.

In addition to standard API request processing, Cloud Functions can react to Firebase and Google Assistant events. You can call them directly from any web, mobile, or backend application via HTTP.

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

In this article, we covered the Serverless computing topic in detail and the significant benefits of using it nowadays. We took a look at several Serverless offerings from major cloud providers.

I hope this article was useful to you. If yes, please, feel free to spread it to the internet. If not, please, let me know why, so I could improve it.
