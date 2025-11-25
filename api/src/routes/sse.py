"API Routes for handling Server-Sent Events (SSE)"

from asyncio import CancelledError
from logging import getLogger

from fastapi import APIRouter
from aio_pika import AMQPException
from sse_starlette import EventSourceResponse, JSONServerSentEvent

from common.services.auth import JwtUserId
from common.services.mq import MQAioPikaConnection

logger = getLogger(__name__)

router = APIRouter(
    prefix="/sse",
    tags=["other"],
)

async def event_generator(
    mq_connection: MQAioPikaConnection,
    queue_name: str
):
    channel = None
    try:
        channel = await mq_connection.channel()
        queue = await channel.declare_queue(queue_name, auto_delete=True)

        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                async with message.process(ignore_processed=True):
                    await message.ack()
                    yield JSONServerSentEvent({"data": message.body.decode()})

    except AMQPException as e:
        logger.error("Error connecting with RabbitMQ: %s", e)
    except CancelledError as e:
        logger.info("Task cancelled: %s", e)
    finally:
        if channel:
            await channel.close()

@router.get("")
@router.get("/")
def sse(
    user_id: JwtUserId,
    mq_connection: MQAioPikaConnection
) -> EventSourceResponse:
    return EventSourceResponse(event_generator(mq_connection, f"user_queue_{user_id}"))
