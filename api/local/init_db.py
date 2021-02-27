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
            put_user("tom", "55.0", "55.0"),
            put_user("harry", "50.0", "50.0"),
            put_user("scott", "60.0", "60.0"),
        ]
    }
)
