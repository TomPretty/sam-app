import json
from typing import Optional

from pydantic import BaseModel, ValidationError

import db
import responses


class UpdateLocationRequest(BaseModel):
    user_id: str
    lat: float
    lon: float


def decode(event: Optional[str]) -> UpdateLocationRequest:
    if not event["body"]:
        return responses.invalid()
    body = json.loads(event["body"])
    return UpdateLocationRequest(
        user_id=body.get("userId"), lat=body.get("lat"), lon=body.get("lon")
    )


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
    try:
        request = decode(event)
    except (json.JSONDecodeError, ValidationError):
        return responses.invalid()

    users = db.get_user_by_id(request.user_id)
    if len(users) == 0:
        return responses.not_found(request.user_id)
    if len(users) > 1:
        return responses.server_error()

    db.update_user_loc(request.user_id, request.lat, request.lon)

    return responses.success()
