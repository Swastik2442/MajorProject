"API Routes for handling Server-Sent Events (SSE)"

from asyncio import CancelledError, shield
from collections.abc import Sequence
from logging import getLogger

from aio_pika import AMQPException, ExchangeType
from common.services.auth import JwtUserId
from common.services.mq import MQAioPikaConnection
from fastapi import APIRouter
from sse_starlette import EventSourceResponse, JSONServerSentEvent

from src.middlewares.client import ClientsFromQuery

logger = getLogger(__name__)

router = APIRouter(
    prefix="/sse",
    tags=["SSE"],
)

async def event_generator(
    mq_connection: MQAioPikaConnection,
    routing_keys: Sequence[str]
):
    channel = None
    try:
        channel = await mq_connection.channel()
        exchange = await channel.declare_exchange("live_events", ExchangeType.TOPIC)
        queue = await channel.declare_queue(exclusive=True, auto_delete=True)

        for key in routing_keys:
            await queue.bind(exchange, routing_key=key)

        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                async with message.process(ignore_processed=True):
                    await message.ack()
                    yield JSONServerSentEvent(
                        data={"data": message.body.decode()},
                        event=message.type or "message",
                        id=message.message_id
                    )

    except AMQPException as e:
        logger.error("Error connecting with RabbitMQ: %s", e)
    except CancelledError as e:
        logger.info("Task cancelled: %s", e)
    finally:
        if channel and not channel.is_closed:
            try:
                await shield(channel.close())
            except CancelledError:
                logger.debug("Channel close was cancelled; ignoring during cleanup.")

@router.get("")
@router.get("/")
def sse(
    clients: ClientsFromQuery,
    user_id: JwtUserId,
    mq_connection: MQAioPikaConnection
) -> EventSourceResponse:
    return EventSourceResponse(
        event_generator(
            mq_connection,
            (f"user_{user_id}", *map(lambda c: f"client_{c.id}", clients))
        )
    )
