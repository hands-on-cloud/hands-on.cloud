---
title: 'Using AWS Lambda For Governance And Compliance Automation'
date: '2020-08-11'
image: 'Using-AWS-Lambda-For-Governance-And-Compliance-Automation'
tags:
  - lambda
  - config
  - security
  - compliance
  - governance
categories:
  - AWS
authors:
  - Andrei Maksimov
---

If the phrase “governance and compliance” sounds daunting, it should. At the very least, any stakeholder in a project utilizing AWS resources should have a healthy fear of what could go wrong if their environments are misconfigured.

In a cloud context, governance refers to the regulation and control of services through the definition of processes, standards, and policies that are to be strictly adhered to while planning, on-boarding, operating, and managing cloud services.

Compliance has a similar meaning in the digital world as it does in the terrestrial: the meeting of established rules and regulations. In this context, the business processes surrounding data stored within an AWS environment must meet applicable local standards.

A properly governed and compliant environment allows IT staff to easily manage resources in the cloud, provide accurate usage information to employees within an organization, secure data and accounts properly and reduce the overall level of effort required to keep the organization running like a well-oiled machine.

What does the alternative look like? Does the thought of a publicly exposed S3 bucket or a mistakenly opened Security Groups port send shivers down your spine? It should. Misconfigured resources could have serious implications for your organization.

Fortunately, AWS provides a tool called AWS Config to help administrators ensure organizational governance and regulatory practices continue to function at scale.

AWS Config gives responsible staff in your organization an ability to continuously monitor and record AWS resource configuration. An additional feature allows for the creation of custom logic to evaluate whether or not current settings match those outlined in your organization’s governance and compliance policy.

AWS Lambda is the key that allows your development team to translate your organization’s governance and compliance policy into code. This process allows for what AWS describes as “continuous compliance and self-governance across your AWS infrastructure.”

## Setting up AWS Config

As with most products in AWS, both a console and CLI solution are available for setup.

To set-up AWS Config via the console, begin by logging into your account. Then navigate to the AWS Config page. If you’re setting up AWS Console for the first time in a region, you’ll need to choose “Get started now” to move past the initial splash screen and get to the useful features of this product.

{{< my-picture name="AWS-Config-Setup-Getting-Started" >}}

From here, you’ll be able to let AWS Config know which resources you would like to be recorded, set-up SNS to send off notifications if AWS Config sees any changes in configuration, choose an S3 bucket to store your configuration information and manage the logic used to detect changes in your monitored configurations.

{{< my-picture name="AWS-Config-Setup-Step-1" >}}

Default options are fine for most of the cases. At the next step, you need to choose one or more already available for your Rules, which will check your existing infrastructure for compliance. I’ll choose to check my S3 buckets for public access. The rule should warn me if I have some buckets opened to the world.

{{< my-picture name="AWS-Config-Setup-Step-2" >}}

Finally, you need to review the configuration and let AWS Config do its job.

{{< my-picture name="AWS-Config-Setup-Step-3" >}}

## Setting-up AWS Config via the CLI

AWS users can also set-up Config via the AWS Command Line Interface.

The CLI provides users with a fairly straightforward way to turn AWS Config using the subscribe command along with three additional parameters: `--s3-bucket`, `--sns-topic` and `--iam-role`.

The resulting command should look something like this:

```sh
aws configservice subscribe \
  --s3-bucket my-config-bucket \
  --sns-topic arn:aws:sns:us-east-2:012345678912:my-config-notice \
  --iam-role arn:aws:iam::012345678912:role/myConfigRole
```

