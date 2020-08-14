#!/usr/bin/env python3

import os
import logging
import boto3

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

DST_BUCKET = os.environ.get('DST_BUCKET')
REGION = os.environ.get('REGION')

s3 = boto3.resource('s3', region_name=REGION)

def handler(event, context):
    LOGGER.info('Event structure: %s', event)
    LOGGER.info('DST_BUCKET: %s', DST_BUCKET)

    for record in event['Records']:    
        src_bucket = record['s3']['bucket']['name']
        src_key = record['s3']['object']['key']

        copy_source = {
            'Bucket': src_bucket,
            'Key': src_key
        }
        LOGGER.info('copy_source: %s', copy_source)
        bucket = s3.Bucket(DST_BUCKET)
        bucket.copy(copy_source, src_key)

    return {
        'status': 'ok'
    }
