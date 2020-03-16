---
title: 'Serverless Framework - Run your Kubernetes Workloads on Amazon EC2 Spot Instances with Amazon EKS - Part 2'
date: '2018-11-11'
image: 'Serverless-Framework-Run-your-Kubernetes-Workloads-on-Amazon-EC2-Spot-Instances-with-Amazon-EKS-Part-2'
tags:
  - cloudformation
  - ecs
  - eks
  - fargate
  - kubernetes
  - lambda
  - serverless
categories:
  - AWS
authors:
  - Andrei Maksimov
---

{{< my-picture name="Serverless-Framework-Run-your-Kubernetes-Workloads-on-Amazon-EC2-Spot-Instances-with-Amazon-EKS-Part-2" >}}

In previous article "[Serverless Framework – Run your Kubernetes Workloads on Amazon EC2 Spot Instances with Amazon EKS – Part 1](https://hands-on.cloud/serverless-framework-run-your-kubernetes-workloads-on-amazon-ec2-spot-instances-with-amazon-eks-part-1/)" we created fully functional Kubernetes cluster backed by Spot instances using AWS EKS service.

In this article we will accomplish automation of converting video files uploaded to S3 bucket using Kubernetes jobs. We’ll run this jobs on top of Spot instances and trigger them from AWS Lambda function on reaction to S3 file upload event.

