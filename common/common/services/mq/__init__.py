"RabbitMQ Service"

from logging import getLogger
from typing import Annotated

from fastapi import Depends

try:
    from aio_pika import connect_robust
    from aio_pika.abc import AbstractConnection
    import pika
except ImportError as e:
    raise ImportError("To work with MQ service, please install using 'pip install common[mq]'.") from e

from common.services import Service

logger = getLogger(__name__)

class MQService(Service):
    def __init__(self) -> None:
        self._pika_connection: pika.BlockingConnection | None = None
        self._aiopika_connection: AbstractConnection | None = None

    def get_pika_connection(self) -> pika.BlockingConnection | None:
        if not hasattr(self, "_pika_connection"):
            raise RuntimeError("Pika connection accessed before initialization")
        return self._pika_connection

    def get_aiopika_connection(self) -> AbstractConnection | None:
        if not hasattr(self, "_aiopika_connection"):
            raise RuntimeError("AioPika connection accessed before initialization")
        return self._aiopika_connection

    async def connect(self, *args, rabbit_host: str = "127.0.0.1", **kwargs) -> None:
        self._pika_connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=rabbit_host)
        )
        self._aiopika_connection = await connect_robust(
            host=rabbit_host,
        )
        logger.info("MQ components connected")

    async def disconnect(self):
        if self._pika_connection and not self._pika_connection.is_closed:
            self._pika_connection.close()
        if self._aiopika_connection and not self._aiopika_connection.is_closed:
            await self._aiopika_connection.close()
        logger.info("MQ components disconnected")

mq_service = MQService()
MQPikaConnection = Annotated[pika.BlockingConnection, Depends(mq_service.get_pika_connection)]
MQAioPikaConnection = Annotated[AbstractConnection, Depends(mq_service.get_aiopika_connection)]

__all__ = [
    "MQService",
    "mq_service",
    "MQPikaConnection",
    "MQAioPikaConnection",
]
