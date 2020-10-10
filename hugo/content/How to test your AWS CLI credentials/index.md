---
title: 'How to test your AWS CLI credentials'
date: '2018-01-10'
image: 'How-to-test-your-AWS-CLI-credentials'
tags:
  - cli
categories:
  - AWS
authors:
  - Andrei Maksimov
---

To test ability to connect to AWS with newly created Access Key ID and Secret Access Key you need to use the following command:

```sh
aws sts get-caller-identity
```

This command will utilize GetCallerIdentity API call.

You may need to provide additional parameters like --profile my_new_profile, if you created AWS security key pair for additional account.

Unlike other API/CLI calls it will always work, regardless of your IAM permissions.

You will get the output in the following format if everything is OK:

```json
{
  "Account": "000654207548",
  "UserId": "AIDAJID6SZSGMUGC5T3YA",
  "Arn": "arn:aws:iam::000654207548:user/k8s"
}
```
