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
