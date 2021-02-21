import json
import os

import boto3

USERS_TABLE = os.getenv("USERS_TABLE")

if os.getenv("AWS_SAM_LOCAL"):
    table = boto3.resource(
        "dynamodb", endpoint_url="http://docker.for.mac.localhost:8000/"
    ).Table(USERS_TABLE)
else:
    table = boto3.resource("dynamodb").Table(USERS_TABLE)


def success(body):
    return {
        "headers": {"Content-Type": "application/json"},
        "statusCode": 200,
        "body": json.dumps(body),
    }


def lambda_handler(event, context):
    """Update a users current location

    Parameters
    ----------
    event: dict, required
        API Gateway Lambda Proxy Input Format

    context: object, required
        Lambda Context runtime methods and attributes

    Returns
    ------
    API Gateway Lambda Proxy Output Format: dict
    """
    response = table.scan()
    users = response["Items"]

    return success(users)
