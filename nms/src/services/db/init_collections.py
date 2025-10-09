"""Initialize database collections"""

from pymongo import ASCENDING
from pymongo.asynchronous.database import AsyncDatabase

from src.models import Client, Problem, Service
from src.models.utils import fields

async def init_collections(db: AsyncDatabase) -> None:
    """Initialize database collections"""

    await db[Client.Meta.collection_name()].create_index([
        (fields(Client).ownerId, ASCENDING)
    ], unique=True)

    await db[Problem.Meta.collection_name()].create_index([
        (fields(Problem).zid, ASCENDING), (fields(Problem).clientId, ASCENDING)
    ], unique=True)

    await db[Service.Meta.collection_name()].create_index([
        (fields(Service).zid, ASCENDING), (fields(Service).clientId, ASCENDING)
    ], unique=True)
