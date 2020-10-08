---
title: 'The Ultimate Guide - Real-world use-cases for AWS Lambda'
date: '2020-10-06'
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
authors:
  - Andrei Maksimov
---
# The Ultimate Guide - Real-world use-cases for AWS Lambda

{{< my-picture name="The Ultimate Guide - real-world use-cases for AWS Lambda" >}}

This article should be useful for everybody, who is willing to get a quick overview of possible AWS Lambda use cases. Every use-case contains a link to a resource with additional information.

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

Additional information: [Tutorial: Using AWS Lambda with Amazon S3](https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html)

## Fan out ingested data stream to multiple destinations

AWS Lambda can poll the event sources like Amazon Kinesis, Amazon SQS, or DynamoDB and then invoke your code when records are detected in that source.

The following diagram shows how you can process data ingested to a Kinesis.

{{< my-picture name="real world use cases for AWS Lambda-Fan out ingested data stream to multiple destinations" >}}

The sequence of actions:

* The web, mobile, IoT, or custom application, writes records to a Kinesis stream.
* AWS Lambda continuously polls the stream and invokes the Lambda function when the service detects new records on the stream. AWS Lambda knows which stream to poll and which Lambda function to invoke based on the event source mapping.
* The Lambda function is invoked with the incoming event and processes the data.

This is a perfect architecture to solve the following problems:

* Buffering of an incoming stream of data to reduce the number of processing Lambda executions.
* Real-time stream processing and monitoring solution (ingested data can be analyzed in using Kinesis Data Analytics).
* Real-time stream fan-out architecture, which allows you to save you data to multiple places like S3, DynamoDB and send it to another Kinesis Data Streams for further processing

