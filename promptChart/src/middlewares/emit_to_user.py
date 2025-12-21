"""Middleware to emit agent and model interactions to the user via RabbitMQ."""

import asyncio
from collections.abc import Awaitable, Callable
from logging import getLogger
from typing import Any, Literal

import aio_pika
from langchain_core.messages import ToolMessage
from langchain.agents.middleware import AgentMiddleware, AgentState
from langchain.tools.tool_node import ToolCallRequest
from langgraph.runtime import Runtime
from langgraph.types import Command
from pika import BasicProperties, BlockingConnection
from pika.adapters.blocking_connection import BlockingChannel
from pika.exceptions import AMQPError
from pika.exchange_type import ExchangeType
from pydantic import BaseModel, Field

from common.models.utils import none
from common.services.mq import mq_service

logger = getLogger(__name__)

class UserMiddlewareContext(BaseModel):
    """Context for EmitToUser middleware."""
    user_id: str
    thread_id: str

EXCHANGE_NAME = "live_events"
def RoutingKey(user_id: str) -> str:
    return f"user_{user_id}"
def EventType(thread_id: str, log_type: Literal["out", "err"]) -> str:
    return f"thread_{thread_id}|{log_type}"

class EventBody(BaseModel):
    thread_id: str
    user_id: str
    entity_type: Literal["agent", "model", "tool"]
    entity_name: str | None = Field(default_factory=none)
    entity_state: Literal["start", "end"]
    message: str | None = Field(default_factory=none)

