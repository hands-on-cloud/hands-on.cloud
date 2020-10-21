---
title: '8 Serverless Anti-Patterns To Avoid'
date: '2020-09-03'
image: '8 Serverless Anti-Patterns To Avoid'
tags:
  - serverless
  - lambda
categories:
  - AWS
  - Serverless
authors:
  - Andrei Maksimov
---

There’re so many articles on the internet, which show how you can use AWS Lambda in multiple different ways, but not too many of them covering what you should not do. So in this article, I’ll point your attention to the most common ani-pattens of using AWS Lambda.

Before we begin, it is worth to share where to get the best practices first. From my perspective, the best source of them is the [Well-Architected Framework - “Serverless Application Lens](https://d1.awsstatic.com/whitepapers/architecture/AWS-Serverless-Applications-Lens.pdf).”

Now, let’s talk about anti-patterns.

## 1. Using monolithic Lambda functions with the large codebase

During the long-running project, you may quickly come to the situation when the code in your Lambda function starts growing more and more. It may seem convenient from the first look, but it leads to longer Lambda execution times, growing complexity in maintaining function code, upgrade process.

Here’re some recommendations to avoid this:

* **Break up large Lambda functions** to smaller ones with less business logic inside.
* **Use Step Functions** to orchestrate multiple Lambda functions. This service provides you and the ability to control your Lambda execution flow and benefit from features like [error handling](https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-handling-error-conditions.html), [loops](https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-create-iterate-pattern-section.html), and [inputs and outputs processing](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-input-output-filtering.html).
* **Use EventBridge** to exchange information between your Serverless components - Eventbridge is an event-bus with reach functionality on [filtering](https://docs.aws.amazon.com/eventbridge/latest/userguide/content-filtering-with-event-patterns.html), [logging](https://docs.aws.amazon.com/eventbridge/latest/userguide/logging-cw-api-calls-eventbridge.html), and [forwarding](https://docs.aws.amazon.com/eventbridge/latest/userguide/eventbridge-cross-account-event-delivery.html) event messages.

## 2. Using synchronous architectures

The [Building Thumbnails And GIFs Generator Using Lambda And FFmpeg](https://hands-on.cloud/building-thumbnails-and-gifs-generator-using-lambda-and-ffmpeg/) example, which I shared not too far ago, is an excellent illustration of synchronous architecture anti-pattern:

1. Ther user of service who is making requests to the systems should wait for the image generation service to complete potentially long-running operation
2. Instead of splitting and parallelizing images generation processes, we have a single Lambda function, which does everything step by step.

The solutions are the following:

* Try to build asynchronous processes wherever it is possible (check out the mentioned article to find out how).
* Try to parallelize workloads

## 3. Not managing the shared codebase

I see many projects where people repeat the Lambda function code many times while creating their serverless systems. Managing such projects through time will be painful.

I suggest to start avoiding such anti-pattern as soon as possible and try to introduce:

* **Lambda Layers** - same codebase or libraries can be mounted to your Lambda functions during their execution. You need to consider doing this as soon as possible.
* **Shared services** - sometimes it is possible to provide a common functionality to other applications or services as an API

> If there are multiple codebases, it’s not an app – it’s a distributed system. (@ [The Twelve-Factor App. Codebase](https://12factor.net/codebase))

## 4. Choosing a wrong Lambda function size

Right-sizing of the Lambda function is similar to EC2 sizing - the goal is to use “just right” sized function not to overpay for its execution.

* Ensure that your Lambda executed with the right CPU, memory, and timeouts
* Ensure that your code is optimized to run as efficiently as possible

Determining the Lambda function’s right size may be a challenging task, as it highly depends on the runtime environment (programming language, which you’re using) and your code.

To simplify this challenge, [Alex Casalboni](https://github.com/alexcasalboni) introduced an excellent framework for [AWS Lambda Power Tuning](https://github.com/alexcasalboni/aws-lambda-power-tuning). He created a state machine powered by AWS Step Functions that help you optimize your Lambda functions for cost and performance in a data-driven way.

{{< my-picture name="AWS Lambda Right Sizing" >}}

As soon as the output of the framework is JSON based, you may consider incorporating it into your CI/CD pipelines.

## 5. Making Lambda function dependent on less scalable service

AWS Lambda is an extremely high scalable solution. That means it can quickly overwhelm non Serverless service in your architecture.

Here’s how you may prevent potential problems by the road:

* Minimize and decouple your dependencies on non Serverless services
* Try to use asynchronous processing wherever is possible - that will give you an ability to decouple microservices from each other and introduce buffering solutions.
* Implement a buffer or message queue in front of non-scalable or non Serverless service.

## 6. Using single AWS account to deploy all you workloads

There’re some hard limits for an AWS account, which you may easily reach, such as the amount of ENIs or CloudFormation Stacks you may have.

There’s a simple suggestion:

* Try to split your workloads and put them to different accounts. As soon AWS Organizations and Control Tower have been introduced, managing several AWS accounts became an easy task even for non-corporate AWS customers.

## 7. Using Serverless technology where it is not the best fit

Serverless is an ideal technology for short-lived workloads, which can scale horizontally.

Recently I covered an example of [Building Thumbnails And GIFs Generator Using Lambda And FFmpeg](https://hands-on.cloud/building-thumbnails-and-gifs-generator-using-lambda-and-ffmpeg/). This example may quickly become an anti-pattern for large video files. For large video files, it makes sense to consider container solutions or using Elastic Transcoder service.

As a bit of advice here:

* Try not to use AWS Lambda in every single part of your solution - EC2 servers, containers orchestration services like ECS and EKS, and managed purpose-built services may fit better for your task.

## 8. Not monitoring the execution costs

There are so many blogs and websites which are covering the controlling of your costs topics. But there are still so many individuals and companies who are not implementing simple measures to protect themselves.

And the last advice for today:

* Set up a daily spending limit in your account settings and alarm for an event when your limit is reached. This measure will allow you not only to save some money but resolve possible technical issues quicker too.

## Summary

This article pointed attention to the eight most common Serverless anti-patterns every single project should avoid. The mentioned solutions are applicable not only to the Serverless application but to any project.

If you found this article useful, please, help us to spread it to the world.
