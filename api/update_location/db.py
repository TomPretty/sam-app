import os

import boto3
from boto3.dynamodb.conditions import Key
from boto3_type_annotations.dynamodb import ServiceResource

USERS_TABLE = os.getenv("USERS_TABLE")

if os.getenv("AWS_SAM_LOCAL"):
    table: ServiceResource = boto3.resource(
        "dynamodb", endpoint_url="http://docker.for.mac.localhost:8000/"
    ).Table(USERS_TABLE)
else:
    table: ServiceResource = boto3.resource("dynamodb").Table(USERS_TABLE)


def get_user_by_id(user_id: str):
    response = table.query(KeyConditionExpression=Key("id").eq(user_id))
    return response["Items"]


def update_user_loc(user_id: str, lat: str, lon: str) -> None:
    table.update_item(
        Key={
            "id": user_id,
        },
        UpdateExpression="SET loc = :loc",
        ExpressionAttributeValues={":loc": {"lat": str(lat), "lon": str(lon)}},
    )
