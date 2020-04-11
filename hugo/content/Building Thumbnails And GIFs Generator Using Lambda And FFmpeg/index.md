---
title: 'Building Thumbnails And GIFs Generator Using Lambda And FFmpeg'
date: '2020-09-01'
image: 'Building Thumbnails And GIFs Generator Using Lambda And FFmpeg'
tags:
  - python
  - cloudformation
  - cdk
  - lambda
  - boto3
  - s3
  - api
categories:
  - AWS
authors:
  - Andrei Maksimov
---
# Building Thumbnails And GIFs Generator Using Lambda And FFmpeg

{{< my-picture name="Building Thumbnails And GIFs Generator Using Lambda And FFmpeg" >}}

Not too far ago, somebody asked me to help put FFmpeg inside Lambda function and build a video processing API prototype.

This article will show you how to make all those integrations and build a completely serverless API for generating thumbnails and gif images from uploaded video files.

The heart of the video processing service is a Lambda function with Lambda Layer attached to it with statically linked FFmpeg. This Lambda function is responsible for core business logic:

* Retrieve uploaded video file from the POST request,
* Generate GIF and Thumbnail from the video file,
* Upload generated GIF and Thumbnail to S3,
* Send a user a JSON reply back.

Now, let’s take a look at how all those services may be integrated.

For those of you, who're interested in the code only, please, feel free to grab it from our [GitHub](https://github.com/hands-on-cloud/hands-on.cloud/tree/master/hugo/content/Building%20Thumbnails%20And%20GIFs%20Generator%20Using%20Lambda%20And%20FFmpeg/src)

## Building a prototype

To build a prototype, we’ll take an AWS CDK - a great framework that I recently opened for fast prototyping and implementing solutions for the AWS cloud.

### Project structure

Here’s our project structure:

```sh
tree
.
├── README.md
├── app.py
├── cdk.json
├── functions
│   └── ffmpeg_lambda
│       └── ffmpeg_lambda.py
├── helpers
│   ├── __init__.py
│   └── ffmpeg_lambda_stack.py
├── layers
│   └── ffmpeg_layer
│       ├── Makefile
│       ├── bin
│       │   └── ffmpeg
│       ├── python
│       │   └── lib
│       │       └── python3.7
│       │           └── site-packages
│       │               └── ffmpeg_mgr.py
│       └── requirements.txt
├── requirements.txt
├── small.mp4
└── tests
    └── upload.py

11 directories, 13 files
```

Short description of the files and folders:

* `app.py` - standard AWS CDK application entry point
* `cdk.json` - standard AWS CDK application context
* `functions` - folder, which will content Lamda functions code for AWS CDK application
* `helpers` - folder, which I’m using as a python module to; I’ll store AWS CDK stacks here
* `layers` - folder, which will contain Lambda Layers
* `requirements.txt` - standard Python project requirements
* `small.mp4` - small video file, which we’ll be using for testing of our prototype
* `tests` - folder with the tests you’d like to have

As you can see, we have one Lambda function in `functions/ffmpeg_lambda` folder. And one Lambda layer for this function, which located in `layers/ffmpeg_layer`.

### Lambda Layer

Lambda Layer location:

```sh
layers
└── ffmpeg_layer
    ├── Makefile
    ├── bin
    │   └── ffmpeg
    ├── python
    │   └── lib
    │       └── python3.7
    │           └── site-packages
    │               └── ffmpeg_mgr.py
    └── requirements.txt

6 directories, 4 files
```

As you know, there’s no such thing as Lambda function with the FFmpeg library. And if you need to have it, the best way to get it is to build your Lambda function Layer. AWS gives us excellent documentation about [configuring your own Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html).

Here, the general idea is to create a ZIP archive with a folder structure to be mounted to the Lambda function during its execution. So, we’ll need:

