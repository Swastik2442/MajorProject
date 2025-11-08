"""Tools for MongoDB aggregation operations."""

from typing import Annotated

from pydantic import BaseModel
from langchain.tools import tool, ToolRuntime

from common.models import Problem, Service

class MongoDBAggContext(BaseModel):
    """Context for MongoDB aggregation tool."""
    client_ids: list[str]

# TODO: Add actual MongoDB interaction logic here
@tool
def run_mongodb_aggregation(
    runtime: ToolRuntime[MongoDBAggContext],
    collection_name: str,
    aggregation_pipeline: list[dict]
) -> list[dict]:
    """Run a MongoDB aggregation pipeline on the specified collection."""
    # Mocked response for demonstration purposes
    return [{"mocked_key": "mocked_value"}]

@tool
def get_available_collections() -> list[str]:
    """Retrieve the list of available MongoDB collections."""
    # Mocked response for demonstration purposes
    return ["weather_data", "user_profiles", "sales_records"]

@tool
def get_collection_schema(collection_name: str) -> dict:
    """Retrieve the schema of the specified MongoDB collection."""
    # Mocked response for demonstration purposes
    return {
        "weather_data": {
            "date": "date",
            "temperature": "number",
            "humidity": "number",
            "location": "string"
        },
        "user_profiles": {
            "user_id": "string",
            "name": "string",
            "age": "number",
            "signup_date": "date"
        },
        "sales_records": {
            "order_id": "string",
            "product": "string",
            "quantity": "number",
            "price": "number",
            "sale_date": "date"
        }
    }.get(collection_name, {})

tools = [
    run_mongodb_aggregation,
    get_available_collections,
    get_collection_schema,
]
tools_description = """\
- run_mongodb_aggregation: Run a MongoDB aggregation pipeline on the specified collection.
- get_available_collections: Retrieve the list of available MongoDB collections.
- get_collection_schema: Retrieve the schema of the specified MongoDB collection.
"""
