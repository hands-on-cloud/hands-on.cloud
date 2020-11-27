---
title: 'Serverless framework – Building Web App using AWS Lambda Amazon API Gateway S3 DynamoDB and Cognito – Part 2'
date: '2018-09-15'
image: 'Serverless-framework-Building-Web-App-using-AWS-Lambda-Amazon-API-Gateway-S3-DynamoDB-and-Cognito'
tags:
  - api gateway
  - cognito
  - dynamodb
  - lambda
  - s3
  - serverless
categories:
  - AWS
  - Serverless
authors:
  - Andrei Maksimov
---

In previous article we’ve created and deployed a [simple web application which architecture consists of AWS Lambda, Amazon API Gateway, S3, DynamoDB and Cognito](https://hands-on.cloud/serverless-framework-building-web-app-using-aws-lambda-amazon-api-gateway-s3-dynamodb-and-cognito-part-1/) using Serverless framework. That and this articles are based on [original AWS hands-on](https://aws.amazon.com/getting-started/projects/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/) tutorial, which we slightly automated.

I did not like the result we’ve got in first article. And decided to make it more simpler and clear. How? We can replace API Gateway resources with the `events:` which are available on [Serverless framework](https://serverless.com/).

You may find the final result, which we got at the end of the previous post at my GitHub repository. Please, use tag v1.0 as a starting point. Final result is available at tag v2.0.

## Replacing API Gateway resources.

First thing we need to do is to comment all resources, which has `Type: AWS::ApiGateway::*` in `serverless.yaml` file:

{{< my-picture name="Serverless-Framework-Commenting-API-Gateway-Resources" >}}

Also, you’ll need to comment `WildRydesApiGatewayUrl` in the `Outputs:` section, because we’re removed API Gateway declaration:

{{< my-picture name="Serverless-Framework-Commenting-API-Gateway-Resources-Outputs" >}}

Now we can start adding the same configuration by using `events:` declaration in `functions:` section. Let’s publish our existing function `RequestUnicorn` using API Gateway with CORS enabled:

```yaml
functions:
  RequestUnicorn:
    handler: handler.handler
    role: WildRydesLambdaRole
    events:
      - http:
          path: ride
          method: post
          cors: true
```

{{< my-picture name="Serverless-Framework-Publish-API-Gateway-Resources-Events" >}}

I removed all not necessary comments from the file to make the file more readable.

Let’s deploy our infrastructure using the following command:

```sh
sls deploy
```

Now we need to implement API Gateway Authorizer. I think, we can uncomment one of the previously commented resources and modify it’s reference to the API Gateway.

```yaml
WildRydesApiGatewayAuthorizer:
  Type: AWS::ApiGateway::Authorizer
  Properties:
    Name: WildRydes
    RestApiId:
      Ref: ApiGatewayRestApi
    Type: COGNITO_USER_POOLS
    ProviderARNs:
      - Fn::GetAtt: [WildRydesCognitoUserPool, Arn]
    IdentitySource: method.request.header.Authorization
```

{{< my-picture name="Serverless-Framework-Commenting-API-Gateway-Midified-Authorizer" >}}

You may be interested, where I got `ApiGatewayRestApi` as a reference to the API Gateway, which we never declared. The reason is the Serverless framework which converts `serverless.yaml` file to the CloudFormation template which we deploying each time we’re calling `sls deploy` command. You may find it’s content in `.serverless/cloudformation-template-update-stack.json` file inside our project structure after the first deploy.

All we need to do is to find [AWS::ApiGateway::RestApi](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-restapi.html) (API Gateway itself) resource declaration and take it’s name as a reference.

{{< my-picture name="Serverless-Framework-Generated-CloudFormation-Template" >}}

And finally, we need to add declared authorizer to our `WildRydesLambdaRole` Lambda function like this:

```yaml
functions:
  RequestUnicorn:
    handler: handler.handler
    role: WildRydesLambdaRole
    events:
      - http:
          path: ride
          method: post
          cors: true
          authorizer:
            type: COGNITO_USER_POOLS
            authorizerId:
              Ref: WildRydesApiGatewayAuthorizer
```

Let’s redeploy our stack to make sure everything’s working:

```sh
sls deploy
```

If you’ve already destroyed previous application, let’s upload web application static content on S3 once more again. Getting web application sources:

```sh
git clone https://github.com/awslabs/aws-serverless-workshops/
```

As you remember, we already described all needed `Outputs:` in `resources:` section of our `serverless.yaml` file. So, all we need to do is to execute the following command to get it:

```sh
sls info --verbose
```

Now we’re ready to edit the `config.js` file:

```js
window._config = {
  cognito: {
    userPoolId: 'us-east-1_dADFuXCii', // e.g. us-east-2_uXboG5pAb
    userPoolClientId: '5dvnlid054tvjcrv3106762bh7', // e.g. 25ddkmj4v6hfsfvruhpfi7n4hv
    region: 'us-east-1', // e.g. us-east-2
  },
  api: {
    invokeUrl: 'https://c98nutbckd.execute-api.us-east-1.amazonaws.com/dev', // e.g. https://rc7nyt4tql.execute-api.us-west-2.amazonaws.com/prod',
  },
};
```

{{< my-picture name="Serverless-Framework-Static-Web-Application-Configuration" >}}

Now let’s upload web application content to S3 and remove it from our project sources:

```sh
aws s3 sync ./aws-serverless-workshops/WebApplication/1_StaticWebHosting/website s3://wildrydes-firstname-lastname
rm -rf ./aws-serverless-workshops
```

Redeploy the stack, if you did not do it earlier:

```sh
sls deploy
```

## Testing.

Now our application is up and running. All we need to do is to verify its functionality by opening the `WildRydesBucketURL`, registering new user using `/register.html` URL, verifying user manually using Cognito web interface and logging in using `/ride.html` URL. The whole testing process is described in my [first post](https://hands-on.cloud/serverless-framework-building-web-app-using-aws-lambda-amazon-api-gateway-s3-dynamodb-and-cognito-part-1/) and [original AWS](https://aws.amazon.com/getting-started/projects/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/) tutorial.

{{< my-picture name="Serverless-Framework-Deployed-Web-Application-End-Result" >}}

## Result.

Let remove all commented sections and take a look under the final result:

```yaml
service: wild-rides-serverless-demo # NOTE: update this with your service name

provider:
  name: aws
  runtime: nodejs8.10
  stage: ${opt:stage, 'dev'}

functions:
  RequestUnicorn:
    handler: handler.handler
    role: WildRydesLambdaRole
    events:
      - http:
          path: ride
          method: post
          cors: true
          authorizer:
            type: COGNITO_USER_POOLS
            authorizerId:
              Ref: WildRydesApiGatewayAuthorizer

# you can add CloudFormation resource templates here
resources:
  Resources:
    WildRydesBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: wildrydes-andrei-maksimov
        WebsiteConfiguration:
          IndexDocument: index.html
    WildRydesBucketPolicy:
      Type: AWS::S3::BucketPolicy
      Properties:
        Bucket:
          Ref: 'WildRydesBucket'
        PolicyDocument:
          Statement:
            - Effect: 'Allow'
              Principal: '*'
              Action:
                - 's3:GetObject'
              Resource:
                Fn::Join:
                  - ''
                  - - 'arn:aws:s3:::'
                    - Ref: 'WildRydesBucket'
                    - '/*'
    WildRydesCognitoUserPool:
      Type: AWS::Cognito::UserPool
      Properties:
        UserPoolName: WildRydes
    WildRydesCognitoUserPoolClient:
      Type: AWS::Cognito::UserPoolClient
      Properties:
        ClientName: WildRydesWebApp
        GenerateSecret: false
        UserPoolId:
          Ref: 'WildRydesCognitoUserPool'
    WildRydesDynamoDBTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: Rides
        AttributeDefinitions:
          - AttributeName: RideId
            AttributeType: S
        KeySchema:
          - AttributeName: RideId
            KeyType: HASH
        ProvisionedThroughput:
          ReadCapacityUnits: 5
          WriteCapacityUnits: 5
    WildRydesLambdaRole:
      Type: AWS::IAM::Role
      Properties:
        RoleName: WildRydesLambda
        AssumeRolePolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Principal:
                Service:
                  - lambda.amazonaws.com
              Action: sts:AssumeRole
        Policies:
          - PolicyName: DynamoDBWriteAccess
            PolicyDocument:
              Version: '2012-10-17'
              Statement:
                - Effect: Allow
                  Action:
                    - logs:CreateLogGroup
                    - logs:CreateLogStream
                    - logs:PutLogEvents
                  Resource:
                    - 'Fn::Join':
                        - ':'
                        - - 'arn:aws:logs'
                          - Ref: 'AWS::Region'
                          - Ref: 'AWS::AccountId'
                          - 'log-group:/aws/lambda/*:*:*'
                - Effect: Allow
                  Action:
                    - dynamodb:PutItem
                  Resource:
                    'Fn::GetAtt': [WildRydesDynamoDBTable, Arn]
    WildRydesApiGatewayAuthorizer:
      Type: AWS::ApiGateway::Authorizer
      Properties:
        Name: WildRydes
        RestApiId:
          Ref: ApiGatewayRestApi
        Type: COGNITO_USER_POOLS
        ProviderARNs:
          - Fn::GetAtt: [WildRydesCognitoUserPool, Arn]
        IdentitySource: method.request.header.Authorization
  Outputs:
    WildRydesBucketURL:
      Description: 'Wild Rydes Bucket Website URL'
      Value:
        'Fn::GetAtt': [WildRydesBucket, WebsiteURL]
    WildRydesCognitoUserPoolId:
      Description: 'Wild Rydes Cognito User Pool ID'
      Value:
        Ref: 'WildRydesCognitoUserPool'
    WildRydesCognitoUserPoolClientId:
      Description: 'Wild Rydes Cognito User Pool Client ID'
      Value:
        Ref: 'WildRydesCognitoUserPoolClient'
    WildRydesDynamoDbARN:
      Description: 'Wild Rydes DynamoDB ARN'
      Value:
        'Fn::GetAtt': [WildRydesDynamoDBTable, Arn]
```

As you can see, now we have much less code.

## Resource cleanup.

To cleanup everything you need to call

```sh
aws s3 rm s3://wildrydes-firstname-lastname --recursive
sls remove
```

## Final words.

Hope, you’ve found this article helpful. If you have any questions, please, feel free to ask them in comments section. Also, you may find additional example of API Gateway integrations using Serverless framework in it’s [Events documentation](https://serverless.com/framework/docs/providers/aws/events/apigateway/#share-authorizer).
