"""Tools for MongoDB aggregation operations."""

from typing import Literal
from langchain.tools import tool
from pydantic import ValidationError

from common.schemas.chartAgg import ChartAgg as ResponseFormat

@tool
def get_response_format() -> dict[str, str]:
    """Get the schema of the response for the LLM."""
    return ResponseFormat.model_json_schema()

@tool
def verify_response_format(response: dict | str) -> Literal[True] | tuple[Literal[False], str]:
    """Verify if the given response matches the ResponseFormat schema."""
    try:
        if isinstance(response, str):
            ResponseFormat.model_validate_json(response)
        else:
            ResponseFormat.model_validate(response)
        return True
    except ValidationError as e:
        return False, str(e)

tools = [
    get_response_format,
    verify_response_format,
]
tools_description = """\
- get_response_format: Get the schema of the response for the LLM.
- verify_response_format: Verify if the given response matches the ResponseFormat schema.
"""