class EmitToUserMiddleware(AgentMiddleware[AgentState, UserMiddlewareContext]):
    """Middleware to emit agent and model interactions to the user."""

    def __init__(self, agent_name: str = "Agent") -> None:
        super().__init__()
        self.agent_name = agent_name

        self._pika_connection: BlockingConnection | None = None
        self._aiopika_connection: aio_pika.abc.AbstractConnection | None = None
        self._pika_channel: BlockingChannel | None = None
        self._aiopika_channel: aio_pika.abc.AbstractChannel | None = None
        self._aiopika_exchange: aio_pika.abc.AbstractExchange | None = None

    def __del__(self) -> None:
        if self._pika_channel and not self._pika_channel.is_closed:
            self._pika_channel.close()
        if self._aiopika_channel and not self._aiopika_channel.is_closed:
            asyncio.create_task(self._aiopika_channel.close()) # type: ignore

    def _send_event(self, event_type: str, body: EventBody, user_id: str) -> None:
        if self._pika_connection is None:
            self._pika_connection = mq_service.get_pika_connection()
        if self._pika_connection is None:
            logger.warning("Pika connection is not available. Cannot send event.")
            return

        try:
            if self._pika_channel is None or self._pika_channel.is_closed:
                self._pika_channel = self._pika_connection.channel()
                self._pika_channel.exchange_declare(EXCHANGE_NAME, ExchangeType.topic)

            self._pika_channel.basic_publish(
                exchange=EXCHANGE_NAME,
                routing_key=RoutingKey(user_id),
                body=body.model_dump_json().encode(),
                properties=BasicProperties(type=event_type)
            )
            logger.debug("Sent event '%s' to user %s with data: %s", event_type, user_id, body)
        except AMQPError as e:
            logger.error("Error connecting with RabbitMQ: %s", e)

    async def _send_event_async(self, event_type: str, body: EventBody, user_id: str) -> None:
        if self._aiopika_connection is None:
            self._aiopika_connection = mq_service.get_aiopika_connection()
        if self._aiopika_connection is None:
            logger.warning("AioPika connection is not available. Cannot send event.")
            return

        try:
            if self._aiopika_channel is None or self._aiopika_channel.is_closed:
                self._aiopika_channel = await self._aiopika_connection.channel()
            if self._aiopika_exchange is None:
                await self._aiopika_channel.declare_exchange(EXCHANGE_NAME, aio_pika.ExchangeType.TOPIC)
                self._aiopika_exchange = await self._aiopika_channel.get_exchange(EXCHANGE_NAME)

            await self._aiopika_exchange.publish(
                message=aio_pika.Message(
                    body.model_dump_json().encode(),
                    type=event_type,
                ),
                routing_key=RoutingKey(user_id)
            )
            logger.debug("Sent event '%s' to user %s with data: %s", event_type, user_id, body)
        except aio_pika.AMQPException as e:
            logger.error("Error connecting with RabbitMQ: %s", e)

    def before_agent(self, state: AgentState, runtime: Runtime[UserMiddlewareContext]) -> dict[str, Any] | None:
        self._send_event(
            EventType(runtime.context.thread_id, "out"),
            EventBody(
                thread_id=runtime.context.thread_id,
                user_id=runtime.context.user_id,
                entity_type="agent",
                entity_name=self.agent_name,
                entity_state="start",
                message=f"{self.agent_name} starting"
            ),
            runtime.context.user_id
        )

    async def abefore_agent(self, state: AgentState, runtime: Runtime[UserMiddlewareContext]) -> dict[str, Any] | None:
        await self._send_event_async(
            EventType(runtime.context.thread_id, "out"),
            EventBody(
                thread_id=runtime.context.thread_id,
                user_id=runtime.context.user_id,
                entity_type="agent",
                entity_name=self.agent_name,
                entity_state="start",
                message=f"{self.agent_name} starting"
            ),
            runtime.context.user_id
        )

    def after_agent(self, state: AgentState, runtime: Runtime[UserMiddlewareContext]) -> dict[str, Any] | None:
        self._send_event(
            EventType(runtime.context.thread_id, "out"),
            EventBody(
                thread_id=runtime.context.thread_id,
                user_id=runtime.context.user_id,
                entity_type="agent",
                entity_name=self.agent_name,
                entity_state="end",
                message=f"{self.agent_name} finished execution"
            ),
            runtime.context.user_id
        )

    async def aafter_agent(self, state: AgentState, runtime: Runtime[UserMiddlewareContext]) -> dict[str, Any] | None:
        await self._send_event_async(
            EventType(runtime.context.thread_id, "out"),
            EventBody(
                thread_id=runtime.context.thread_id,
                user_id=runtime.context.user_id,
                entity_type="agent",
                entity_name=self.agent_name,
                entity_state="end",
                message=f"{self.agent_name} finished execution"
            ),
            runtime.context.user_id
        )

    def before_model(self, state: AgentState, runtime: Runtime[UserMiddlewareContext]) -> dict[str, Any] | None:
        self._send_event(
            EventType(runtime.context.thread_id, "out"),
            EventBody(
                thread_id=runtime.context.thread_id,
                user_id=runtime.context.user_id,
                entity_type="model",
                entity_state="start",
                message="Calling model"
            ),
            runtime.context.user_id
        )

    async def abefore_model(self, state: AgentState, runtime: Runtime[UserMiddlewareContext]) -> dict[str, Any] | None:
        await self._send_event_async(
            EventType(runtime.context.thread_id, "out"),
            EventBody(
                thread_id=runtime.context.thread_id,
                user_id=runtime.context.user_id,
                entity_type="model",
                entity_state="start",
                message="Calling model"
            ),
            runtime.context.user_id
        )

    def after_model(self, state: AgentState, runtime: Runtime[UserMiddlewareContext]) -> dict[str, Any] | None:
        self._send_event(
            EventType(runtime.context.thread_id, "out"),
            EventBody(
                thread_id=runtime.context.thread_id,
                user_id=runtime.context.user_id,
                entity_type="model",
                entity_state="end",
                message="Model returned"
            ),
            runtime.context.user_id
        )

    async def aafter_model(self, state: AgentState, runtime: Runtime[UserMiddlewareContext]) -> dict[str, Any] | None:
        await self._send_event_async(
            EventType(runtime.context.thread_id, "out"),
            EventBody(
                thread_id=runtime.context.thread_id,
                user_id=runtime.context.user_id,
                entity_type="model",
                entity_state="end",
                message="Model returned"
            ),
            runtime.context.user_id
        )

    def wrap_tool_call(
        self,
        request: ToolCallRequest,
        handler: Callable[[ToolCallRequest], ToolMessage | Command]
    ) -> ToolMessage | Command:
        thread_id = request.runtime.context.thread_id # type: ignore
        user_id = request.runtime.context.user_id # type: ignore
        tool_name = request.tool_call['name']

        self._send_event(
            EventType(thread_id, "out"),
            EventBody(
                thread_id=thread_id,
                user_id=user_id,
                entity_type="tool",
                entity_name=tool_name,
                entity_state="start",
                message=f"Executing tool: {tool_name}"
            ),
            user_id
        )
        try:
            result = handler(request)
            self._send_event(
                EventType(thread_id, "out"),
                EventBody(
                    thread_id=thread_id,
                    user_id=user_id,
                    entity_type="tool",
                    entity_name=tool_name,
                    entity_state="end",
                    message=f"Tool {tool_name} completed successfully"
                ),
                user_id
            )
            return result
        except Exception as e:
            self._send_event(
                EventType(thread_id, "err"),
                EventBody(
                    thread_id=thread_id,
                    user_id=user_id,
                    entity_type="tool",
                    entity_name=tool_name,
                    entity_state="end",
                    message=f"Tool {tool_name} failed"
                ),
                user_id
            )
            raise e

    async def awrap_tool_call(
        self,
        request: ToolCallRequest,
        handler: Callable[[ToolCallRequest], Awaitable[ToolMessage | Command]]
    ) -> ToolMessage | Command:
        thread_id = request.runtime.context.thread_id # type: ignore
        user_id = request.runtime.context.user_id # type: ignore
        tool_name = request.tool_call['name']

        await self._send_event_async(
            EventType(thread_id, "out"),
            EventBody(
                thread_id=thread_id,
                user_id=user_id,
                entity_type="tool",
                entity_name=tool_name,
                entity_state="start",
                message=f"Executing tool: {tool_name}"
            ),
            user_id
        )
        try:
            result = await handler(request)
            await self._send_event_async(
                EventType(thread_id, "out"),
                EventBody(
                    thread_id=thread_id,
                    user_id=user_id,
                    entity_type="tool",
                    entity_name=tool_name,
                    entity_state="end",
                    message=f"Tool {tool_name} completed successfully"
                ),
                user_id
            )
            return result
        except Exception as e:
            await self._send_event_async(
                EventType(thread_id, "err"),
                EventBody(
                    thread_id=thread_id,
                    user_id=user_id,
                    entity_type="tool",
                    entity_name=tool_name,
                    entity_state="end",
                    message=f"Tool {tool_name} failed"
                ),
                user_id
            )
            raise e
