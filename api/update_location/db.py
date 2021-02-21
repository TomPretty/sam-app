import os

import boto3
from boto3.dynamodb.conditions import Key

USERS_TABLE = os.getenv("USERS_TABLE")

if os.getenv("AWS_SAM_LOCAL"):
    table = boto3.resource(
        "dynamodb", endpoint_url="http://docker.for.mac.localhost:8000/"
    ).Table(USERS_TABLE)
else:
    table = boto3.resource("dynamodb").Table(USERS_TABLE)


def get_user_by_id(user_id):
    response = table.query(KeyConditionExpression=Key("id").eq(user_id))
    return response["Items"]


def update_user_loc(user_id, lat, lon):
    table.update_item(
        Key={
            "id": user_id,
        },
        UpdateExpression="SET loc = :loc",
        ExpressionAttributeValues={":loc": {"lat": str(lat), "lon": str(lon)}},
    )
