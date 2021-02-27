import boto3
from boto3_type_annotations.dynamodb import Client

client: Client = boto3.client("dynamodb", endpoint_url="http://localhost:8000/")

client.create_table(
    TableName="UsersTable",
    AttributeDefinitions=[
        {
            "AttributeName": "id",
            "AttributeType": "S",
        }
    ],
    KeySchema=[
        {
            "AttributeName": "id",
            "KeyType": "HASH",
        }
    ],
    ProvisionedThroughput={"ReadCapacityUnits": 1, "WriteCapacityUnits": 1},
)


def put_user(name: str, lat: str, lon: str):
    return {
        "PutRequest": {
            "Item": {
                "id": {"S": name},
                "loc": {"M": {"lat": {"S": lat}, "lon": {"S": lon}}},
            }
        }
    }


client.batch_write_item(
    RequestItems={
        "UsersTable": [
            put_user(name="tom", lat="51.749175167519965", lon="-1.23612530854294625"),
            put_user(name="harry", lat="51.751120", lon="-1.231928"),
            put_user(name="scott", lat="51.751657", lon="-1.225209"),
            put_user(name="debug", lat="51.753000", lon="-1.232544"),
        ]
    }
)
