import json


def not_found(user_id):
    return {
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "statusCode": 404,
        "body": json.dumps({"message": f"User: '{user_id}' not found"}),
    }


def server_error():
    return {
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "statusCode": 500,
        "body": json.dumps({"message": "Internal server error"}),
    }


def invalid():
    return {
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "statusCode": 422,
        "body": json.dumps({"message": "Invalid body"}),
    }


def success():
    return {
        "headers": {
            "Access-Control-Allow-Origin": "*",
        },
        "statusCode": 204,
    }
