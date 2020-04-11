from aws_cdk import (core)
from helpers.ffmpeg_lambda_stack import FfmpegLambdaStack

app = core.App()
FfmpegLambdaStack(app, "ffmpeg-lambda-stack")

app.synth()
