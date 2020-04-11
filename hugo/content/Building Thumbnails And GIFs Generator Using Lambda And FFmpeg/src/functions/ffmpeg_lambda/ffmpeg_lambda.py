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
    
    content_type = event["headers"]["content-type"]
    
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
