from langchain.agents import create_agent

from models.local_model import model
from agent_x.utils.memory import checkpointer
from agent_x.utils.responses import ResponseFormat
from agent_x.utils.tools import Context, get_weather_for_location, get_user_location

agent = create_agent(
    model=model,
    tools=[get_weather_for_location, get_user_location],
    context_schema=Context,
    response_format=ResponseFormat,
    checkpointer=checkpointer,
    system_prompt="You are a helpful assistant",
)
