"""Tools for MongoDB aggregation operations."""

from pydantic import BaseModel, ConfigDict, Field
from pymongo.asynchronous.database import AsyncDatabase
from langchain.tools import tool, ToolRuntime

from common.models import Problem, Service

AVAILABLE_COLLECTIONS = [Problem, Service]

# Ref: https://github.com/langchain-ai/langchain-mongodb/blob/main/libs/langchain-mongodb/langchain_mongodb/agent_toolkit/tool.py#L20
class MongoDBAggContext(BaseModel):
    """Context for MongoDB aggregation tool."""
    db: AsyncDatabase = Field(exclude=True)
    client_ids: list[str]

    model_config = ConfigDict(arbitrary_types_allowed=True)

@tool
async def run_mongodb_aggregation(
    runtime: ToolRuntime[MongoDBAggContext],
    collection_name: str,
    aggregation_pipeline: list[dict]
) -> list[dict]:
    """Run a MongoDB aggregation pipeline on the specified collection."""
    if collection_name not in [m.Meta.collection_name() for m in AVAILABLE_COLLECTIONS]:
        return [{"error": f"Collection '{collection_name}' is not available."}]

    client_ids = runtime.context.client_ids
    db = runtime.context.db
    try:
        result = await db[collection_name].aggregate([
            {"$match": {"clientId": {"$in": client_ids}}}, # Only allow access to specified client IDs
            *aggregation_pipeline
        ])
        documents = await result.to_list(length=None)
        return documents # TODO: Only let the model read a summary, not the actual documents
    except Exception as e:
        return [{"error": f"An error occurred while running the aggregation pipeline: {e}"}]

# @tool
def get_available_collections() -> dict[str, str]:
    """Retrieve a map of available MongoDB collections and their descriptions."""
    return {
        m.Meta.collection_name(): (m.__doc__ if m.__doc__ is not None else "No description")
        for m in AVAILABLE_COLLECTIONS
    }

@tool
def get_collection_schema(collection_name: str) -> dict | None:
    """Retrieve the schema of the specified MongoDB collection."""
    return {
        m.Meta.collection_name(): m.model_json_schema()
        for m in AVAILABLE_COLLECTIONS
    }.get(collection_name)

tools = [
    run_mongodb_aggregation,
    get_available_collections,
    get_collection_schema,
]
tools_description = """\
- run_mongodb_aggregation: Run a MongoDB aggregation pipeline on the specified collection.
- get_available_collections: Retrieve a map of available MongoDB collections and their descriptions.
- get_collection_schema: Retrieve the schema of the specified MongoDB collection.
"""
