#!/usr/bin/env python3

import logging

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

def handler(event, context):
    try:
        raise Exception("Something went wrong")
    except Exception as exception:
        LOGGER.error('Exception: %s', exception)
        raise

if __name__ == "__main__":
    handler(None, None)
