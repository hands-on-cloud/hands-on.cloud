# Terraform recipe - Deploy Lambda to copy files between S3 buckets

This Terrafrom code will setup two S3 buckets and create Lambda function with necessary permissions to copy files from SRC to DST bucket.

[![Terraform recipe - Deploy Lambda to copy files between S3 buckets](https://asciinema.org/a/353586.svg)](https://asciinema.org/a/353586)

This is complete example for the post at [hands-on.cloud](https://hands-on.cloud) blog:

* [Terraform recipe - Deploy Lambda to copy files between S3 buckets](https://hands-on.cloud/terraform-recipe-deploy-lambda-to-copy-files-between-s3-buckets/)

## Deployment

```sh
terrafrom init
terrafrom apply
```

## Cleanup

```sh
terrafrom destroy
```
