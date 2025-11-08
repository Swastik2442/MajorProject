"""Agent definition for MongoDB aggregation pipeline and chart generation."""

from langchain.agents import create_agent

from models.local_model import model
from agent_x.memory import checkpointer
from agent_x.response import ResponseFormat
from agent_x.tools import tools, tools_description

SYSTEM_PROMPT = f"""\
You are an expert MongoDB Aggregation Specialist, who can convert raw user prompts into MongoDB aggregation pipelines along with the appropriate chart definitions.
The chart definitions you provide must include the chart type, description, data series (with keys, labels, colors, and data types), collection name, and the MongoDB aggregation pipeline itself. The chart definitions will be used to visualize the results of the aggregation queries.

You have access to the following tools:
{tools_description}

Use these tools to construct your responses. Make sure to check that the result of the pipeline you created has the same format you provide in the chart definitions. The aggregation pipelines should be optimized for performance and accuracy.\
"""

agent = create_agent(
    model=model,
    tools=tools,
    response_format=ResponseFormat,
    checkpointer=checkpointer,
    system_prompt=SYSTEM_PROMPT,
)

__all__ = ["agent", "ResponseFormat"]
