"API Routes for handling Server-Sent Events (SSE)"

import json
import logging
from asyncio import sleep

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

from common.services.auth import JwtUserId
from src.middlewares.client import ClientsFromQuery

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/sse",
    tags=["other"],
)

async def event_getter():
    waypoints = open('waypoints.json')
    waypoints = json.load(waypoints)
    for waypoint in waypoints[0: 10]:
        data = json.dumps(waypoint)
        yield f"event: locationUpdate\ndata: {data}\n\n"
        await sleep(1)

@router.get("")
@router.get("/")
def sse(
    clients: ClientsFromQuery,
    user_id: JwtUserId,
) -> EventSourceResponse:
    return EventSourceResponse(event_getter())
