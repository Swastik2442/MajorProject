from logging import getLogger

import aio_pika
from common.services.mq import mq_service

from .models import Event, ServiceProblem, ServiceProblemRecovery, ServiceProblemUpdate, TriggerAlert, TriggerAlertRecovery, TriggerAlertUpdate

logger = getLogger(__name__)

EXCHANGE_NAME = "live_events"
def RoutingKey(client_id: str) -> str:
    return f"client_{client_id}"

async def send_event(
    event: Event[TriggerAlert | ServiceProblem | TriggerAlertUpdate | ServiceProblemUpdate | TriggerAlertRecovery | ServiceProblemRecovery],
) -> None:
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
                type=event.data.Config.EVENT_NAME,
            ),
            routing_key=RoutingKey(event.client_id)
        )
        logger.debug("Sent event '%s' to client %s with data: %s", event.data.Config.EVENT_NAME, event.client_id, event.data.model_dump())
    except aio_pika.AMQPException as e:
        logger.error("Error connecting with RabbitMQ: %s", e)
    finally:
        await channel.close()
