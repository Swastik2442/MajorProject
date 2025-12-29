"""Functions for dispatching Events."""

from logging import getLogger

import aio_pika
from common.services.mq import mq_service

from .models.base import BaseEventModel

logger = getLogger(__name__)

EXCHANGE_NAME = "live_events"
def RoutingKey(client_id: str) -> str:
    return f"client_{client_id}"

async def send_event(event: BaseEventModel) -> None:
    """Send event to message queue."""

    connection = mq_service.get_aiopika_connection()
    if connection is None:
        logger.warning("AioPika connection is not available. Cannot send event.")
        return

    channel = await connection.channel()
    await channel.declare_exchange(EXCHANGE_NAME, aio_pika.ExchangeType.TOPIC)
    exchange = await channel.get_exchange(EXCHANGE_NAME)

    try:
        await exchange.publish(
            message=aio_pika.Message(
                event.model_dump_json().encode(),
                type=event.event_name,
            ),
            routing_key=RoutingKey(str(event.client_id))
        )
        logger.debug("Sent event '%s' to client %s with data: %s", event.event_name, event.client_id, event.model_dump())
    except aio_pika.AMQPException as e:
        logger.error("Error connecting with RabbitMQ: %s", e)
    except Exception as e:
        logger.error("Unexpected error when sending event: %s", e)
    finally:
        try:
            await channel.close()
        except Exception as e:
            logger.error("Error closing channel: %s", e)
