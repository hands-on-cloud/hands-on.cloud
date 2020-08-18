# Cloud CRON - Scheduled Lambda Functions

This is an example of deployment of sheduled Lambda function, which cleans up old Snapshots, and volume images.

Complete blog post article:
* [Cloud CRON - Scheduled Lambda Functions](https://hands-on.cloud/cloud-cron-scheduled-lambda-functions/) at [https://hands-on.cloud](https://hands-on.cloud)

## Deploy

### CloudFormation deploy

```sh
aws cloudformation create-stack \
  --stack-name "test-scheduled-lambda" \
  --template-body "file://$(pwd)/cloudformation.yaml" \
  --capabilities CAPABILITY_IAM

aws cloudformation wait stack-create-complete \
  --stack-name "test-scheduled-lambda"
```

### Terrafrom deploy

```sh
terraform init
terraform apply -auto-approve
```

## Cleanup

### CloudFormation cleanup

```sh
aws cloudformation delete-stack \
  --stack-name "test-scheduled-lambda"
```

### Terrafrom cleanup

```sh
terraform destroy -auto-approve
```
