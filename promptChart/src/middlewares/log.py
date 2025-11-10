from collections.abc import Awaitable, Callable
from logging import getLogger
from typing import Any

from langchain_core.messages import ToolMessage
from langchain.agents.middleware import AgentMiddleware, AgentState
from langchain.tools.tool_node import ToolCallRequest
from langgraph.runtime import Runtime
from langgraph.types import Command

logger = getLogger(__name__)

class LoggingMiddleware(AgentMiddleware):
    """Middleware to log agent and model interactions."""

    def __init__(self, agent_name: str = "Agent") -> None:
        super().__init__()
        self.agent_name = agent_name

    def before_agent(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        logger.info("%s starting", self.agent_name)

    async def abefore_agent(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        self.before_agent(state, runtime)

    def after_agent(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        logger.info("%s finished execution with %s messages", self.agent_name, len(state['messages']))

    async def aafter_agent(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        self.after_agent(state, runtime)

    def before_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        logger.info("Calling model with %s messages", len(state['messages']))

    async def abefore_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        self.before_model(state, runtime)

    def after_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        logger.debug("Model returned: %s", state['messages'][-1].content)

    async def aafter_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        self.after_model(state, runtime)

    def wrap_tool_call(
        self,
        request: ToolCallRequest,
        handler: Callable[[ToolCallRequest], ToolMessage | Command]
    ) -> ToolMessage | Command:
        logger.info("Executing tool: %s", request.tool_call['name'])
        logger.debug("Arguments: %s", request.tool_call['args'])

        try:
            result = handler(request)
            logger.debug("Tool %s completed successfully: %s", request.tool_call['name'], result)
            return result
        except Exception as e:
            logger.error("Tool %s failed: %s", request.tool_call['name'], e)
            raise e

    async def awrap_tool_call(
        self,
        request: ToolCallRequest,
        handler: Callable[[ToolCallRequest], Awaitable[ToolMessage | Command]]
    ) -> ToolMessage | Command:
        logger.info("Executing tool: %s", request.tool_call['name'])
        logger.debug("Arguments: %s", request.tool_call['args'])

        try:
            result = await handler(request)
            logger.debug("Tool %s completed successfully: %s", request.tool_call['name'], result)
            return result
        except Exception as e:
            logger.error("Tool %s failed: %s", request.tool_call['name'], e)
            raise e
