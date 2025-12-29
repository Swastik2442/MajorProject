"""Middleware to verify model responses against a specified schema."""

from logging import getLogger
from typing import Any

from langchain.agents.middleware import AgentMiddleware, AgentState, hook_config
from langchain.messages import HumanMessage
from langgraph.runtime import Runtime
from pydantic import BaseModel

logger = getLogger(__name__)

class VerifyResponseMiddleware(AgentMiddleware):
    """Middleware to verify model responses."""

    def __init__(
        self,
        response_schema: type[BaseModel],
        retry_on_error: bool = False,
        allow_empty: bool = False
    ) -> None:
        super().__init__()
        self.response_schema = response_schema
        self.retry_on_error = retry_on_error
        self.allow_empty = allow_empty

    @hook_config(can_jump_to=["model"])
    def after_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        response = state['messages'][-1].content
        if isinstance(response, str):
            if len(response.strip()) == 0 and self.allow_empty:
                logger.info("Empty response allowed by configuration.")
                return
            try:
                self.response_schema.model_validate_json(response)
                logger.info("Response validation succeeded.")
            except Exception as e:
                logger.error("Response validation failed: %s", e)

                if self.retry_on_error:
                    logger.info("Retrying model due to validation failure.")
                    return {
                        "messages": [HumanMessage(
                            content=f"The previous response was invalid ({e}). Please try again following the specified format."
                        )],
                        "jump_to": "model"
                    }
        else:
            logger.warning("Response is not a string; validation not implemented yet.")

    @hook_config(can_jump_to=["model"])
    async def aafter_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        return self.after_model(state, runtime)