Additional information: [Increasing real-time stream processing performance with Amazon Kinesis Data Streams enhanced fan-out and AWS Lambda](https://aws.amazon.com/blogs/compute/increasing-real-time-stream-processing-performance-with-amazon-kinesis-data-streams-enhanced-fan-out-and-aws-lambda/).

## Serverless Website

Maintaining a dedicated server is outdated practice nowadays, even if it is a virtual server. Operations like provisioning instances, updating and patching the OS, etc. takes a lot of time and distracts you from focusing on your business problems.

AWS Lambda along with other AWS services can be used to build a powerful website without having to manage a single server or an operating system. The templated example of this is the use of AWS API Gateway, DynamoDB, Amazon S3, and Amazon Cognito User Pool**.**

{{< my-picture name="real world use cases for AWS Lambda-Serverless Website" >}}

The components here are used for executing the following functionalities:

* **Amazon S3** is used for hosting static website content like HTML, media files, CSS, JavaScript which acts as a front end in the user’s browser.
* **API Gateway** and **AWS Lambda** are processing JavaScript requests from the client web browser and provide the static website dynamically generated content.
* **DynamoDB** is a NoSQL database that is used for storing website data.
* **Amazon Cognito** is used for user authentication and management. It helps you to secure backend APIs and provide unique capabilities to your website users.

The architecture depicts the basic version of a serverless website. It can be easily enhanced into a more complex solution to serve your needs by adding other AWS services.

Additional information: [Build your first Serverless Web Application](https://aws.amazon.com/serverless/build-a-web-app/).

## Customize user authentication workflow

Whether you’re running a complex website or a personal blog, personalization of your users’ experience plays a huge role when you interact with them. Amazon Cognito can be integrated with AWS Lambda to customize your website authentication logic.

In this example different AWS Lambda functions are triggered based on various users’ management operations such as user sign-up, user confirmation, sign-in, etc. You can protect yourself from automatic account creation and make user registration a bit challenging or send out personalized account verification messages.

{{< my-picture name="real world use cases for AWS Lambda-Customize user authentication workflow" >}}

The following are the common triggering sources where you can hook your Lambda function:

* Sign-up, confirmation, and sign-in
* Pre and post-authentication
* Custom authentication challenge
* Pre token generation
* Migrate user
* Custom message

Let’s take a look at how custom email or phone notifications work. Amazon Cognito can trigger your Lambda function before sending a verification message which allows you to customize the message for the user. The triggering sources for the custom messages are:

* Confirmation code post-sign-up
* The temporary password for new users
* Resending confirmation code
* Confirmation code to forget password request
* A manual request for new email/phone
* Multi-factor authentication

Additional information: [Customizing User Pool Workflows with Lambda Triggers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html).

## Managing HTTP Requests and Responses

As soon as your web project grows, you may start experiencing a strong need to modify HTTP requests or responses. There’re a lot of possible use cases, and here are some of them:

* Resizing the image based on user query to better handle mobile clients
* Serving WebP images for Chrome and Firefox browsers and JPEG/PNG for the rest
* Personalize Content by Country or Device Type Headers

**Lambda@Edge** and **CloudFront** integration can help to solve those problems. You have four places where you can use Lambda in combination with CloudFront:

{{< my-picture name="real world use cases for AWS Lambda-Managing HTTP Requests and Responses" >}}

* **Lambda 1** - Function can process HTTP requests before they get to CloudFront.
* **Lambda 2** - Function can modify HTTP requests after CloudFront has processed them
* **Lambda 3** - Function can process HTTP responses before they reach CloudFront.
* **Lambda 4** - Function can change HTTP responses from the CloudFront.

Here’s what you can implement using those Lambda functions:

* Inspect cookies
* Rewrite URLs
* Perform A/B testing
* Serve website content based on the User-Agent header
* Implement access control logic for incoming requests
* Add, delete, or modify HTTP headers
* Correctly support redirects for the old URLs
* Make HTTP requests to other Internet resources and inject those results into your responses.

Additional information: [Lambda@Edge Example Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html)

## Automation of customer onboarding journey

With **AWS Lambda** and **Amazon Pinpoint**, you can build a cost-effective and in-house serverless email marketing platform. New or updated records at DynamoDB can cause a marketing automation process.

{{< my-picture name="real world use cases for AWS Lambda-Automation of customer onboarding journey" >}}

The architecture above illustrates how:

* New users registrations on your website can trigger the email onboarding process
* New order at your online shop can begin an upselling marketing email

Of course, you can extend those examples with CloudWatch Scheduled Events to launch marketing campaigns periodically.

Additional information: [Amazon Pinpoint Journeys](https://docs.aws.amazon.com/pinpoint/latest/userguide/journeys-tour.html)

## Real-time Ingested Data Transformation

You can use [Amazon Kinesis Firehose](https://aws.amazon.com/kinesis/data-firehose/) for ingesting real-time streaming data to [Amazon S3](https://aws.amazon.com/s3/), [Redshift](https://aws.amazon.com/redshift/), or [Elasticsearch](https://aws.amazon.com/elasticsearch-service/). Usage of this service allows you to simplify data importing tasks significantly. But what if you need to change data on the fly? Here's where AWS Lambda comes into play.

{{< my-picture name="real world use cases for AWS Lambda-Real-time Ingested Data Transformation" >}}

Some of the most common problems, which AWS Lambda helps to solve:

* Data normalization
* Doing ETL transformations
* Merging data from several data sources
* Converting/transforming data by the destination requirements
* Adding metadata to the ingested data

One of the significant benefits of using AWS Lambda integration with Kinesis Firehose is its almost unlimited scalability.

AWS Lambda and Kinesis Firehose integration allow you to transform data from the following data producers:

* Kinesis enabled applications on your EC2 instances
* Mobile applications
* Web applications
* IoT devices
* etc

Additional information: [100 Days of DevOps — Day 41-Real-Time Apache Log Analysis using Amazon Kinesis and Amazon Elasticsearch Service](https://medium.com/@devopslearning/100-days-of-devops-day-41-real-time-apache-log-analysis-using-amazon-kinesis-and-amazon-f3b506626681).

## Serverless CRON Jobs

Setting up a regular CRON job is a common practice to script and automate routine IT operations at on-premises and in the cloud. Centrally available cloud CRON can save a lot of time and effort in managing distributed environments. [CloudWatch Events](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/WhatIsCloudWatchEvents.html) integrated with AWS Lambda allow you to set up highly available CRON jobs executed periodically.

{{< my-picture name="real world use cases for AWS Lambda-Serverless CRON Jobs" >}}

Create a Lambda function that does what you need and execute it regularly or irregularly using CloudWatch Events. Some real-life examples are:

* Stopping unpaid subscription on your website
* Sending out the newsletter on fixed timings
* Cleaning up the database cache on the regular interval
* Backing up your EC2 instances or EFS shares

Additional information: [Cloud CRON - Scheduled Lambda Functions](https://hands-on.cloud/cloud-cron-scheduled-lambda-functions/).

## Real time log monitoring, analysis and alarming

[CloudWatch Events](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/WhatIsCloudWatchEvents.html) provides you a near real-time stream of events that describe operational changes in your environment. This functionality helps you to immediately respond to those changes and take corrective actions if needed. For example, you can react to such events in the following ways:

* Send informational or alarming messages to external messengers like Slack
* Create Jira tickets
* Do corrective changes
* Capture state information

Many different automation scenarios become available with the help of CloudWatch Event rules, which are routing events to Lambda functions for further processing.

{{< my-picture name="real world use cases for AWS Lambda-Real time log monitoring, analysis and alarming" >}}

There are two different scenarios, which you need to be aware of:

* **CloudWatch metric threshold reached**: CloudWatch Event rule can trigger Lambda function, for example, when the SQS queue grows above a certain threshold limit.
* **CloudWatch Logs contain a specific message**: CloudWatch can trigger Lambda function if a particular text pattern appears in the text; for example, the log record contains the "Exception" keyword.

Additional information: [Getting helpful CloudWatch alarms in Slack](https://stacks.wellcomecollection.org/getting-helpful-cloudwatch-alarms-in-slack-ba98fcbe6d31).

## Building Serverless Chatbots

Building and running chatbots from scratch may be a time consuming and expensive challenge. Following the traditional way, you need to develop a chatbot code and provision, run, and scale the infrastructural resources to support the business logic.

{{< my-picture name="real world use cases for AWS Lambda-Building Serverless Chatbots" >}}

Luckily, AWS already did all the heavy lifting and gave us everything we need to build and run a scalable chatbot solution for our clients with ease. Here's what you need:

* [Amazon Lex](https://aws.amazon.com/lex/) allows us to create the conversational interface for our bot
* [AWS Lambda](https://aws.amazon.com/lambda/) will enable us to fulfill the intent given by Amazon Lex service with any action.

And again, no infrastructure. You're paying for services only for requests you're making to them.

## Serverless IoT Backend

Managing hundreds of thousands of IoT devices is challenging. Provide a simple and easy-to-use interface for monitoring and managing IoT devices to your clients, maybe even harder.

All the devices or "things" like smart light bulbs, alarm buttons, door locks, or video cameras need to be registered centrally in a DB with additional meta-information (address, geolocation coordinates, placement in the room or at the floor plan, etc.).

You can integrate [AWS IoT](https://aws.amazon.com/iot/) services family with [AWS Lambda](https://aws.amazon.com/lambda/) and [DynamoDB](https://aws.amazon.com/dynamodb/) to build a powerful serverless IoT backend, efficiently solving all those challenges.

{{< my-picture name="real world use cases for AWS Lambda-Serverless IoT Backend" >}}

From another side, we already figured out how to use AWS Lambda, [S3](https://aws.amazon.com/s3/), DynamoDB, and [Cognito](https://aws.amazon.com/cognito/) to build a modern web-application for your clients. If you tie all those pieces together, you can create a completely serverless IoT devices management platform.

Additional information: [Implementing a Serverless AWS IoT Backend with AWS Lambda and Amazon DynamoDB](https://aws.amazon.com/blogs/compute/implementing-a-serverless-aws-iot-backend-with-aws-lambda-and-amazon-dynamodb/).

## Custom Workflow Orchestration

Almost every modern application (website, e-commerce, analytics software, ERP, etc.) consists of complex workflows which are usually executed periodically or in response to some event.

During reInvent 2016, AWS announced a new service for creating state machines - [AWS Step Functions](https://aws.amazon.com/step-functions/). This service became a standard de-facto for modeling and orchestration of any workflow in the AWS cloud. You are using JSON-based specification language for process declaration. It is super easy to tie many different Lambda functions and other AWS services into a single powerful automated workflow. Here's an example from our article [AWS Step Functions - How to manage long-running tasks](https://hands-on.cloud/aws-step-functions-how-to-manage-long-running-tasks/):

{{< my-picture name="real world use cases for AWS Lambda - Using Step Functions for workflow orchestration" >}}

Some of the examples where you can use Step Functions and Lambda together:

* Simple and complex workflow orchestration
* Coordinate tasks in distributed serverless applications
* Automating Machine Learning workflows
* Orchestrating ETL jobs

Additional information: [Hitchhiker's Guide to AWS Step Functions](https://epsagon.com/development/hitchhikers-guide-to-aws-step-functions/)

## Auditing And Processing DB Data Changes

We already covered the Serverless Website use-case. Now, let's go a bit deeper and imagine that we need to react to our DynamoDB database changes. As soon as it becomes a case, it would be best to think about AWS Lambda and DynamoDB integration - DynamoDB Streams.

{{< my-picture name="real world use cases for AWS Lambda - Process DynamoDB Stream" >}}

DynamoDB can call AWS Lambda every time some data changes happen and provide this information in a simple JSON data structure. AWS Lambda does the rest. Here are some examples:

* **Data Filtering** - you may validate data input and correct or revert it based on your rules
* **Monitoring** - you may react to specific events like new user registration, or profile update
* **Auditing** - you may automatically validate an update changes and revert them if needed
* **Notifications** - you may validate or track your user's activity and send reports about it; for example, send a message about the most performed employee during the last working hour.

Additional information: [AWS Lambda - How to process DynamoDB streams](https://hands-on.cloud/aws-lambda-how-to-process-dynamodb-streams/)

## Create Alexa Skills

For those of you, who are not familiar with this fantastic technology, Alexa is an Amazon smart speaker device or voice assistant.

{{< amazon-associates src="https://ws-na.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=US&source=ac&ref=qf_sp_asin_til&ad_type=product_link&tracking_id=handsoncloud-20&marketplace=amazon&region=US&placement=B07XJ8C8F7&asins=B07XJ8C8F7&linkId=852eea069a26c097037baa0890505544&show_border=true&link_opens_in_new_window=true&price_color=333333&title_color=0066c0&bg_color=ffffff" >}}

Every skill that Alexa has, for example, to check the weather, read the news, notify about Amazon delivery status, or remind you about something, is powered with technology. Alexa does all the heavy lifting for you, so you do not have to deal with natural language processing or understand what the user means.

{{< my-picture name="real world use cases for AWS Lambda-Create Alexa Skills" >}}

Every time Alexa asks about something, it launches a Lambda function to process the request, and you can write a Lambda function to do something meaningful in response.

Here are some examples of the Alexa skills that you can create:

* Ask Alexa about your website revenue
* Turn on the lights in the room
* Ask for your favorite pizza delivery

Additional information: [Rapidly Create Your Alexa Skill Backend with AWS CloudFormation](https://developer.amazon.com/blogs/alexa/post/Tx27NAUCY0KQ34D/rapidly-create-your-alexa-skill-backend-with-aws-cloudformation)

