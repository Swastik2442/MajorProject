"""Tools for the agent."""

from .mongo import MongoDBAggContext, tools as mongo_tools, tools_description as mongo_tools_description
from .response import tools as response_tools, tools_description as response_tools_description

class ContextSchema(MongoDBAggContext):
    """Context schema for agent tools."""

tools = mongo_tools + response_tools
tools_description = mongo_tools_description + response_tools_description
