---
title: 'Cloud CRON - Scheduled Lambda Functions'
date: '2020-03-17'
image: 'Cloud-CRON-Scheduled-Lambda-Functions'
tags:
  - python
  - cloudformation
  - lambda
  - ec2
  - volume
  - snapshot
  - boto3
categories:
  - AWS
authors:
  - Andrei Maksimov
---

{{< my-picture name="AWS-Step-Functions-How-to-manage-long-running-tasks" >}}

In this article we'll take a look on the Scheduled AWS Lambda functions.

## Benefits of using Scheduled AWS Lambda functions

In the old-school world of on-prem cron jobs, a significant amount of time went into managing the execution of these tasks. The crontab syntax itself is difficult to read, which frequently leads systems engineers to rely on online crontab formatters to translate the archaic time and date formats using online crontab generators. This lead [systemd.timer](https://www.man7.org/linux/man-pages/man5/systemd.timer.5.html) to include a modified, more readable implementation.

However, neither of these solve the inherent problems associated with state. If you run a cron job on a single server, and that server goes down, the cron job might never be ran or run at the wrong time. If you put the job on multiple servers, you need to implement some sort of distributed state storage to ensure there isn't a duplicate execution of the job. Spread this across an entire organization and you end up with a web of disparate cron implementations.

Thankfully, we can solve both of these problems and more with AWS Lambdas. Lambda is the AWS service that provides serverless functions. "Serverless" functions, despite what the name implies, do run on servers. However you, the user, do not need to manage the underlying server. You simply write your code in the language of your choice, upload it to a Lambda, and it executes! The application autoscales based on the workload, billing is per 100 milliseconds of execution time, and performance is consistent between runs.

This means you don't need to worry about hosts going down, or even keeping a host maintained, as the AWS control plane automatically ensures you get a high-availability platform for running the Lambda.

There are two ways of using Lambdas as cron jobs. First, we can use `rate()` to execute a lambda at a given interval. This is configured using the CloudWatch events rate expressions format `rate(<value> <unit>`. For example, if I want to execute a Lambda once every five minutes, I would use `rate(5 minutes)`. For once a week, I would use `rate(7 days)`. Simple!

Cron jobs use a slightly different format, but provide much flexibility in implementation. The cron syntax is `cron(<minutes> <hours> <day of month> <month> <day of week> <year>)`. This is a bit complicated at first glance, but let's walk through.

To run at 09:15 UTC every day, use the following:

```
cron(15 9 * * ? *)
```

To run at 18:00 UTC (6:00 PM) every day, use this:

```
cron(0 18 ? * * ? *)
```

The `?` character operates as a wildcard, matching all possible values.

Getting a little fancier, let's say we want to execute every 10 minutes on weekdays. We can do that with shortnames for weekdays.

```
cron(0/10 * ? * MON-FRI *)
```

For a more detailed look at scheduling cron jobs with Lambdas, check out the upstream AWS documentation on [cron jobs with Lambda](https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchevents-expressions.html) and [CloudWatch Events scheduling expressions](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html).

## Implementation example

Let's walk through creating a simple AWS Lambda that sends an email once a day. This assumes you have a verified Amazon SES identity. See the documentation here for more details.

First, configure an IAM role that allows your Lambda to send email. In this case, we are going to configure a role that has full SES permissions, but a production deployment should use a more limited role with just the `ses:SendEmail` and `ses:SendRawEmail` capabilities.

**images**

Then, in the Lambda view, click the Create function button. We'll call ours email-tester and use Node to execute our Javascript.

**images**

In the Function code view, copy in the following. You'll need to update the email addresses as appropriate.

```py

```

Finally, let's configure our Cloudwatch trigger. Click the Add trigger button in the lambda architecture view.

Give the trigger a name, a description, and give it a rate of once a day.

Hit Add, and we're done!
