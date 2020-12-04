---
title: 'Security Best Practices For Serverless Applications'
date: '2020-08-10'
image: 'Security-Best-Practices-For-Serverless-Applications'
tags:
  - security
  - lambda
  - serverless
categories:
  - AWS
  - Serverless
authors:
  - Andrei Maksimov
---

Serverless architecture allows applications to be developed and deployed without the provisioning and management of the underlying infrastructure or servers. Applications deployed by serverless architecture do not require any traditional host; instead, they run on serverless offerings which are managed by cloud providers. The most well-known serverless platforms are [AWS Lambda](https://aws.amazon.com/lambda/), [Microsoft Azure Functions](https://azure.microsoft.com/en-us/services/functions/), and [Google Cloud Functions](https://cloud.google.com/functions/).

Serverless architecture offers various advantages over other architectures, such as scalability, innovation by letting developers focus on writing code but has its unique security risks.

In this article, we're going to talk about those security risks and the best practices we can implement to properly secure serverless applications from those vulnerabilities.

## Use the principle of Least Privilege where possible.

The rule of [Least Privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege) limits the risk to data and systems in case of a compromised application. Applications that commonly access resources such as databases, file storage, and external systems and applications are restricted to the entities that need access to information for legitimate purposes.

Least Privilege's also allows us to restrict application permissions to the minimum required at that time—only allowing access based on what is specifically needed for each function to operate at its best. This helps reduce the damage an attack can cause and decrease the scope for the overall integration of several functions.

For example, most functions probably don't really need access to databases or permissions to access servers, but these actions are executed by default by various serverless frameworks.

Take the following **serverless.yml** default configuration for AWS Lambda in [Serverless Framework](http://serverless.com/). This configuration will allow all Lambda functions in the service to perform the submit action on an SNS(Software Notification Service) resource.

```yaml
provider:
  name: aws
  iamRoleStatements:
    - Effect: Allow
      Action:
        - sns:submit
      Resource:
        - Ref: SNS
```

Whereas, when we use the [serverless-iam-roles-per-function plugin](https://github.com/functionalone/serverless-iam-roles-per-function) in AWS Lambda, it lets you limit the resources that are specific to the individual Lambda function.

Activate the plugin in **serverless.yml**:

```yaml
plugins:
  - serverless-iam-roles-per-function
```

And then define `iamRoleStatements` for a particular function:

```yaml
myfunction1:
  handler: src/functions/base/index
  events:
    - http:
        path: base
        method: get

  iamRoleStatements:
    - Effect: Allow
      Action:
        - sns:submit
      Resource:
        - Ref: SNS
```

With this configuration only functions which are allowed access to service will be able to use the **submit** action on the SNS resource.

## Use secure storage for storing secrets.

Many cloud providers provide native secrets management solutions on their platforms, such as [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) or [Azure Key Vault](https://docs.microsoft.com/en-us/azure/key-vault/key-vault-overview). These native solutions provided by serverless providers permit you to safely store and retrieve arbitrary values and provide functions such as authentication upheld by the provider's IAM (Identity Access Management) solution.

Serverless applications can store secrets by calling the secret manager's API or deployment. If your provider lacks a native secrets management solution, the user can consider a third-party secret management solution such as [HashiCorp Vault](https://www.vaultproject.io/) or [Conjur](https://www.conjur.org/). They are not the best solution to secure a small number of serverless applications, but these tools are well equipped for cloud deployments and often include more functionality than a native secrets manager.

Secrets managers have many other features, too, such as unified access and audit logging, which help you better understand how sensitive information is being consumed in your environment. They also help in securing the confidential information stored in static files in a code repository, or in environment variables, which significantly reduces the chance of sensitive information exposure.

Consider the following example, which makes use of the [AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/), to retrieve secrets that were securely encrypted using the [AWS Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).

```yaml
service:
 name: payapp

provider:
  name: aws

functions:
  pay:
    handler: pay.get
    environment:
      GITHUB_API_KEY: ${ssm:/github/api-key}
```

Here **${ssm:/github/api-key}** will return the encrypted value of that key which has to be decrypted to get the actual value.

## Ensure Secure Communication of Transit Data.

Using a secure medium for web communication is becoming more prominent as best practices for serverless applications are employed. Functions and the services that integrate with 3rd party services should be closely monitored while leveraging a secure medium for communication.

* **Leverage HTTPS or TLS for secure communication:** Attackers may exploit the insecure medium of communication to extract sensitive information or use unverified algorithms for security breaches, which can be mitigated using TLS or HTTPS as a secure means of communication. Implementing TLS or HTTPS within your internal perimeter of other functions or services will keep your credentials and sensitive information safe and encrypt it with proper cryptographically secure algorithms.

* **Limit unauthorized access to resources:** Implement proper access control mechanisms such as defaulting to denying access or an SSL certification verification. Verifying SSL certificates ensures that there is secure communication between a user and server; any unauthorized communication will be halted when the identity and authenticity of the server do not match the information in the certificate. Also, enable rate-limiting and signed requests for cloud vendors to minimize attacks and chances of unsecured communication.

* **Restrict Lambda access to your VPC only:** Launch your Lambda functions inside private subnets in a virtual private cloud (VPC) in your AWS account. This will allow you to establish controled network communication between Lambda function and a private network for resources such as databases, cache instances, or other internal services.

## Ensure Proper Authentication and Authorization using API Gateway.

Proper authentication controls ensure that functions and resources are secured from unauthorized access. Serverless applications that are decentralized should be properly monitored  to ensure that each application or service makes the proper checks. If applications are accessed from multiple sources, there can be a chance that it is exposed to security vulnerability which may lead to security breaches in the future.

An ideal approach to resolve this issue by utilizing an API gateway, which oversees validation and approval for the serverless applications behind it. Each request to the application will initially be validated by the gateway based on authorization information they are carrying. If validated, they will be sent to applications for handling, while unapproved requests will not be processed and rejected by the gateway.

Using an API gateway as a filter to limit input to your function based on a gateway policy encourages request/response mapping that complies with schemas. This is similar to Objects in programming languages where if inputted object type of functions does not map to object class, they are rejected by the compiler.

Consider this code snippet, for example. There is a schema of how store data should be inputted based on type, price, unit, and quantity. If any of the variables do not match the schema type, the request will not be validated by the gateway.

```json
{
  "$schema": "https://json-schema.org/draft-04/schema#",
  "title": "StoreDataType",
  "type": "object",
  "properties": {
      "Bin" : {
        "type": "object",
        "properties": {
            "type": { "type": "string" },
            "price": { "type": "number" },
            "unit": { "type": "integer" },
            "quantity": { "type": "integer" }
        }
      }
   }  
}
```

## Log and Monitor Functions.

Insufficient function logging and monitoring is a significant issue among serverless applications. To mitigate this problem, leading serverless frameworks provides an ease to use monitoring and logging tools, which checks the number of execution a function has received and the execution duration.

It's a best practice to create alerts thresholds for each of your functions on all provided monitoring solutions. This can help diagnose potential issues in serverless architecture by monitoring how long it takes for a function to execute. So the right amount of resources can be allocated to help develop an application that perfectly suits business needs.

* **Conduct Routine Audits:** Auditing in serverless frameworks provide asset visibility and provide actionable results. They deliver a great overview in the form of statistical analysis, service dependencies, and routine configuration checks . There are also various policies such as Undefined Conditions, SQS queues, and API gateways in a serverless environment for which routine audit can provide insights.

Commonly used monitoring and auditing tools are [Dashbird](https://dashbird.io/), [Rookout](https://www.rookout.com/), [Lambda Guard](https://github.com/Skyscanner/LambdaGuard) or [IOpipe](https://www.iopipe.com/) for working with AWS lambda-based applications. [SignalFx](https://www.splunk.com/en_us/devops/serverless-monitoring.html), a tool that ensures real-time visibility and performance monitoring for AWS Lambda, Google Cloud Functions, and Azure Functions. [Stackdriver](https://cloud.google.com/stackdriver/) is a native solution for monitoring Google Cloud Functions logs.

## Establish Secure Coding Practices.

Serverless architecture introduces new risks, and traditional tools have not been so successful in dealing with some of these risks. As a result, many secure coding inventions and frameworks have been introduced to protect applications. 

Mandating the use of secure coding inventions across developer teams not only prevents developers from re-inventing the possible mistakes for security concerns that already have standardized solutions but also promotes activities such as application review in order to catch code security issues early in the process of the software development lifecycle. 

There are many secure coding conventions for securing serverless applications from which OWASP remains at the top for protecting serverless architectures. So let's have a look at the top OWASP practices and see how they apply to serverless computing.

* **Broken Access Control:** Broken access control in serverless functions can have wider exposure to security risks. Traditional applications typically authorize access to the entire application and use a single token for all functions as an overall unified authentication to control access to the application.

    To resolve this problem, Implement each function as a nano service, with its own set of access controls. This will deny access to unauthorized parts of the application that are following a unified authorization model.

* **Injection Attacks:** Injection attacks, where data isn't filtered or encoded with the correct context, will result in being interpreted as a part of an unsecured execution. Injection generally applies to areas such as database execution, systems execution, HTML, and CSS code execution. To avoid  injection attacks implement minimum user input.

    Reducing user input to bare minimum will decrease chances of attackers to include input in the form of various events (new or changed files or database fields) or message queues, which are usually  triggered as a chain of unsecured functions in your serverless framework.

* **Sensitive Data Exposure:** The serverless framework can expose sensitive data that attackers may exploit through the insecure medium of communication to exfiltrate sensitive information. Issues can be resolved in the form of having "key vault" systems to share secrets throughout an application, KeyVault systems will encrypt and hash the credentials with proper cryptographically secure algorithms to decrease data  exposure.

## Secure Software Delivery Lifecycle.

It's important that applications are secured with a software delivery life cycle. Secure applications not only integrates security into all phases of the delivery process but also develop a strong baseline for serverless applications, which can be an asset as we build a large security program.

{{< my-picture name="1200px-From_SDLC_to_SSDLC" >}}

Original image source: [https://commons.wikimedia.org/wiki/File:From_SDLC_to_SSDLC.png](https://commons.wikimedia.org/wiki/File:From_SDLC_to_SSDLC.png).

There are many processes that need to be taken into consideration, such as architecture review, development testing, and deployment, when enabling secure delivery for your serverless applications.

Starting with the architecture review, It is the initial step of assuring security in a serverless framework. It is one of the important steps of the application delivery lifecycle, where engineering is outlined. In this phase, the structuring of applications happens to distinguish how parts of applications will connect and communicate.

Coming to Development, when testing serverless applications in development, it's imperative to have the option to rapidly check security controls. This initial step in the delivery lifecycle will guarantee that the authorizations which are made during the design stage are taken into consideration for the proper working of the serverless application.

Integrating security as a component of the Continous integration pipeline is also important. This includes reviewing conditions for known weaknesses during development to ensure that every serverless application which comes out of pipeline easily integrates with security practices.

Lastly, a deployment environment that is secured can altogether decrease the attacking surface for serverless application communication. Also, to support fast deployment, its prerequisites, such as packaging and installers have to be isolated from the execution phase. Further, it's critical to consider the environment from where packages are retrieved. Consider embracing systems that update packages on the backend while at the same time provide full power over the working environment at the frontend.

Deployment is also about dashboards and auditing capabilities that further reinforce and support the security practices that were included in the architecture review phase. Visibility and auditing helps to enable the right role and permission access for a particular function.

For Example see in the following example snippet of a **serverless.yml** file:

```yaml
service: transaction

provider:
  name: aws
functions:
  func0:
    role: myRole0
  func1:
    role: myRole1
```

Here, two Lambda functions are declared as follows: **func0**, **func1**.

Each of these functions is assigned its own specific role, determined by the role specifier. Using different role specifiers can provide much more granular control by providing only what each function is assigned to do.

## Integrate WAF but don't rely completely on it.

Having a WAF in place is important, but it should not be the only line of defense in securing serverless applications.

A Web Application Firewall (WAF) secures the API gateway and is explicitly intended to examine every HTTP/S request at the gateway. It is commonly user and session aware, about the web applications behind the communication and the services they offer. Along these lines, you can think about a WAF as the middle man between the client and the application itself, examining all the communication before they come to the application or the client.

Conventional WAFs are also trusted as the first line of resistance for applications, particularly to ensure against the OWASP Top 10(the foundation for the most observed application weaknesses). which presently incorporates Injection attacks, Broken Authentication, Sensitive information introduction, XML External Entities (XXE), Security misconfigurations, Insecure Deserialization.

* **Conventional WAFs won't give you security against some other occasion trigger types.** Web Application firewalls(WAF) are only capable of inspecting HTTP(s) traffic. This means it won't help if you want to secure functions that are not API Gateway-triggered functions, for example, Lambda function which are interracting with storage services (AWS S3, Azure Storage, or Google Cloud Storage), DynamoDB database, or other services.

## Correctly Define IAM Roles Per Function.

Identity and Access Management (IAM) is the heart of security for serverless frameworks. IAM policies by default are often less looked by many developers, which is the reason many functions are defined a single role exposing the application to security risks.

IAM policies must be defined differently for each task, which means granting only the permissions that are necessary for that function. This will restrict each function to its intended purpose which  makes it easier to define permissions/roles for your Lambda Functions to the specific actions and resources it needs.

For example, the block below provides the ability for Lambda function to query and manipulate items in DynamoDB table only.

```yml
provider:
  name: aws
  runtime: nodejs6.10
  iamRoleStatements:
    - Effect: "Allow"
      Action:
       - dynamodb:Query
       - dynamodb:Scan
       - dynamodb:GetItem
      Resource: "arn:aws:dynamodb:us-west-2:111110002222:table/data-table"
```

**IAM role tip:** You can use [CloudFormation Intrinsic Functions](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference.html) to make it easier to define permissions/roles for your Lambda Functions. For example, if you've created your DynamoDB table in the resources section of your `serverless.yml`, you can use the `Fn::GetAtt` intrinsic function to get the Amazon Resource Names (ARNs).

```yml
provider:
  name: aws
  runtime: nodejs6.10
  iamRoleStatements:
    - Effect: "Allow"
      Action:
       - dynamodb:Query
       - dynamodb:Scan
       - dynamodb:GetItem
      Resource:
       Fn::GetAtt:
         - MyDynamoTable
         - Arn
```

After defining the `Fn::GetAtt` function, you can dynamically grab the ARN for DynamoDB table and various other Amazon Resources such as (Amazon RDS) tags, API calls,  and IAM policies .The function will automatically execute a request to access  resource in the resources block to retrieve the specific ARN.

## Conclusion.

Creating an application using a serverless architecture is a great way to reduce development costs and ensure your solution's scalability. However, the development team has to keep potential security issues in mind right from deployment. New security challenges are always at bay, with scaling and performance. and the serverless community has to adopt a greater security posture since everything is at the function level, making it easier for attackers.

It is also important for teams to change their approach to application security in serverless deployments. Teams should know that Serverless apps require more than the use of tools and tactics and require equal collaboration from the people involved in both the application and security domain.