All sources available on my [GitHub project](https://github.com/andreivmaksimov/aws-eks-spot-instances-serverless-framework-demo/tree/part2).

## Restoring EKS cluster

If you shutdown your Kubernetes cluster, it’s a good time to launch it again. All you need to do is to get source code we created in previous article from [my GitHub project](https://github.com/andreivmaksimov/aws-eks-spot-instances-serverless-framework-demo):

```sh
git clone https://github.com/andreivmaksimov/aws-eks-spot-instances-serverless-framework-demo.git
cd aws-eks-spot-instances-serverless-framework-demo
```

Since my first article publish date AWS significantly improved and simplified minions bootstrap process. You need to replace `SpotNodeLaunchConfig:` section to the following:

```yaml
SpotNodeLaunchConfig:
  Type: AWS::AutoScaling::LaunchConfiguration
  Properties:
    AssociatePublicIpAddress: true
    # https://docs.aws.amazon.com/eks/latest/userguide/eks-optimized-ami.html
    ImageId: ami-0a0b913ef3249b655
    InstanceType: m3.medium
    IamInstanceProfile:
      Ref: NodeInstanceProfile
    KeyName: 'Lenovo T410'
    # Maximum Spot instance price (not launch if more)
    SpotPrice: 1
    SecurityGroups:
      - Ref: NodeSecurityGroup
    UserData:
      Fn::Base64:
        Fn::Join:
          - ''
          - - "#!/bin/bash -xe\n"
            - 'set -o xtrace'
            - "\n"
            - Fn::Join:
                - ' '
                - - '/etc/eks/bootstrap.sh'
                  - Ref: KubernetesCluster
            - "\n"
            - '/opt/aws/bin/cfn-signal -e $? '
            - '         --stack ${self:service}-${self:provider.stage} '
            - '         --resource NodeGroup '
            - '         --region ${self:provider.region}'
```

{{< my-picture name="Serverless-Framework-EKS-Create-Lambda-Functions-SpotLaunchConfig-Replacement" >}}

Additionally we will need to be able to get Lambda function execution role ARN. So, let’s add `LambdaFunctionsRoleArn` resource output:

```yaml
LambdaFunctionsRoleArn:
  Description: 'Lambda Functions Role Arn'
  Value:
    Fn::GetAtt: [IamRoleLambdaExecution, Arn]
```

{{< my-picture name="Serverless-Framework-EKS-Create-Lambda-Functions-Getting-Execution-Role" >}}

Here `IamRoleLambdaExecution` is default Lambda Function execution role created by Serverless framework. You may find it’s declaration in `.serverless/cloudformation-template-update-stack.json` file inside the project folder.

Also, open `serverless.yml` file, change `service:` name (first line) a little bit to avoid error of non-unique S3 buckets creation and change `KeyName:` in `SpotNodeLaunchConfig:` section from 'Lenovo T410' to your SSH key name.

That should be enough to setup your personal Kubernetes cluster backed by AWS Spot instances:

```sh
sls deploy
```

The process will take a while. As soon as Kubernetes cluster deployment finishes, we need to create `~/.kube/config` file, with the following command (please, use the latest awscli):

```sh
aws eks update-kubeconfig --name $(sls info --verbose | grep 'stack:' | awk '{split($0,a," "); print a[2]}')
```

{{< my-picture name="Serverless-Framework-EKS-Create-Cluster-Step-1" >}}

Test, that kubectl is working by launching the following command:

```sh
kubectl get svc
```

You should see the following output:

```sh
NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
kubernetes   ClusterIP   172.20.0.1           443/TCP   25m
```

Now we need to create a ConfigMap to allow Spot instances to connect to Kubernetes Master.

Download configuration example:

```sh
curl -O https://amazon-eks.s3-us-west-2.amazonaws.com/cloudformation/2018-08-30/aws-auth-cm.yaml
```

Get Kubernetes cluster ARN using the following command:

```sh
sls info --verbose | grep KubernetesClusterNodesRoleArn
```

And paste returned value as a value to `rolearn:` in `aws-auth-cm.yaml`.

{{< my-picture name="Serverless-Framework-EKS-Create-Cluster-Step-2-Connecting-Workers-to-Kubernetes-Master" >}}

As you remember, we’ve added `LambdaFunctionsRoleArn`. We need also add it to `aws-auth-cm.yaml` file to allow `kubectl` authentication from Lambda Function.

Let’s get Lambda function role ARN:

```sh
sls info --verbose | grep LambdaFunctionsRoleArn
```

And add as additional rolearn: declaration to mapRoles::

```yaml
- rolearn:
  username: lambda-user
  groups:
    - system:masters
```

{{< my-picture name="Serverless-Framework-EKS-Create-Lambda-Functions-Allow-EKS-Access" >}}

Deploy this config map to EKS Master as it is done usually in Kubernetes and remove the file, we’ll not need it anymore:

```sh
kubectl apply -f aws-auth-cm.yaml
rm aws-auth-cm.yaml
```

Now all we need to do is to redeploy the stack and see how our instances are joining to the cluster:

```sh
kubectl get nodes --watch
```

You may need to reboot\recreate already launched by Auto Scaling group instances to let them connect to the cluster. In our case it could be done manually:

{{< my-picture name="Serverless-Framework-EKS-Create-Cluster-Step-3-Restarting-Workers" >}}

## Creating Lambda function

As an example we’ll take [lambda-kubectl](https://github.com/tmuskal/lambda-kubectl) GitHub project. But instead of writing bash scripts, we’ll use [serverless packaging feature](https://serverless.com/framework/docs/providers/aws/guide/packaging/).

Let’s structure our files a little bit and put our functions code in a separate folders. Add `package:` option to you `serverless.yml` file:

```yaml
package:
  individually: true
```

Create two folders for each of our functions and put function code `.py` files to this folders:

```sh
mkdir upload_thumbnail
mkdir upload_video
mv upload_thumbnail.py upload_thumbnail/
mv upload_video.py upload_video/
```

Next change handler: for each of our functions to have a name of it’s folder like so:

```yaml
handler: upload_video/upload_video.handler
```

And

```yaml
handler: upload_thumbnail/upload_thumbnail.handler
```

{{< my-picture name="Serverless-Framework-EKS-Create-Lambda-Functions-1-Restructure-Code" >}}

Let’s redeploy our stack to check that we made everything correctly:

```sh
sls deploy
```

Now, as soon our functions structured, let’s add `kubectl` and `~/.kube/config` there.

You can find official link to current kubectl version for AWS EKS at their [documentation](https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html). You need Linux binary.

```sh
mkdir bin
curl -o kubectl https://amazon-eks.s3-us-west-2.amazonaws.com/1.10.3/2018-07-26/bin/linux/amd64/kubectl
mv kubectl bin/
```

Make `kubectl` executable:

```sh
chmod +x bin/kubectl
```

And `kubectl` configuration:

```sh
mkdir .kube
cp ~/.kube/config .kube/
chmod 644 .kube/config
```

Let’s create update our functions.

As `kubectl` is ~80 Mb of data and compressed function size is ~27 Mb, we’ll continue only with first function. You will be able to create the second one very easily by yourself at the end.

Let’s include necessary files and exclude everything not needed in our functions. To do so add `package:` option to the functions like so:

```yaml
VideoUploadLambdaFunction:
  handler: upload_video/upload_video.handler
  package:
    include:
      - upload_video/**
      - .kube/**
      - bin/**
    exclude:
      - ./**
  events:
    - s3:
        bucket: '${self:service}-${self:provider.stage}-uploads'
        event: s3:ObjectCreated:*
VideoThumbnailLambdaFunction:
  handler: upload_thumbnail/upload_thumbnail.handler
  package:
    include:
      - upload_thumbnail/**
    exclude:
      - ./**
  events:
    - s3:
        bucket: '${self:service}-${self:provider.stage}-thumbnails'
        event: s3:ObjectCreated:*
```

{{< my-picture name="Serverless-Framework-EKS-Create-Lambda-Functions-2-Include-kubectl-and-config" >}}

Such declaration will assemble `VideoUploadLambdaFunction` function and put function source code, `kubectl` and connection config inside, so we could easily use them from our python code in Lambda function.

{{< my-picture name="Serverless-Framework-EKS-Create-Lambda-Functions-3-VideoUploadLambdaFunction-Function-Structure" >}}

At the same time we’re not including `kubectl` and connection config to the `VideoThumbnailLambdaFunction` function.

Let’s redeploy our stack now:

```sh
sls deploy
```

Now, when we have everything necessary in our function, let’s write some python code. Paste this code to `upload_video/upload_video.py` file:

```python
import logging
import os
import subprocess
import shutil

logger = logging.getLogger()
logger.setLevel(logging.INFO)

MY_PATH = os.path.dirname(os.path.realpath(__file__))
ROOT = os.path.abspath(os.path.join(MY_PATH, os.pardir))
DIST_KUBECTL = os.path.join(ROOT, 'bin/kubectl')
DIST_AUTHENTICATOR = os.path.join(ROOT, 'bin/aws-iam-authenticator')
KUBECTL = '/tmp/kubectl'
AUTHENTICATOR = '/tmp/aws-iam-authenticator'
KUBE_CONFIG = os.path.join(ROOT, '.kube/config')

def handler(event, context):

    bucket_name = event['Records'][0]['s3']['bucket']['name']
    file_key = event['Records'][0]['s3']['object']['key']
    logger.info('Reading {} from {}'.format(file_key, bucket_name))

    logger.info('Copying `kubectl` to /tmp to make it executable...')
    shutil.copyfile(DIST_KUBECTL, KUBECTL)
    shutil.copyfile(DIST_AUTHENTICATOR, AUTHENTICATOR)

    logger.info('Making `kubectl` executable...')
    os.chmod(KUBECTL, 0o755)
    logging.info('Now permissions are: {}'.format(oct(os.stat(KUBECTL).st_mode & 0o777)))

    logger.info('Making `aws-iam-authenticator` executable...')
    os.chmod(AUTHENTICATOR, 0o755)
    logging.info('Now permissions are: {}'.format(oct(os.stat(AUTHENTICATOR).st_mode & 0o777)))

    logger.info('Adding /tmp to PATH...')
    os.environ['PATH'] = '{}:/tmp'.format(os.environ['PATH'])

    logger.info('Testing `aws-iam-authenticator`...')
    cmd = 'aws-iam-authenticator token -i aws-eks-spot-serverless-demo-dev'

    logger.info('Execute command: {}'.format(cmd))

    process = subprocess.Popen(
        cmd,
        shell=True,
        cwd='/tmp',
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    out, err = process.communicate()
    errcode = process.returncode

    logger.info(
        'Subprocess exited with code: {}. Output: "{}". Error: "{}"'.format(
            errcode, out, err
        )
    )

    job_description = """
apiVersion: batch/v1
kind: Job
metadata:
  name: make-thumbnail
spec:
  template:
    spec:
      containers:
      - name: make-thumbnail
        image: rupakg/docker-ffmpeg-thumb
        env:
          - name: AWS_REGION
            value: us-east-1
          - name: INPUT_VIDEO_FILE_URL
            value: https://s3.amazonaws.com/{}/{}
          - name: OUTPUT_S3_PATH
            value: aws-eks-spot-serverless-demo-dev-thumbnails
          - name: OUTPUT_THUMBS_FILE_NAME
            value: {}
          - name: POSITION_TIME_DURATION
            value: 00:01
      restartPolicy: Never
  backoffLimit: 4

""".format(
    bucket_name,
    file_key,
    '{}.webp'.format(file_key.split('.')[0])
)

    cmd = 'kubectl --kubeconfig {} create -f -'.format(KUBE_CONFIG)

    logger.info('Trying to execute command: {}'.format(cmd))

    process = subprocess.Popen(
        cmd,
        shell=True,
        cwd='/tmp',
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    out, err = process.communicate(input=job_description.encode())
    errcode = process.returncode

    logger.info(
        'Subprocess exited with code: {}. Output: "{}". Error: "{}"'.format(
            errcode, out, err
        )
    )

    return
```

Sure, there are a lot of things to improve here, but I wanted to show you the basic idea how we may use `kubectl` with EKS from Lambda Functions:

- Put `kubectl` and `aws-iam-authenticator` to Lambda function
- Put `kubectl` config also
- Move `kubectl` and `aws-iam-authenticator` to `/tmp` folder inside Lambda function to be able to make them executable
- Make them executable
- Launch any Kubernetes command using kubectl from Lambda Function

And, yes, I did not build my personal Docker container, but used [Rupak’s](https://www.linkedin.com/in/rupakg/) container ([repo](https://github.com/rupakg/docker-ffmpeg-thumb)) from [his article](https://serverless.com/blog/serverless-application-for-long-running-process-fargate-lambda/) instead. As you can see, everything’s working.

{{< my-picture name="Serverless-Framework-EKS-Lambda-Function-Execution-Result" >}}

Hope, you’ve already checked his article and I do not need to prove, that his solution working.

## Cleaning up

To cleanup everything all you need to do is to run the following command to destroy the infrastructure:

```sh
sls remove
```

## Future improvements

- Using this approach you can launch just only one lambda function, as it’s name hardcoded in job_description variable. To overcome this “problem” you need either delete previously run function, either generate timestamp or id to make your function name unique.
- Sure, we need to refactor the code a little bit (DRY principle)
- Also, you may want to create a Thumbnails Lambda function which can do something with uploaded thumbnails.

## Final words

Passing through both of my articles we’ve learned:

- How to automatically create EKS cluster backed by cheap Spot Instances
- What to do with Lambda Function to manage your EKS cluster

Hope, that article will be useful for you. If so, please, share or like it!

Stay tuned!
