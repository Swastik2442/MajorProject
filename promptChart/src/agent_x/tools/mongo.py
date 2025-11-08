"""Tools for MongoDB aggregation operations."""

from pydantic import BaseModel
from langchain.tools import tool, ToolRuntime

from common.models import Problem, Service
from common.services.db import db_service

class MongoDBAggContext(BaseModel):
    """Context for MongoDB aggregation tool."""
    client_ids: list[str]

# TODO: Add actual MongoDB interaction logic here
@tool
async def run_mongodb_aggregation(
    runtime: ToolRuntime[MongoDBAggContext],
    collection_name: str,
    aggregation_pipeline: list[dict]
) -> list[dict]:
    """Run a MongoDB aggregation pipeline on the specified collection."""
    db = await db_service.get_db()
    try:
        result = await db[collection_name].aggregate(aggregation_pipeline)
        documents = await result.to_list(length=None)
        return documents
    except Exception as e:
        return [{"error": str(e)}]
    # # Mocked response for demonstration purposes
    # return [{"mocked_key": "mocked_value - aggregation result is being mocked for now"}]

@tool
def get_available_collections() -> dict[str, str]:
    """Retrieve the list of available MongoDB collections."""
    return {
        m.Meta.collection_name(): m.__doc__ if m.__doc__ is not None else "No description provided."
        for m in [Problem, Service]
    }

@tool
def get_collection_schema(collection_name: str) -> dict:
    """Retrieve the schema of the specified MongoDB collection."""
    # Mocked response for demonstration purposes
    return {
        m.Meta.collection_name(): m.model_json_schema()
        for m in [Problem, Service]
    }.get(collection_name, {})

tools = [
    run_mongodb_aggregation,
    get_available_collections,
    get_collection_schema,
]
tools_description = """\
- run_mongodb_aggregation: Run a MongoDB aggregation pipeline on the specified collection.
- get_available_collections: Retrieve map of available MongoDB collections and their descriptions.
- get_collection_schema: Retrieve the schema of the specified MongoDB collection.
"""
