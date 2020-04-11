# API Gateway Lambda ffmpeg Example

This project deploys AWS API Gateway with Lambda, which accepts POST mpg file, converts it, creates thmbnail and uploads everything to S3 bucket.

![Building Thumbnails And GIFs Generator Using Lambda And FFmpeg](https://hands-on.cloud/building-thumbnails-and-gifs-generator-using-lambda-and-ffmpeg/Building%20Thumbnails%20And%20GIFs%20Generator%20Using%20Lambda%20And%20FFmpeg.png)

This project is an illustration to the blog article [Building Thumbnails And GIFs Generator Using Lambda And FFmpeg](https://hands-on.cloud/building-thumbnails-and-gifs-generator-using-lambda-and-ffmpeg/).

<a href="https://asciinema.org/a/357226" target="_blank"><img src="https://asciinema.org/a/357226.svg" /></a>

## Project structure

* `functions` - contains Lambda functions code; every function need to be placed in its own folder
* `layers` - contains Lambda function layers; every layer need to be placed in its own folder
* `helpers` - helper contains CDK construct to deploy ffmpeg lambda layer

### ffmpeg

Static ffmpeg version obtained from [https://johnvansickle.com/ffmpeg/](https://johnvansickle.com/ffmpeg/)

## Bootstrap

```sh
python3 -m venv .env
source .env/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

cdk bootstrap
```

## Deploy

```sh
# Updating python dependencies for Lambda Layer
pip install -r layers/ffmpeg_layer/requirements.txt \
    -t layers/ffmpeg_layer/python/lib/python3.7/site-packages/

cdk deploy
```

## Cleanup

```sh
cdk destroy
```
