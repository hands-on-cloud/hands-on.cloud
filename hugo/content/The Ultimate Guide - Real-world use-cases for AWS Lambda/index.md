---
title: '[The Ultimate Guide] - AWS Lambda Real-world use-cases'
date: '2020-10-24'
image: 'The Ultimate Guide - real-world use-cases for AWS Lambda'
tags:
  - lambda
  - s3
  - kinesis
  - dynamodb
  - cognito
  - cloudfront
  - pinpoint
categories:
  - AWS
  - Serverless
authors:
  - Andrei Maksimov
---

This article is very useful if you are willing to get a quick overview of possible AWS Lambda use cases. Every use-case contains a link to a resource with more information.

## Processing of uploaded to Amazon S3 files

Every time you upload something to the Amazon S3 bucket, it can notify AWS Lambda about that. AWS Lambda then can react to the notification event and something meaningful.

The diagram below illustrates how the integration works.

{{< my-picture name="real world use cases for AWS Lambda-Processing of uploaded to Amazon S3 files" >}}

The sequence of actions:

* The user uploads a file to the S3 bucket,
* Amazon S3 sends JSON event to AWS Lambda with the information about the uploaded file,
* Lambda function reacts to the received event.

This is a perfect architecture to solve the following problems:

* [Generate thumbnails or GIFs from uploaded to S3 bucket videos](https://hands-on.cloud/building-thumbnails-and-gifs-generator-using-lambda-and-ffmpeg/)
* Generate PDF from Word file
* Copy uploaded file to another S3 bucket in another AWS Region for disaster recovery

More information: [Tutorial: Using AWS Lambda with Amazon S3](https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html)

## Fan out ingested data stream to many destinations

Amazon Kinesis, SQS, or DynamoDB can trigger Lambda functions. It invokes your code which can make something with the data in real-time.

The following diagram shows how you can process data ingested to a Kinesis.

{{< my-picture name="real world use cases for AWS Lambda-Fan out ingested data stream to multiple destinations" >}}

The sequence of actions:

* The web, mobile, IoT, or custom application, writes records to a Kinesis stream.
* Lambda function invoked when the new records detected in the stream.
* Lambda function processes the data and sends to another service.

This is a perfect architecture to solve the following problems:

* Buffering of incoming data to reduce the number of processing Lambda executions.
* Real-time stream processing and monitoring solutions (ingested data can be analyzed using Kinesis Data Analytics).
* Real-time stream fan-out architecture, which allows you to save you data to multiple places like S3, DynamoDB and send it to another Kinesis Data Streams for further processing

More information: [Increasing real-time stream processing performance with Amazon Kinesis Data Streams enhanced fan-out and AWS Lambda](https://aws.amazon.com/blogs/compute/increasing-real-time-stream-processing-performance-with-amazon-kinesis-data-streams-enhanced-fan-out-and-aws-lambda/).

## Serverless Website

Maintaining a dedicated server is not a cool thing to do nowadays, even if it is a virtual server. Server maintaining operations like provisioning, updating, and patching takes a lot of time. It distracts you from focusing on your business problems.

You can use Lambda with other services to build a web app or without having to manage any servers at all. The templated example of this is the use of AWS API Gateway, DynamoDB, Amazon S3, and Amazon Cognito User Pool.

{{< my-picture name="real world use cases for AWS Lambda-Serverless Website" >}}

The main components here, which we're using:

* **Amazon S3** is a place for hosting static website content like HTML, media files, CSS, JavaScript.
* **API Gateway** and **AWS Lambda** are processing JavaScript requests to provide dynamic content.
* **DynamoDB**  is a NoSQL database that stores website data.
* **Amazon Cognito** is managing and authenticating users. It helps to secure backend APIs and provide unique features to your website users.

The architecture shows the basic serverless website. You can enhance it into a more complex solution to serve your needs by adding other AWS services.

Extra reading: [Build your first Serverless Web Application](https://aws.amazon.com/serverless/build-a-web-app/).

## Customize user authentication workflow

Personalization of your users’ experience plays a big role in any project. Whether you’re running a personal blog or a complex website. Amazon Cognito and AWS Lambda can help with this personalization.

Let's take a look at the example below. User's management operations, like user registration, validation, or login, trigger different Lambda functions. You can protect your web site from automatic account creation fraud. Start sending personalized account verification messages.

{{< my-picture name="real world use cases for AWS Lambda-Customize user authentication workflow" >}}

The common triggering sources where you can hook your Lambda function:

* Sign-up, confirmation, and sign-in
* Pre and post-authentication
* Custom authentication challenge
* Pre token generation
* Migrate user
* Custom message

Let’s take a look at how custom email or phone notifications work. Amazon Cognito trigger Lambda function. Lambda function customizes the message for the user before sending it.

The triggering sources for the custom messages are:

* Confirmation code post-sign-up
* The temporary password for new users
* Resending confirmation code
* Confirmation code to forget password request
* A manual request for new email/phone
* Multi-factor authentication

Extra information: [Customizing User Pool Workflows with Lambda Triggers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html).

## Managing HTTP Requests and Responses

As soon as your web project grows, you may start experiencing a strong need to modify HTTP requests or responses. There’re a lot of possible use cases, and here are some of them:

* Resizing the image based on user query to better handle mobile clients
* Serving WebP images for Chrome and Firefox browsers and JPEG/PNG for the rest
* Personalize Content by Country or Device Type Headers

**Lambda@Edge** and **CloudFront** integration can help to solve those problems. You have four places where you can use Lambda in combination with CloudFront:

{{< my-picture name="real world use cases for AWS Lambda-Managing HTTP Requests and Responses" >}}

* **Lambda 1** - Function can process HTTP requests before they get to CloudFront.
* **Lambda 2** - Function can change HTTP requests after CloudFront has processed them
* **Lambda 3** - Function can process HTTP responses before they reach CloudFront.
* **Lambda 4** - Function can change HTTP responses from the CloudFront.

Here’s what you can implement using those Lambda functions:

* Inspect cookies
* Rewrite URLs
* Perform A/B testing
* Serve website content based on the User-Agent header
* Put in place access control logic for incoming requests
* Add, delete, or change HTTP headers
* Support redirects for the old URLs
* Make HTTP requests to other Internet resources and inject those results into your responses.

More information: [Lambda@Edge Example Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html)

## Automation of customer onboarding journey

You can use [Lambda](https://aws.amazon.com/lambda/) and [Pinpoint](https://aws.amazon.com/pinpoint/)to build a cost-effective  serverless email marketing platform. Created or updated records at DynamoDB can cause a marketing automation process.

{{< my-picture name="real world use cases for AWS Lambda-Automation of customer onboarding journey" >}}

The architecture above illustrates how:

* New users registrations on your website can trigger the email onboarding process
* New order at your online shop can begin an upselling marketing email

You can add CloudWatch Scheduled Events to send marketing campaigns by schedule.

Extra information: [Amazon Pinpoint Journeys](https://docs.aws.amazon.com/pinpoint/latest/userguide/journeys-tour.html)

## Real-time Ingested Data Transformation

You can use [Kinesis Firehose](https://aws.amazon.com/kinesis/data-firehose/) for ingesting real-time streaming data to [S3](https://aws.amazon.com/s3/), [Redshift](https://aws.amazon.com/redshift/), or [Elasticsearch](https://aws.amazon.com/elasticsearch-service/). These services allow you to simplify data importing tasks. But what if you need to change data on the fly? Here’s where AWS Lambda comes into play.

{{< my-picture name="real world use cases for AWS Lambda-Real-time Ingested Data Transformation" >}}

Some of the most common problems, which AWS Lambda helps to solve:

* Data normalization
* Doing ETL transformations
* Merging data from several data sources
* Converting/transforming data by the destination requirements
* Adding metadata to the ingested data

The major benefit of using Lambda integration with Kinesis is almost unlimited scalability.

Lambda and Kinesis helps you to transform the data from the following producers:

* Kinesis enabled applications on your EC2 instances
* Mobile applications
* Web applications
* IoT devices

More information: [100 Days of DevOps — Day 41-Real-Time Apache Log Analysis using Amazon Kinesis and Amazon Elasticsearch Service](https://medium.com/@devopslearning/100-days-of-devops-day-41-real-time-apache-log-analysis-using-amazon-kinesis-and-amazon-f3b506626681).

## Serverless CRON Jobs

CRON jobs are a common practice to automate routine IT operations in the cloud. Cloud CRON can save a lot of time and effort in managing distributed environments. [CloudWatch Events](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/WhatIsCloudWatchEvents.html) integrated with AWS Lambda help you to achieve this goal.

{{< my-picture name="real world use cases for AWS Lambda-Serverless CRON Jobs" >}}

Create a Lambda function and execute it by the schedule using CloudWatch Events.

Some real-life examples are:

* Stopping unpaid subscription on your website
* Sending out the newsletter on fixed timings
* Cleaning up the database cache on the regular interval
* Backing up your EC2 instances or EFS shares

Extra information: [Cloud CRON - Scheduled Lambda Functions](https://hands-on.cloud/cloud-cron-scheduled-lambda-functions/).

## Real-Time Log Monitoring, Analysis And Alarming

[CloudWatch Events](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/WhatIsCloudWatchEvents.html) give you a near real-time stream of events. That events describe changes in your environment. And you can immediately react to any changes and take action if needed.

For example, you can react to such events in the following ways:

* Send informational or alarming messages to external messengers like Slack
* Create Jira tickets
* Do corrective changes
* Capture state information

Many different automation scenarios become available when using CloudWatch Event rules. Those rules are routing events to Lambda functions for further processing.

{{< my-picture name="real world use cases for AWS Lambda-Real time log monitoring, analysis and alarming" >}}

There are two different scenarios, which you need to be aware of:

* You can trigger Lambda function when the SQS queue grew above a certain threshold.
* You can trigger Lambda function when a particular text found in the logs. For example, the log record contains the “Exception” keyword.

More information: [Getting helpful CloudWatch alarms in Slack](https://stacks.wellcomecollection.org/getting-helpful-cloudwatch-alarms-in-slack-ba98fcbe6d31).

## Building Serverless Chatbots

Building chatbots from scratch may be a time consuming and expensive challenge. First, you write a chatbot code, deploy it, and run it at scale to support the business logic.

{{< my-picture name="real world use cases for AWS Lambda-Building Serverless Chatbots" >}}

AWS did the heavy lifting and gave us all we need to build and run a scalable chatbot for our clients with ease.

Here's what you need:

* [Amazon Lex](https://aws.amazon.com/lex/) allows us to create the conversational interface for our bot
* [AWS Lambda](https://aws.amazon.com/lambda/) will enable us to fulfill the intent given by Amazon Lex service with any action.

And again, no infrastructure. You're paying for services only for requests you're making to them.

More information: [Bots Just Got Better with .NET and the AWS Toolkit for Visual Studio](https://aws.amazon.com/getting-started/hands-on/bots-just-got-better-net-toolkit-lex-lambda-cognito/).

## Serverless IoT Backend

Managing hundreds of thousands of IoT devices is challenging. Create a simple and easy-to-use managing IoT devices interface to your clients is even harder.

All the devices or “things” like smart light bulbs, alarm buttons, door locks, or video cameras need to be registered centrally in a DB with additional meta-information (address, geolocation coordinates, placement in the room or at the floor plan, etc.).

Integration of [AWS Lambda](https://aws.amazon.com/lambda/) and [DynamoDB](https://aws.amazon.com/dynamodb/) with [AWS IoT](https://aws.amazon.com/iot/) can help you to build this backend.

{{< my-picture name="real world use cases for AWS Lambda-Serverless IoT Backend" >}}

Above, you can find example how to use Lambda, [S3](https://aws.amazon.com/s3/), DynamoDB, and [Cognito](https://aws.amazon.com/cognito/) to build a web-application. If you add AWS IoT to them, you'll get a completely serverless IoT devices management platform.

More information: [Implementing a Serverless AWS IoT Backend with AWS Lambda and Amazon DynamoDB](https://aws.amazon.com/blogs/compute/implementing-a-serverless-aws-iot-backend-with-aws-lambda-and-amazon-dynamodb/).

## Custom Workflow Orchestration

Any modern apps have backend workflows executed by schedule or response to events.

To support that workflows AWS has a service whose name is [AWS Step Functions](https://aws.amazon.com/step-functions/). This service is standard de-facto for workflow orchestration in the AWS cloud.

You are using JSON-based specification language for process declaration. That makes it very easy to connect different AWS services into a single workflow.

Here's an example from our article [AWS Step Functions - How to manage long-running tasks](https://hands-on.cloud/aws-step-functions-how-to-manage-long-running-tasks/):

{{< my-picture name="real world use cases for AWS Lambda - Using Step Functions for workflow orchestration" >}}

Some of the examples where you can use Step Functions and Lambda together:

* Simple and complex workflow orchestration
* Coordinate tasks in distributed serverless applications
* Automating Machine Learning workflows
* Orchestrating ETL jobs

More information: [Hitchhiker's Guide to AWS Step Functions](https://epsagon.com/development/hitchhikers-guide-to-aws-step-functions/)

## Auditing And Processing DB Data Changes

We already covered the [Serverless Website](#serverless-website) use-case. Now, let’s go a bit deeper and imagine that we need to react to our DynamoDB database changes. As soon as it becomes a case, it would be best to think about AWS Lambda and DynamoDB integration - DynamoDB Streams.

{{< my-picture name="real world use cases for AWS Lambda - Process DynamoDB Stream" >}}

DynamoDB can call Lambda every time any data changes happen. Changes data is available in the Lambda function in a JSON data structure.

You use this data for:

* **Data Filtering** - you can confirm data input and correct or revert it based on your rules.
* **Monitoring** - you can react to events like new user registration or profile update.
* **Auditing** - you can review data changes and revert them if needed.
* **Notifications** - you can track your user’s activity and send reports about it. For example, send a report about the most performed employee during the last working hour.

More information: [AWS Lambda - How to process DynamoDB streams](https://hands-on.cloud/aws-lambda-how-to-process-dynamodb-streams/)

## Create Alexa Skills

If you're not familiar with this technology, Alexa is an Amazon smart speaker device and voice assistant.

{{< amazon-associates src="https://ws-na.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=US&source=ac&ref=qf_sp_asin_til&ad_type=product_link&tracking_id=handsoncloud-20&marketplace=amazon&region=US&placement=B07XJ8C8F7&asins=B07XJ8C8F7&linkId=852eea069a26c097037baa0890505544&show_border=true&link_opens_in_new_window=true&price_color=333333&title_color=0066c0&bg_color=ffffff" >}}

Every *skill* that Alexa has, powered with cloud technology.

The examples are:

* Check the weather
* Read the news
* Amazon delivery status notifications
* Reminder

Alexa service does all the heavy lifting for you. You do not have to deal with natural language processing or understand what your user means.

{{< my-picture name="real world use cases for AWS Lambda-Create Alexa Skills" >}}

Every time Alexa asks about something, it launches a Lambda function to process the request, and you can write a Lambda function to do something meaningful in response.

Here are some examples of the Alexa skills that you can create:

* Ask Alexa about your website revenue
* Turn on the lights in the room
* Ask for your favorite pizza delivery

More information: [Rapidly Create Your Alexa Skill Backend with AWS CloudFormation](https://developer.amazon.com/blogs/alexa/post/Tx27NAUCY0KQ34D/rapidly-create-your-alexa-skill-backend-with-aws-cloudformation)

## Serverless Fan-Out Architecture

One of the common challenges in the Serverless world is how to build fan-out architecture.

There are three ways of doing that:

* [SNS](https://aws.amazon.com/sns/)
* [EventBridge](https://aws.amazon.com/eventbridge/)
* [Step Functions](https://aws.amazon.com/step-functions/)

Fan-out architecture is an ideal choice if you need to parallelize your workloads.

Here are some use-cases:

* Data processing data pipeline, which needs to save the data at various stages of the process
* Evaluating Machine Learning model with human results validation
* Converting image files to different formats.

### SNS

SNS is a great solution when you need to send the same message to many destinations. SNS integration with Lambda is a perfect building block for serverless fan-out architecture.

Here's an example of converting an uploaded image to different formats. S3 can send its updates to the SNS topic so we can build the following solution.

{{< my-picture name="real world use cases for AWS Lambda-Serverless Fan-Out Architecture - SNS" >}}

### EventBridge

EventBridge is a service bus and universal standard for events routing and processing. The idea is the same as in the case with SNS. You build a system that receives messages from your partners. EventBridge downstream it to your internal systems for further processing.

{{< my-picture name="real world use cases for AWS Lambda-Serverless Fan-Out Architecture - EventBridge" >}}

### Step Functions

Step Functions allows you to orchestrate different workflows which have various complexities. The major component of almost any workflow is the Lambda function. Step Functions enable you to run several tasks in parallel.

Here’s an example of processing user registration on the website.

Here we're doing the following:

* Updating website DB
* Subscribing user to an onboarding email sequence
* Confirming user about account creation

{{< my-picture name="real world use cases for AWS Lambda - Serverless Fan-Out Architecture - Step Functions" >}}

Of course, you may change this workflow, whatever you like.

More information: [Reducing custom code by using advanced rules in Amazon EventBridge](https://aws.amazon.com/blogs/compute/reducing-custom-code-by-using-advanced-rules-in-amazon-eventbridge/)