* [Statically build FFmpeg](https://johnvansickle.com/ffmpeg/) for amd64 architecture (`ffmpeg` executable placed inside the `bin` folder)
* A Python FFmpeg wrapper class (`python/lib/python3.7/site-packages/ffmpeg_mgr.py`) - it is convenient to import this class from your Lambda function code to execute `ffmpeg` commands; code upgrades are straightforward too, as you may publish new Lambda Layer separately and test your code independently.

Layer code for making GIFs and thumbnails:

```py
import os
import subprocess

def ffmpeg_version():
    p = subprocess.Popen(["ffmpeg", "-version"], stdout=subprocess.PIPE)
    out = p.stdout.read()

    return out

def ffmpeg_thumbnail(video_file_path, tumbnail_path):
    print("Creating thumbnail...")
    cmd = [
        "ffmpeg",
        "-i",
        video_file_path,
        "-ss",
        "00:00:01.000",
        "-vframes",
        "1",
        tumbnail_path
    ]
    print(f"Command: {cmd}")
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    out = p.stdout.read()

    return out

def ffmpeg_gif(video_file_path, gif_path):
    print("Creating gif...")
    cmd = [
        "ffmpeg",
        "-i",
        video_file_path,
        "-ss",
        "1.0",
        "-t",
        "2.0",
        "-f",
        "gif",
        gif_path
    ]
    print(f"Command: {cmd}")
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    out = p.stdout.read()

    return out
```

Again, the code is not ideal, as it is just a prototype. You need to consider parameterizing `ffmpeg` arguments for `ffmpeg_thumbnail` and `ffmpeg_gif` functions. Other code improvements may be applied, but the current example is easy to read and understand.

We provide sources and destinations file paths for every function and make a `ffmpeg` call to do its job.

Here’s a couple of great articles, which I used to find the fight `ffmpeg` command:

* [How to create GIFs with FFmpeg](https://engineering.giphy.com/how-to-make-gifs-with-ffmpeg/) (GYPHY Engineering blog)
* [Create thumbnail from video using ffmpeg](https://stackoverflow.com/questions/27145238/create-thumbnail-from-video-using-ffmpeg) (Example from Stackoverflow)

Additionally, I added `Makefile` and `requirements.txt` to the `layers` folder if you do not want to use AWS CDK and want to build Lambda Layer manually.

`Makefile` content:

```sh
.PHONY: clean

PYTHON_VER=python3.7
_PKG_NAME=$(PYTHON_VER)_ffmpeg_common
DOT:= .
NOTHING:=
PKG_NAME=$(subst $(DOT),$(NOTHING),$(_PKG_NAME))
PKG_DIR=$(PKG_NAME)/python/lib/$(PYTHON_VER)/site-packages

all: package

package:
	docker run --rm -v `pwd`:/src -w /src python /bin/bash -c "mkdir -p $(PKG_NAME) && \
	mkdir -p $(PKG_DIR) && \
	apt-get update && \
	apt-get -y install zip && \
	pip install -r requirements.txt -t $(PKG_DIR) && \
	mkdir -p $(PKG_NAME)/bin && \
	wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz && \
	tar -xJf ffmpeg-release-amd64-static.tar.xz && \
	cp ffmpeg-4.3.1-amd64-static/ffmpeg $(PKG_NAME)/bin/ && \
	chmod +x $(PKG_NAME)/bin/* && \
	rm -Rf ffmpeg-* && \
	cd $(PKG_NAME) && \
	zip -9 --symlinks -r ../$(PKG_NAME).zip . && \
	cd .."

deploy:
	aws lambda publish-layer-version --layer-name $(PKG_NAME) --zip-file fileb://$(PKG_NAME).zip

clean:
	rm -Rf $(PKG_NAME)
	rm -Rf $(PKG_NAME).zip
```

Here I’m using Python Docker image to build a Lambda function layer. I’ve covered the process in more detail in [Creating and deploying your first Python 3 AWS Lambda Function](https://hands-on.cloud/how-to-create-and-deploy-your-first-python-aws-lambda-function/) article.

The `layers/ffmpeg_layer/requirements.txt` file contains additional Python dependencies you may need. Right now it contains conly `requests_toolbelt`, which is used to process POST request in Lambda function.

### Lambda function

Lambda function location:

```sh
functions
└── ffmpeg_lambda
    └── ffmpeg_lambda.py

1 directory, 1 file
```

The code is not very difficult:

```py
import base64
import json
import os
import re
import ffmpeg_mgr as mgr
import boto3
from requests_toolbelt.multipart import decoder

UPLOAD_BUCKET = os.environ.get('BUCKET')

s3_client = boto3.client('s3')

def post_file(event, context):
    print(f'event={event}')

    content_type = event["headers"]["Content-Type"]

    if 'multipart/form-data' in content_type:
        if isinstance(event['body'], str):
            event['body'] = base64.b64decode(bytes(event['body'], 'utf-8'))

    multipart_data = decoder.MultipartDecoder(event['body'], content_type)

    for part in multipart_data.parts:
        content_disposition = part.headers.get(b'Content-Disposition',b'').decode('utf-8')
        media_name = re.findall("filename=\"(.+)\"", content_disposition)[0]
        media_path = os.path.join('/tmp', media_name)

        with open(media_path, "wb") as v_file:
            v_file.write(part.content)

        name = media_name.split('.')[:1][0]
        # Thumbnail
        thumb_name = f'{name}.png'
        thumb_path = os.path.join('/tmp', thumb_name)
        mgr.ffmpeg_thumbnail(media_path, thumb_path)
        # Gif
        gif_name = f'{name}.gif'
        gif_path = os.path.join('/tmp', gif_name)
        mgr.ffmpeg_thumbnail(media_path, gif_path)
        # S3 Upload
        s3_client.upload_file(media_path, UPLOAD_BUCKET, media_name)
        s3_client.upload_file(thumb_path, UPLOAD_BUCKET, thumb_name)
        s3_client.upload_file(gif_path, UPLOAD_BUCKET, gif_name)

        site_name = 'https://hands-on.cloud'

        return {
            'mediaURL': f'{site_name}/{media_name}',
            'gifURL': f'{site_name}/{gif_name}',
            'thumbnURL': f'{site_name}/{thumb_name}'
        }

def handler(event, context):
    _response = {}

    if event['requestContext']['httpMethod'] == 'POST':
        _response = post_file(event, context)
    else:
        _response = {
            'err': 'Method not supported'
        }
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(_response)
    }
```

Code logic:

* Process the POST `multipart/form-data` request only.
* Decode received vide file from base64 string.
* Save a video file to the Lambda function `/tmp` folder.
* Launch the wrapper module from the Lambda layer a couple of times to create GIF and thumbnail.
* Use `boto3` S3 client to upload results to some S3 bucket (obtained from ENV variable).
* Return some JSON structure to the client.

### AWS CDK part

The first thing we need to cover here, is the AWS CDK application entrypoint - `app.py`:

```py
from aws_cdk import (core)
from helpers.ffmpeg_lambda_stack import FfmpegLambdaStack

app = core.App()
FfmpegLambdaStack(app, "ffmpeg-lambda-stack")

app.synth()
```

Again, nothing complicated.

Code logic:

* Import AWS CDK core module
* Import our stack declaration from the helper module
* Use the stack declaration as a part of the AWS CDK application.

Content of the `ffmpeg_lambda_stack.py` file:

```py
from aws_cdk import (
    aws_lambda as _lambda,
    core,
    aws_iam,
    aws_apigateway as apigw,
    aws_s3 as s3
)
from aws_cdk.aws_iam import PolicyStatement
from aws_cdk.aws_lambda import LayerVersion, AssetCode


class FfmpegLambdaStack(core.Stack):

    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        testLambda : _lambda.Function = FfmpegLambdaStack.cdkResourcesCreate(self)

        projectPolicy = FfmpegLambdaStack.createPolicy(self, testLambda)

        apigw.LambdaRestApi(
            self, 'Endpoint',
            handler=testLambda,
            binary_media_types=['multipart/form-data']
        )

    @staticmethod
    def createPolicy(this, testLambda:_lambda.Function) -> None:
        projectPolicy:PolicyStatement = PolicyStatement(
            effect=aws_iam.Effect.ALLOW,
            resources=[testLambda.function_arn],
            actions=[ "s3:*",
                      "logs:CreateLogGroup",
                      "logs:CreateLogStream",
                      "logs:PutLogEvents"
                    ]
        )
        return projectPolicy

    @staticmethod
    def cdkResourcesCreate(self) -> None:
        bucket = s3.Bucket(self, "my-bucket-with-ffmpeg-thumbnails")

        lambdaFunction:_lambda.Function = _lambda.Function(self, 'ffmpeg_lambda',
                                                           function_name='ffmpeg_lambda',
                                                           handler='ffmpeg_lambda.handler',
                                                           runtime=_lambda.Runtime.PYTHON_3_7,
                                                           code=_lambda.Code.asset('functions/ffmpeg_lambda'),
                                                           timeout=core.Duration.seconds(900),
                                                           environment=dict(BUCKET=bucket.bucket_name)
                                                           )
        bucket.grant_read_write(lambdaFunction)

        ac = AssetCode("layers/ffmpeg_layer")
        layer  = LayerVersion(self, "ffmpeg_layer", code=ac, description="ffmpeg_layer", layer_version_name='ffmpeg_4_3_1_layer')
        lambdaFunction.add_layers(layer)

        return lambdaFunction
```

This code is not mine. I reused and modified already existing Stackoverflow solution:

* [How to deploy and attach a layer to aws lambda function using aws CDK and Python](https://stackoverflow.com/a/59716561/5148918)

Code logic:

* Import all necessary modules we need to use to build a complete infrastructure.
* Declare `FfmpegLambdaStack` class, which will be converted to the CloudFormation stack to deploy everything.

The most important parts of this stack:

* `binary_media_types` attribute for API Gateway - without this parameter created, API Gateway will pass the file object in correct base64 format. This problem is covered in [How to upload files to lambda function or API Gateway?](https://stackoverflow.com/questions/31645205/how-to-upload-file-to-lambda-function-or-api-gateway) StackOverflow discussion.
* `cdkResourcesCreate` function creates an S3 bucket, Lambda layer, Lambda function, and ties everything together.

### Deployment

{{< asciinema id="357226">}}

The deployment process is straightforward. First, we need to install a Python environment, all required modules, and bootstrap the CDK:

```sh
python3 -m venv .env
source .env/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
```

As AWS CDK does not control your Python dependencies for the Lambda Layer, so you need to do it yourself:

```sh
pip install -r layers/ffmpeg_layer/requirements.txt \
    -t layers/ffmpeg_layer/python/lib/python3.7/site-packages/
```

Now you can deploy everything:

```sh
cdk bootstrap

cdk deploy
```

### Testing

Testing is very important part of any development ptocess. I used very simple Python app (`tests/upload.py`):

```py
import os
import requests
import sys
import hashlib
from requests_toolbelt.multipart.encoder import MultipartEncoder

url = sys.argv[1]

os.system('curl -v -F "file=@small.mp4;type=video/mp4" "' + url + '"')

hexdigest = hashlib.md5(open("small.mp4", "rb").read()).hexdigest()

print(f"md5(small.mp4)={hexdigest}")
```

`small.mp4` obtained from [Sample WebM, Ogg, and MP4 Video Files for HTML5](http://techslides.com/sample-webm-ogg-and-mp4-video-files-for-html5).

### Cleaning up

To clean up everything, execute the following command:

```sh
cdk destroy
```

## Architecture improvements

As soon as I heard about this service architecture, I immediately proposed several improvements. So today, I’ll not only show you how to use FFmpeg in your Lambdas but also provide a couple of improvements for the above architecture.

While our prototype shows necessary service integrations, it has several significant constraints, which I recommend you to fix in your solutions:

* **Synchronous request processing** - the user have to wait till processing operation finishes to get a response back; I strongly recommend to consider asynchronous architecture (I’ll show an example below)
* **Monolithic architecture pattern** - the service bases on a single Lambda function, which does all the operations sequentially - by the ask, it has to be only one Lambda function with no asynchronous workflow using the Step Function state machine.
* **Processing file uploads through API Gateway** - even if we have [Binary Support for API Integrations for API Gateway](https://aws.amazon.com/blogs/compute/binary-support-for-api-integrations-with-amazon-api-gateway/), this method has some significant constraints. Again, I strongly suggest considering another architecture pattern for processing uploaded user files.

So, if we try to implement some of my advice, we should come to something like that:

{{< my-picture name="Building Thumbnails And GIFs Generator Using Lambda And FFMPEG Better approach" >}}

The ideas are simple:

* **Offload users uploads to S3** - use pre-signed URLs to upload any content directly to S3 and use standard patter to trigger any process based on this event. For more information, please, review [S3 Uploads — Proxies vs. Presigned URLs vs. Presigned POSTs](https://medium.com/@zaccharles/s3-uploads-proxies-vs-presigned-urls-vs-presigned-posts-9661e2b37932) article.
* **Use State Functions to control your business logic execution flow** - this gives you many additional features like more enhanced ways to handle errors, retry logic, failbacks, etc.
* **Use asynchronous processes wherever possible** - it leads to way better customer experience when you are launching a long-running process in the background and showing your customer a nice “processing” animation. You may update the web page as soon as the status of the process changes or notice your customer by email.
* **Decouple everything** - In the Step Function state machine, we have three different Lambda functions that do the job; each function does its small piece of the whole logic; it’s much easier to avoid errors during updates.

## Summary

In this article, we integrated AWS API Gateway with AWS Lambda to process POST file uploads. We also built a Lambda function, which uses FFMpeg to create GIFs and thumbnails from uploaded videos. And finally, we improved the initial architecture.

I hope this article will help you to save some time. If you found it useful, please, help us spread it to the world!
