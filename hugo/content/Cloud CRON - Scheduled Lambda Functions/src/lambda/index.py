"""
Lambda function to remove outdated AMIs
All credits: https://gist.github.com/luhn/802f33ce763452b7c3b32bb594e0d54d
"""
import logging
import os
import re
import sys
from datetime import datetime, timedelta
import boto3

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

ACCOUNT_ID = os.environ.get('ACCOUNT_ID')
AMI_MAX_AGE = int(os.environ.get('AMI_MAX_AGE', 14))

EC2 = boto3.resource("ec2")
EC2_CLIENT = boto3.client("ec2")

def handler(event, context):
    """handler method"""
    # pylint: disable=R0914,C0103,W0613

    my_amis = EC2_CLIENT.describe_images(Owners=[ACCOUNT_ID])['Images']

    used_amis = {
        instance.image_id for instance in EC2.instances.all()
    }

    LOGGER.info('used_amis: %s', used_amis)

    fresh_amis = set()
    for ami in my_amis:
        created_at = datetime.strptime(
            ami['CreationDate'],
            "%Y-%m-%dT%H:%M:%S.000Z",
        )
        if created_at > datetime.now() - timedelta(AMI_MAX_AGE):
            fresh_amis.add(ami['ImageId'])

    LOGGER.info('fresh_amis: %s', fresh_amis)

    latest = dict()
    for ami in my_amis:
        created_at = datetime.strptime(
            ami['CreationDate'],
            "%Y-%m-%dT%H:%M:%S.000Z",
        )
        name = ami['Name']
        if(
                name not in latest
                or created_at > latest[name][0]
        ):
            latest[name] = (created_at, ami)
    latest_amis = {ami['ImageId'] for (_, ami) in latest.values()}

    LOGGER.info('latest_amis: %s', latest_amis)

    safe = used_amis | fresh_amis | latest_amis
    for image in (
            image for image in my_amis if image['ImageId'] not in safe
    ):
        LOGGER.info('Deregistering %s (%s)', image['Name'], image['ImageId'])
        EC2_CLIENT.deregister_image(ImageId=image['ImageId'])

    LOGGER.info('Deleting snapshots.')
    images = [image['ImageId'] for image in my_amis]
    for snapshot in EC2_CLIENT.describe_snapshots(OwnerIds=[ACCOUNT_ID])['Snapshots']:
        LOGGER.info('Checking %s', snapshot['SnapshotId'])
        r = re.match(r".*for (ami-.*) from.*", snapshot['Description'])
        if r:
            if r.groups()[0] not in images:
                LOGGER.info('Deleting %s', snapshot['SnapshotId'])
                EC2_CLIENT.delete_snapshot(SnapshotId=snapshot['SnapshotId'])

if __name__ == "__main__":
    handler(None, None)
