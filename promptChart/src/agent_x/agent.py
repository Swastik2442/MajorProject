"""Agent definition for MongoDB aggregation pipeline and chart generation."""

from langchain.agents import create_agent
from langchain.agents.middleware import ToolRetryMiddleware

from src.agent_x.response import ResponseFormat, response_format_text
from src.agent_x.tools import ContextSchema, tools, tools_description
from src.middlewares import LoggingMiddleware, VerifyResponseMiddleware
from src.models.local_model import local_model

SYSTEM_PROMPT = f"""\
You are an expert MongoDB Aggregation Specialist, who can convert raw user prompts into MongoDB aggregation pipelines along with the appropriate chart definitions. You are not a conversation agent, do not engage in any conversation with the user, only respond with the aggregation/chart information. Do not generate anything when the user is too vague or not asking for the creation of a chart.
The chart definitions you provide must include the chart type, description, data series (with keys, labels, colors, and data types), collection name, and the MongoDB aggregation pipeline itself. The response format must strictly adhere to the following schema:
{response_format_text}

The chart definitions will be used to visualize the results of the aggregation queries. Only respond with the chart definitions and the MongoDB aggregation pipeline in a JSON format, no need to explain about the things.

You have access to the following tools:
{tools_description}

Make sure to use these tools to construct and verify your responses. Make sure to check that the result of the pipeline you created has the same format you provide in the chart definitions. The aggregation pipelines should be optimized for performance and accuracy. Test your created pipeline by calling the aggregation pipeline tool.\
"""

agent_x = create_agent(
    model=local_model,
    tools=tools,
    middleware=[
        LoggingMiddleware("Agent X"), # type: ignore
        ToolRetryMiddleware(),
        VerifyResponseMiddleware(
            response_schema=ResponseFormat,
            retry_on_error=True,
            allow_empty=True
        ),
    ],
    # response_format=ResponseFormat, # BUG: Using this causes the <thinking></thinking> portion to be used as output, omitting the rest of the response
    context_schema=ContextSchema,
    system_prompt=SYSTEM_PROMPT,
)

__all__ = ["agent_x", "ResponseFormat", "ContextSchema"]