For a detailed explanation of each parameter and its function, visit the [Turning on AWS Config](https://docs.aws.amazon.com/config/latest/developerguide/gs-cli-subscribe.html) documentation.

After the `aws configservice subscribe` command has been run, AWS Config will begin recording all of the supported resources in the region.

## Adding Compliance Rules to AWS Config

AWS provides a set of “managed rules” that allow users of this service to quickly and easily evaluate whether or not their resources are configured to what is considered “best practice”. A quick example would be whether or not your organization’s Elastic Block Store (EBS) volumes are encrypted.

These managed rules are a great place to start when transitioning your organization’s governance and compliance policy into the cloud. When using the Config console, AWS does a great job of guiding the user through the process of customizing and then activating one of AWS’s managed rules.

AWS has a [complete list of their managed rules](https://docs.aws.amazon.com/config/latest/developerguide/managed-rules-by-aws-config.html) in the AWS Config documentation.

Once a rule has been activated, Config compares the current state of your resources to the conditions stated in the activated rule. Config will re-evaluate the rule each time a trigger is fired. A trigger is typically either a configuration change or an interval of time (ex. Every 24 hours).

## Viewing Configuration Compliance

Once AWS Config has begun monitoring resources, the solution offers three avenues for users to view their compliance status.

### Via the Web console

After signing in to AWS Management Console and AWS Config, verify you’re using a region that supports AWS Config rules. From there, it’s as simple as selecting the Dashboard from the navigation menu.

{{< my-picture name="AWS-Config-Compliance-Report-1" >}}

From there you may click on Resources to get an ability to check which of your resources are compliant and which are not.

In my case, one of my S3 buckets is not compliant. Need to fix it ASAP!

{{< my-picture name="AWS-Config-Compliance-Report-2" >}}

### Via the CLI

While the CLI provides many commands related to viewing the status of compliance rules, one of the most useful is `describe-compliace-by-config-rule`. Here’s an example of the command and output:

```sh
aws configservice describe-compliance-by-config-rule
{
    "ComplianceByConfigRules": [
        {
            "Compliance": {
                "ComplianceContributorCount": {
                    "CappedCount": 2,
                    "CapExceeded": false
                },
                "ComplianceType": "NON_COMPLIANT"
            },
            "ConfigRuleName": "instances-in-vpc"
        },
        {
            "Compliance": {
                "ComplianceType": "COMPLIANT"
            },
            "ConfigRuleName": "restricted-common-ports"
        },
        ...
}
```

For additional documentation on using the CLI to view configuration compliance, check out the official AWS documentation.

## Custom Config Rules with AWS Lambda

AWS Lambda allows for the creation of custom rules for Config. After signing into the Lambda console and choosing the option to create a new Lambda function, you’ll be able to select a blueprint for AWS Config.

Let's choose `config-rule-periodic` to setup Lambda function which will do periodic checks of our infrastructure.

{{< my-picture name="AWS-Config-Setup-Lambda-Step-1" >}}

Next, you need to specify the AWS Lambda function name and function role, which by default will give your function permissions to query AWS Config only. You need to add additional permissions for your function to allow it to access and check other AWS services.

{{< my-picture name="AWS-Config-Setup-Lambda-Step-2" >}}

The function configuration page comes pre-populated with a demo code block written in Node.js.

{{< my-picture name="AWS-Config-Setup-Lambda-Step-3" >}}

If you need some additional examples of how to implement custom AWS Config rule using Lambda function in Python or Node.js, you need to check [AWS Config Rules Repository](https://github.com/awslabs/aws-config-rules) repository. This repository also answers the question - "What else I can pay attention to in my AWS Compliance and Governance strategy?"

Test that the function is properly configured by choosing Configure test event under options. Choose AWS Config Change Triggered Rule under the Input test event template option.

{{< my-picture name="AWS-Config-Setup-Lambda-Step-4" >}}

## Associating the Lambda with a Custom Rule in AWS Config

Once the Lambda has been created, simply return to the AWS Config Console and select Add rule and then Add Custom Rule.

{{< my-picture name="AWS-Config-Setup-Lambda-Step-5" >}}

Begin creating a custom rule and enter the ARN assigned to your Lambda under AWS Lambda function ARN.

{{< my-picture name="AWS-Config-Setup-Lambda-Step-6" >}}

Complete the rest of the form and the rule should then populate on the rules page. Its status should be Evaluating while the function runs for the first time.

## Cleanup

If you followed the article guidance in your personal account, I'd suggest you disable AWS Config checks to avoid additional charges. To do that you need to:

* delete all associated with AWS Config rules ([Automation example at AWS Forums](https://forums.aws.amazon.com/thread.jspa?threadID=307384))
* stop configuration recorder

```sh
aws configservice stop-configuration-recorder \
    --configuration-recorder-name  default
```

* delete configuration recorder

```sh
aws configservice delete-configuration-recorder \
    --configuration-recorder-name  default
```

* empty and delete S3 bucket, which you used for AWS Config logs

## Conclusion

AWS provides a comprehensive solution to automated Governance and Compliance policy in the cloud via AWS Console and AWS Lambda. By combining these two tools, organizations can translate their corporate policy into the cloud and establish immediate remedial procedures in the event that a resource has deviated from established best practices. AWS Config paired with Lambda provides a fairly straightforward approach to utilizing managed and custom compliance logic that will give stakeholders peace of mind that improperly configured AWS resources are not putting their organization at risk.

## Additional resources

* [AWS Config Rules Repository](https://github.com/awslabs/aws-config-rules)
* [How to Automate Cloud Governance to Achieve Safety at Speed](https://aws.amazon.com/blogs/apn/how-to-automate-cloud-governance-to-achieve-safety-at-speed/)
* [Scaling a governance, risk, and compliance program for the cloud, emerging technologies, and innovation](https://aws.amazon.com/blogs/security/scaling-a-governance-risk-and-compliance-program-for-the-cloud/)
* [AWS Governance at Scale](https://docs.aws.amazon.com/whitepapers/latest/aws-governance-at-scale/introduction.html)
* [4 Reasons Why Cloud Governance Matters](https://www.cloudtamer.io/4-reasons-why-cloud-governance-matters/)
* [Importance and Elements of Cloud Governance](https://dzone.com/articles/importance-and-elements-of-cloud-governance)
* [Governance & Compliance Automation With AWS Config](https://medium.com/@bachlmayr/governance-compliance-automation-with-aws-config-eb23899f0731)
